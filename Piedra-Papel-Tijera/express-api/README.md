# Piedra · Papel · Tijeras API (Express)

API y mini UI para jugar a piedra, papel o tijeras con dos modos:

- **Modo Local**: usa una heurística propia para predecir la siguiente jugada.
- **Modo Grok**: delega la predicción/análisis en la API de Grok (requiere clave con créditos activos).

La UI permite alternar entre modos y ver el análisis en vivo.

## Requisitos

- Node.js 18+ (recomendado).
- (Opcional) Clave de Grok con créditos disponibles.

## Instalación

```bash
npm install
```

## Variables de entorno

Crea `.env` en `express-api/` (puedes copiar `env.template`):

```env
PORT=3050
GROK_API_KEY=tu_clave_grok      # debe empezar por gsk_ y tener créditos
GROK_MODEL=grok-beta            # u otro modelo disponible
```

Si no estableces `GROK_API_KEY`, solo podrás usar el modo local.

## Ejecutar

```bash
npm start
```

Luego abre `http://localhost:3050/`.

## Endpoints principales

- `POST /api/rps/play`
  - Body:
    ```json
    {
      "score": { "player": 0, "machine": 0 },
      "history": { "player": [], "machine": [] },
      "finish": false,
      "useGrok": true | false   // opcional, fuerza modo. Por defecto usa Grok si disponible.
    }
    ```
  - Si `finish` es `false`: responde JSON con `next_move` y `analysis`.
  - Si `finish` es `true`: responde texto plano con análisis final.
- `GET /api/status`: indica si Grok está disponible (`grokAvailable`) y si se está usando (`usingGrok`).

## Modos de predicción

- **Modo Grok**:
  - Usa la API de Grok (`https://api.x.ai/v1/chat/completions`) con el modelo configurado.
  - Requiere `GROK_API_KEY` válida y con créditos. Sin créditos, verás un error 403; cambia a modo local.
  - El front muestra un badge “Modo: Grok/Local”; clic para alternar (si Grok está disponible). Al cambiar de modo se muestra el análisis final de lo jugado.

- **Modo Local** (fallback o elección manual):
  - Predice la siguiente jugada del jugador sumando frecuencias globales y de las últimas 5 jugadas; en empate gana la más reciente.
  - La máquina juega lo que vence a la predicción.
  - Calcula predictibilidad (%) revisando aciertos de predicciones sobre el historial.
  - Genera análisis final con patrón principal, variaciones y predictibilidad.

## UI (src/public/index.html)

- Botones grandes de jugada (piedra/papel/tijeras) que envían la ronda automáticamente.
- Configuración de rondas: ilimitado o un número entre 10 y 50.
- Toast por ronda indicando quién ganó.
- Botones “Análisis final” (muestra análisis y reinicia) y “Reiniciar”.
- Badge de modo para alternar Grok/Local (solo si Grok está disponible).
- Paneles de marcador, historial y respuesta.

## Tests

```bash
npm test
```

## Notas

- Si Grok no está disponible o falla, el backend cae al modo local aunque envíes `useGrok=true`.
- Si tienes problemas de clave: asegúrate de que empieza por `gsk_`, no tiene espacios y tu equipo en x.ai tiene créditos. Reinicia el servidor tras modificar `.env`.
