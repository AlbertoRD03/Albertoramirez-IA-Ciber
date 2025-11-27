const config = require('../config');

const GROK_URL = 'https://api.x.ai/v1/chat/completions';

const SYSTEM_PROMPT = `
Eres un asistente que juega "Piedra, Papel o Tijeras" en español.
Debes responder SOLO en el formato indicado.
Si finish es false: responde un JSON con esta forma exacta:
{
  "next_move": "papel|piedra|tijeras",
  "analysis": {
    "predictability_percentage": 0-100 con dos decimales,
    "player_next_move_prediction": "papel|piedra|tijeras"
  }
}
Si finish es true: responde texto plano en español con el análisis final del patrón del jugador, desviaciones y predictibilidad final.
No incluyas explicaciones adicionales fuera del formato pedido.
`;

const ensureHeaders = () => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${config.grokApiKey}`,
});

const extractJson = (content) => {
  try {
    return JSON.parse(content);
  } catch (err) {
    // intenta extraer bloque JSON dentro de texto
    const match = content.match(/(\{[\s\S]*\})/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw err;
  }
};

const parseGrokResponse = async (resp, finish) => {
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Grok error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Respuesta de Grok vacía');
  }
  if (finish) return content;
  // Try to parse JSON content for round response
  try {
    return extractJson(content);
  } catch (err) {
    throw new Error('Respuesta de Grok no es JSON válido');
  }
};

/**
 * Llama a Grok para generar jugada o análisis final.
 * @param {object} payload cuerpo recibido por nuestra API
 * @param {boolean} finish indica si es análisis final
 * @returns {Promise<object|string>}
 */
const callGrok = async (payload, finish) => {
  if (!config.grokApiKey) {
    throw new Error('GROK_API_KEY no configurada');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const body = {
      model: config.grokModel || 'grok-beta',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `finish: ${finish}\nJSON:\n${JSON.stringify(payload)}`,
        },
      ],
    };

    const resp = await fetch(GROK_URL, {
      method: 'POST',
      headers: ensureHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    return await parseGrokResponse(resp, finish);
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { callGrok };
