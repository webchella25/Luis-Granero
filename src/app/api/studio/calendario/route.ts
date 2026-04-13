import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import StudioCalendario, { ICalendarioEntry } from '@/models/StudioCalendario';
import { getStudioSession } from '@/lib/studio/session';

const SEO_CALENDAR_PROMPT = `Genera un calendario editorial de 30 vídeos para un canal de YouTube faceless en español sobre biografías de personajes históricos oscuros (asesinos en serie, dictadores, líderes de sectas, criminales históricos).

Para cada vídeo incluir:
- Personaje
- Título SEO optimizado
- Semana sugerida de publicación (semana 1 a semana 30)
- Categoría: asesino_serie | dictador | secta | criminal_historico | psicopata
- Nivel de búsqueda estimado: alto | medio
- Época (periodo histórico o contexto geográfico breve)

Ordenar por nivel de búsqueda descendente (los más buscados primero).
Mezclar categorías para que no haya dos del mismo tipo seguidos.
Incluir personajes de distintos países y épocas.
Priorizar personajes con mucha búsqueda en español.

JSON exacto (sin texto adicional):
{
  "videos": [
    {
      "semana": 1,
      "personaje": "string",
      "titulo": "string",
      "categoria": "asesino_serie|dictador|secta|criminal_historico|psicopata",
      "busquedas": "alto|medio",
      "epoca": "string"
    }
  ]
}`;

// GET — obtener calendario activo
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  // Usamos el documento Mongoose (sin lean) para poder guardar si hay entries sin _id
  const cal = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
  if (!cal) return NextResponse.json({ calendario: null });

  // Entries insertadas sin pasar por Mongoose no tienen _id — los asignamos y persistimos
  let needsSave = false;
  for (const entry of cal.entries) {
    if (!entry._id) {
      (entry as { _id?: unknown })._id = new Types.ObjectId();
      needsSave = true;
    }
  }
  if (needsSave) {
    console.log('GET calendario: asignando _id a entries sin identificador y guardando');
    await cal.save();
  }

  // toJSON() serializa ObjectId a string correctamente
  return NextResponse.json({ calendario: cal.toJSON() });
}

// POST — generar nuevo calendario con Claude
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: 'Eres un estratega de contenido para YouTube especializado en canales de historia oscura y true crime en español. Respondes SOLO con JSON válido.',
      messages: [{ role: 'user', content: SEO_CALENDAR_PROMPT }],
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(raw) as { videos: Omit<ICalendarioEntry, 'orden'>[] };

    const entries: ICalendarioEntry[] = parsed.videos.map((v, i) => ({
      ...v,
      orden: i,
      completado: false,
      fecha_publicacion: null,
    }));

    await connectDB();
    // Reemplazar calendario existente del canal
    await StudioCalendario.deleteMany({ canal_id: session.canal_id });
    const cal = await StudioCalendario.create({ entries, canal_id: session.canal_id });

    return NextResponse.json({ success: true, calendario: cal.toJSON() });
  } catch (error) {
    console.error('Error generando calendario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
