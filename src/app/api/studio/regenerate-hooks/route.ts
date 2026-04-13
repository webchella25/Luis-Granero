import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';

function buildHooksPrompt(personaje: string, epoca: string): string {
  return `Para un vídeo de YouTube sobre ${personaje} (${epoca}), genera 3 hooks alternativos de apertura.

Cada hook: máximo 2-3 frases, máximo 60 palabras. Sin emojis. En español de España.
Nunca empieces con "En este vídeo" ni con el nombre del personaje directamente.

JSON exacto:
{
  "hooks": [
    { "estilo": "pregunta_provocadora", "texto": "..." },
    { "estilo": "narrativa_alto_riesgo", "texto": "..." },
    { "estilo": "revelacion_oculta", "texto": "..." }
  ]
}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId } = (await request.json()) as { scriptId?: string };
    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId requerido' }, { status: 400 });
    }

    await connectDB();
    const script = await StudioScript.findById(scriptId).lean();
    if (!script) {
      return NextResponse.json({ error: 'Script no encontrado' }, { status: 404 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'Eres experto en hooks virales para YouTube de true crime e historia oscura en español. Generas aperturas de 2-3 frases que enganchan en los primeros 10 segundos. Nunca empiezas con "En este vídeo" ni con el nombre del personaje directamente. Respondes SOLO con JSON válido.',
      messages: [{ role: 'user', content: buildHooksPrompt(script.personaje, script.epoca) }],
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const data = JSON.parse(raw) as { hooks: { estilo: string; texto: string }[] };

    await StudioScript.findByIdAndUpdate(scriptId, {
      hooks_seo: data.hooks,
      hook_seleccionado: null,
    });

    return NextResponse.json({ success: true, hooks: data.hooks });
  } catch (error) {
    console.error('Error regenerando hooks:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
