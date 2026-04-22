import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, type LLMConfig } from '@/lib/studio/llm-client';

interface PromptRequest {
  nombre_evento: string;
  nombre_dj: string;
  fecha: string;
  descripcion_estilo: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await request.json() as PromptRequest;

    if (!body.nombre_evento || !body.nombre_dj) {
      return NextResponse.json({ error: 'nombre_evento y nombre_dj son obligatorios' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalConfig = ((canal as { config?: LLMConfig } | null)?.config ?? {}) as LLMConfig;

    const userMessage = `Create an English image generation prompt for an event poster with these details:
- Event: ${body.nombre_evento}
- DJ: ${body.nombre_dj}
- Date: ${body.fecha || 'not specified'}
- Style/vibe: ${body.descripcion_estilo || 'dark, atmospheric, professional'}

Requirements for the prompt:
- Write for Flux or Stable Diffusion image generation
- Focus on: background atmosphere, lighting, colors, textures, mood
- Do NOT include readable text, logos, or typography in the prompt (models render text poorly)
- Make it vivid and specific: lighting type, color palette, atmosphere keywords
- Length: 40-60 words
- Return ONLY the prompt text, nothing else`;

    const prompt = await callLLM({
      system: 'You are an expert at writing image generation prompts for AI art models. You write concise, vivid English prompts optimized for Flux and Stable Diffusion. Return ONLY the prompt text with no introduction, explanation, or formatting.',
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 200,
      model: 'fast',
      canalConfig,
    });

    return NextResponse.json({ prompt: prompt.trim() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
