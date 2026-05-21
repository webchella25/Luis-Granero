import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioCalendario from '@/models/StudioCalendario';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';

export type EntryNormalizada = {
  _id: string;
  categoria_nueva: string;
  nivel_1_entidad?: string | null;
  nivel_2_tipo: string;
  nivel_3_periodo?: string | null;
};

export type EntryProblema = {
  _id: string;
  personaje: string;
  titulo: string;
  problema: string;
  categoria_sugerida: string;
};

export type LimpiezaResult = {
  categorias_limpias: string[];
  entries_normalizadas: EntryNormalizada[];
  problemas_detectados: EntryProblema[];
};

// Prompt pequeño: solo categorías únicas → mapeo de normalización
function buildNormalizacionPrompt(categorias: string[]): string {
  return `Eres un arquitecto editorial de taxonomías True Crime para YouTube.

CATEGORÍAS ACTUALES (raw, con duplicados y variantes):
${categorias.map((c) => `- "${c}"`).join('\n')}

TAREA: Normaliza estas categorías en una taxonomía limpia.

REGLAS:
1. Fusiona variantes del mismo concepto:
   - "asesinos en serie" / "Asesinos Seriales" / "asesino_serie" → "Asesinos en serie"
   - "Crímenes famosos" + "Casos célebres" → "Casos célebres"
   - "Misterios sin resolver" + "Misterios" → "Misterios sin resolver"
   - "Serial killers" → "Asesinos en serie"
   - "Cold cases" → "Casos sin resolver"
2. Todo en español estándar (sin mezcla inglés/español)
3. Máximo 12 categorías únicas en el resultado
4. Primera letra en mayúscula, el resto en minúscula

JSON exacto (sin markdown):
{
  "categorias_limpias": ["string"],
  "mapeo": {
    "categoria_original_exacta": "categoria_normalizada"
  }
}

El mapeo debe incluir TODAS las categorías originales, incluso las que no cambian.`;
}

// Prompt compacto: solo IDs y personajes → detección de entradas sin entidad real
function buildEntidadPrompt(entries: { _id: string; personaje: string }[]): string {
  const lista = entries
    .map((e) => `${e._id}|${e.personaje}`)
    .join('\n');

  return `Eres un experto en contenido True Crime. Analiza estos personajes/casos.

FORMAT: ID|PERSONAJE
${lista}

TAREA: Identifica cuáles NO tienen una entidad real identificable (persona real, caso real, crimen específico).

SEÑALES DE ENTRADA GENÉRICA (marcar como problema):
- Personaje es un descriptor genérico: "El asesino de...", "Caso desconocido", "Historia de..."
- No hay nombre propio de persona, caso o evento

SEÑALES DE ENTRADA VÁLIDA (NO marcar):
- Nombre propio de persona: "Jeffrey Dahmer", "Ted Bundy"
- Nombre de caso real: "Caso Alcàsser", "Asesino del Zodíaco"
- Evento histórico específico: "Matanza de Jonestown", "Familia Manson"

JSON exacto (sin markdown):
{
  "entradas_sin_entidad": [
    { "_id": "string", "personaje": "string", "problema": "descripción breve del problema" }
  ]
}

Si todas las entradas tienen entidad real, devuelve: { "entradas_sin_entidad": [] }`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = (await request.json()) as { apply?: boolean };
    const apply = body.apply === true;

    await connectDB();
    const cal = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
    if (!cal || cal.entries.length === 0) {
      return NextResponse.json({ error: 'Calendario vacío o no encontrado' }, { status: 404 });
    }

    const canal = await StudioCanal.findById(session.canal_id).select('config nicho descripcion').lean();
    const canalData = canal as { config?: Record<string, unknown>; nicho?: string; descripcion?: string } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'true crime';

    const sysPrompt = `Eres un arquitecto editorial especializado en taxonomías de contenido para YouTube. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`;

    // Extraer categorías únicas (payload mínimo para el LLM)
    const categoriasUnicas = [...new Set(cal.entries.map((e) => e.categoria.trim()).filter(Boolean))];

    // IDs + personajes (compacto) para detección de entidades
    const personajesInput = cal.entries
      .map((e) => ({ _id: e._id?.toString() ?? '', personaje: e.personaje }))
      .filter((e) => e._id);

    // Dos llamadas paralelas: normalización de categorías + detección de entidades
    const [normResult, entidadResult] = await Promise.allSettled([
      callLLM({
        system: sysPrompt,
        messages: [{ role: 'user', content: buildNormalizacionPrompt(categoriasUnicas) }],
        maxTokens: 2048,
        model: 'fast',
        canalConfig,
      }),
      callLLM({
        system: sysPrompt,
        messages: [{ role: 'user', content: buildEntidadPrompt(personajesInput) }],
        maxTokens: 2048,
        model: 'fast',
        canalConfig,
      }),
    ]);

    // Parsear normalización de categorías
    type NormData = { categorias_limpias: string[]; mapeo: Record<string, string> };
    let normData: NormData = { categorias_limpias: [], mapeo: {} };
    if (normResult.status === 'fulfilled') {
      try {
        normData = JSON.parse(extractJSON(normResult.value)) as NormData;
      } catch { console.error('Error parseando normalización'); }
    }

    // Parsear detección de entidades
    type EntidadData = { entradas_sin_entidad: { _id: string; personaje: string; problema: string }[] };
    let entidadData: EntidadData = { entradas_sin_entidad: [] };
    if (entidadResult.status === 'fulfilled') {
      try {
        entidadData = JSON.parse(extractJSON(entidadResult.value)) as EntidadData;
      } catch { console.error('Error parseando entidades'); }
    }

    // Construir set de IDs con problemas para lookup O(1)
    const problemasMap = new Map(
      entidadData.entradas_sin_entidad.map((p) => [p._id, p.problema])
    );

    // Construir entries_normalizadas aplicando el mapeo localmente (sin LLM)
    const entriesNormalizadas: EntryNormalizada[] = cal.entries.map((e) => {
      const id = e._id?.toString() ?? '';
      const catOriginal = e.categoria.trim();
      const catNueva = normData.mapeo[catOriginal] ?? catOriginal;
      return {
        _id: id,
        categoria_nueva: catNueva,
        nivel_1_entidad: problemasMap.has(id) ? null : e.personaje,
        nivel_2_tipo: catNueva,
        nivel_3_periodo: null,
      };
    });

    // Construir problemas_detectados
    const problemasDetectados: EntryProblema[] = [];
    for (const p of entidadData.entradas_sin_entidad) {
      const entry = cal.entries.find((e) => e._id?.toString() === p._id);
      if (!entry) continue;
      const catNueva = normData.mapeo[entry.categoria.trim()] ?? entry.categoria;
      problemasDetectados.push({
        _id: p._id,
        personaje: entry.personaje,
        titulo: entry.titulo,
        problema: p.problema,
        categoria_sugerida: catNueva || 'Casos no identificados (pendientes de entidad)',
      });
    }

    const result: LimpiezaResult = {
      categorias_limpias: normData.categorias_limpias,
      entries_normalizadas: entriesNormalizadas,
      problemas_detectados: problemasDetectados,
    };

    if (apply) {
      // IDs de entradas con problema (genéricas, sin entidad real)
      const problemIds = new Set(entidadData.entradas_sin_entidad.map((p) => p._id));

      // Deduplicar por personaje (case-insensitive) — conservar la primera aparición
      const personajesVistos = new Set<string>();
      const duplicateIds = new Set<string>();
      for (const entry of cal.entries) {
        const key = entry.personaje.trim().toLowerCase();
        const id = entry._id?.toString() ?? '';
        if (personajesVistos.has(key)) {
          duplicateIds.add(id);
        } else {
          personajesVistos.add(key);
        }
      }

      // Filtrar: eliminar genéricos y duplicados, aplicar mapeo de categorías al resto
      cal.entries = cal.entries.filter((entry) => {
        const id = entry._id?.toString() ?? '';
        return !problemIds.has(id) && !duplicateIds.has(id);
      });

      for (const entry of cal.entries) {
        const catOriginal = entry.categoria.trim();
        const catNueva = normData.mapeo[catOriginal];
        if (catNueva && catNueva !== catOriginal) entry.categoria = catNueva;
      }

      // Recalcular orden para que sea continuo tras el filtrado
      cal.entries.forEach((entry, i) => { entry.orden = i; });
      cal.actualizado_en = new Date();
      await cal.save();
    }

    return NextResponse.json({ success: true, resultado: result, applied: apply });
  } catch (error) {
    console.error('Error limpiando calendario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
