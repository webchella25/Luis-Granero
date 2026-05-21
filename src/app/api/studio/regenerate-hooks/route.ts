import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';

function buildHooksPrompt(personaje: string, epoca: string, nichoCtx: string): string {
  return `Actúa como un experto en retención y CTR para YouTube especializado en ${nichoCtx}.

Genera 4 hooks alternativos para un vídeo sobre "${personaje}" (${epoca}).

REGLAS:
- Hooks para vídeo largo (0–10s): máx 2-3 frases, máx 60 palabras, sin emojis, español de España
- Hook para Short (0–2s): 1 sola frase ultra-agresiva, máx 15 palabras, diseñada para forzar el loop de reproducción
- Nunca empieces con "En este vídeo", "Hoy" ni con el nombre del personaje directamente
- La primera palabra debe crear tensión o intriga inmediata

JSON exacto:
{
  "hooks": [
    { "estilo": "pregunta_provocadora", "texto": "..." },
    { "estilo": "narrativa_alto_riesgo", "texto": "..." },
    { "estilo": "revelacion_oculta", "texto": "..." },
    { "estilo": "short_ultra_agresivo", "texto": "..." }
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

    const canal = await StudioCanal.findById(session.canal_id).select('config nicho descripcion').lean();
    const canalData = canal as { config?: Record<string, unknown>; nicho?: string; descripcion?: string } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

    const raw = await callLLM({
      system: `Eres un experto en retención para YouTube. Piensas como un retention strategist: cada hook debe crear tensión desde la primera palabra, maximizar el watch time y forzar el loop en Shorts. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`,
      messages: [{ role: 'user', content: buildHooksPrompt(script.personaje, script.epoca, nichoCtx) }],
      maxTokens: 1024,
      model: 'fast',
      canalConfig,
    });

    const data = JSON.parse(extractJSON(raw)) as { hooks: { estilo: string; texto: string }[] };

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
