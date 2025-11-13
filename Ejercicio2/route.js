require('dotenv').config();

const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  console.log("Iniciando script de chat con Groq...");

  if (!process.env.GROQ_API_KEY) {
    console.error("\nERROR: La variable de entorno GROQ_API_KEY no fue encontrada.");
    console.error("Por favor, asegúrate de tener un archivo .env.local con tu clave válida.");
    return; 
  }

  try {
    console.log("Enviando petición a la API de Groq... Por favor, espera.\n");

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: 'haz una poesia sobre html en versos alejandrinos que rime en consonante',
        }
      ],
      stream: true, 
    });

    console.log("Respuesta de la IA:");
    process.stdout.write("-> "); 

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      process.stdout.write(content);
    }

    console.log('\n\n--- Fin de la comunicación ---');

  } catch (error) {
    console.error("\nHa ocurrido un error al contactar con la API de Groq:");
    console.error(error);
  }
}

main();