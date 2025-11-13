import { OpenAIStream, StreamingTextResponse } from 'ai';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'edge';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', 
      stream: true,
      messages, 
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
    
  } catch (error) {
    console.error("Error en la llamada a la API de Groq:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}