import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';
import StudioCanal from '@/models/StudioCanal';
import connectDB from '@/lib/mongodb';
import StudioCalendario from '@/models/StudioCalendario';
import { getStudioSession } from '@/lib/studio/session';

export interface AniversarioItem {
  personaje: string;
  fecha: string;
  dias_restantes: number;
  descripcion: string;
  urgencia: 'alta' | 'media';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();

  const canal = await StudioCanal.findById(session.canal_id)
    .select('nombre nicho descripcion config')
    .lean();
  const canalData = canal as { nombre?: string; nicho?: string; descripcion?: string; config?: Record<string, unknown> } | null;
  const canalConfig = canalData?.config ?? {};
  const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

  const cal = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
  if (!cal) return NextResponse.json({ aniversarios: [] });

  const personajes = [...new Set(cal.entries.map((e) => e.personaje))];
  const hoy = new Date().toISOString().split('T')[0];

  const raw = await callLLM({
    system: `Eres un investigador especializado en ${nichoCtx}. Respondes SOLO con JSON válido.`,
    messages: [
      {
        role: 'user',
        content: `Analiza estos temas/personajes del canal "${canalData?.nombre}" (nicho: ${nichoCtx}) y detecta fechas históricamente relevantes en los próximos 60 días desde hoy (${hoy}).

Para cada tema, busca: fechas de eventos clave, aniversarios de hechos importantes, efemérides relevantes al nicho.
Solo incluye aniversarios que caigan entre ${hoy} y 60 días después.

Temas: ${personajes.join(', ')}

Responde SOLO con JSON:
{
  "aniversarios": [
    {
      "personaje": "string",
      "fecha": "YYYY-MM-DD",
      "dias_restantes": number,
      "descripcion": "string (qué se cumple y cuántos años)",
      "urgencia": "alta|media"
    }
  ]
}`,
      },
    ],
    maxTokens: 2048,
    model: 'fast',
    canalConfig,
  });

  const parsed = JSON.parse(extractJSON(raw)) as { aniversarios: AniversarioItem[] };
  const aniversarios = parsed.aniversarios ?? [];

  // Guardar aniversario en cada entrada del calendario que corresponda
  for (const aniv of aniversarios) {
    const entry = cal.entries.find(
      (e) => e.personaje.toLowerCase().trim() === aniv.personaje.toLowerCase().trim()
    );
    if (entry) {
      (entry as unknown as Record<string, unknown>).aniversario = {
        fecha: aniv.fecha,
        descripcion: aniv.descripcion,
      };
    }
  }
  cal.actualizado_en = new Date();
  await cal.save();

  return NextResponse.json({ aniversarios });
}
