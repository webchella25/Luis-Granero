import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';
import StudioCanal from '@/models/StudioCanal';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import StudioCalendario from '@/models/StudioCalendario';
import { getStudioSession } from '@/lib/studio/session';

export interface CompetenciaResult {
  titulos_existentes: string[];
  angulo_unico: string;
  titulos_sugeridos: string[];
  score_oportunidad: number;
  razon: string;
}

function fallbackCompetencia(personaje: string, reason?: string): CompetenciaResult {
  const cleanPersonaje = personaje.trim();
  return {
    titulos_existentes: [
      `${cleanPersonaje}: historia completa`,
      `${cleanPersonaje}: el caso explicado`,
      `${cleanPersonaje}: qué pasó realmente`,
      `${cleanPersonaje}: cronología del caso`,
      `${cleanPersonaje}: misterio sin resolver`,
    ],
    angulo_unico: `Reconstruir ${cleanPersonaje} desde las contradicciones, errores de investigación y preguntas que todavía siguen abiertas.`,
    titulos_sugeridos: [
      `${cleanPersonaje}: las contradicciones clave`,
      `${cleanPersonaje}: el detalle que nadie explica`,
      `${cleanPersonaje}: la investigación fallida`,
    ].map((title) => title.slice(0, 60)),
    score_oportunidad: 65,
    razon: reason
      ? `Análisis fallback porque el modelo devolvió una respuesta no válida: ${reason.slice(0, 180)}`
      : 'Análisis fallback generado sin datos estructurados del modelo.',
  };
}

function normalizeCompetenciaResult(value: Partial<CompetenciaResult>, personaje: string): CompetenciaResult {
  const fallback = fallbackCompetencia(personaje);
  const titulosExistentes = Array.isArray(value.titulos_existentes)
    ? value.titulos_existentes.map(String).filter(Boolean).slice(0, 8)
    : fallback.titulos_existentes;
  const titulosSugeridos = Array.isArray(value.titulos_sugeridos)
    ? value.titulos_sugeridos.map((title) => String(title).trim().slice(0, 60)).filter(Boolean).slice(0, 5)
    : fallback.titulos_sugeridos;
  const score = Number(value.score_oportunidad);

  return {
    titulos_existentes: titulosExistentes.length ? titulosExistentes : fallback.titulos_existentes,
    angulo_unico: typeof value.angulo_unico === 'string' && value.angulo_unico.trim()
      ? value.angulo_unico.trim()
      : fallback.angulo_unico,
    titulos_sugeridos: titulosSugeridos.length ? titulosSugeridos : fallback.titulos_sugeridos,
    score_oportunidad: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : fallback.score_oportunidad,
    razon: typeof value.razon === 'string' && value.razon.trim() ? value.razon.trim() : fallback.razon,
  };
}

function parseCompetenciaResult(raw: string, personaje: string): CompetenciaResult {
  const candidates = [
    extractJSON(raw),
    raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1),
  ].filter((candidate) => candidate.trim().startsWith('{') && candidate.trim().endsWith('}'));

  for (const candidate of candidates) {
    try {
      return normalizeCompetenciaResult(JSON.parse(candidate) as Partial<CompetenciaResult>, personaje);
    } catch {
      // probar siguiente candidato
    }
  }

  return fallbackCompetencia(personaje, raw);
}

async function persistCompetenciaAnalysis(entryId: string | undefined, canalId: string, result: CompetenciaResult): Promise<void> {
  if (!entryId) return;
  try {
    const objectId = new Types.ObjectId(entryId);
    await StudioCalendario.updateOne(
      { canal_id: canalId, 'entries._id': objectId },
      {
        $set: {
          'entries.$.competencia_analysis': {
            score_oportunidad: result.score_oportunidad,
            angulo_unico: result.angulo_unico,
            titulos_sugeridos: result.titulos_sugeridos,
            analizado_en: new Date(),
          },
          actualizado_en: new Date(),
        },
      }
    );
  } catch {
    // El análisis sigue siendo útil aunque no se pueda persistir.
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { personaje, entryId } = (await request.json()) as { personaje?: string; entryId?: string };
    if (!personaje) return NextResponse.json({ error: 'personaje requerido' }, { status: 400 });

    await connectDB();

    const canal = await StudioCanal.findById(session.canal_id)
      .select('nicho descripcion config')
      .lean();
    const canalData = canal as { nicho?: string; descripcion?: string; config?: Record<string, unknown> } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

    let result: CompetenciaResult;
    try {
      const raw = await callLLM({
        system: `Eres un estratega de contenido YouTube especializado en ${nichoCtx} en español. Respondes SOLO con JSON válido estricto: strings siempre entre comillas dobles, sin markdown, sin comentarios.`,
        messages: [
          {
            role: 'user',
            content: `Para el tema "${personaje}" en un canal de YouTube sobre ${nichoCtx} en español:

1. Lista los 5 títulos más comunes que ya existen en YouTube en español para este tema
2. Identifica el ángulo que NADIE ha cubierto bien todavía
3. Sugiere 3 títulos alternativos con ese ángulo único (keyword al inicio, máx 60 caracteres)
4. Da una puntuación de oportunidad 0-100 (100 = mucho potencial, poca competencia)

Responde SOLO con JSON:
{
  "titulos_existentes": ["string"],
  "angulo_unico": "string",
  "titulos_sugeridos": ["string"],
  "score_oportunidad": number,
  "razon": "string"
}`,
          },
        ],
        maxTokens: 1024,
        model: 'fast',
        canalConfig,
      });
      result = parseCompetenciaResult(raw, personaje);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error analizando competencia con LLM:', message);
      result = fallbackCompetencia(personaje, message);
    }

    await persistCompetenciaAnalysis(entryId, session.canal_id, result);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error en analizar-competencia:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
