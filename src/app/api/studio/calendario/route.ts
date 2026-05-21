import { NextRequest, NextResponse } from 'next/server';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';
import StudioCanal from '@/models/StudioCanal';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import StudioCalendario, { ICalendarioEntry } from '@/models/StudioCalendario';
import { getStudioSession } from '@/lib/studio/session';

function buildCalendarPrompt(
  nichoCtx: string,
  personajesExcluir: string[] = [],
  categoriasPermitidas: string[] = []
): string {
  const exclusion = personajesExcluir.length > 0
    ? `\n\nNO incluyas estos personajes/casos que ya están en el calendario:\n${personajesExcluir.slice(0, 80).map((p) => `- ${p}`).join('\n')}`
    : '';

  const categoriaBlock = categoriasPermitidas.length >= 5
    ? `\n\nCATEGORÍAS — usa ÚNICAMENTE estas (string exacto, sin variaciones ni nuevas categorías):\n${categoriasPermitidas.map((c) => `- ${c}`).join('\n')}`
    : categoriasPermitidas.length > 0
    ? `\n\nCATEGORÍAS YA USADAS (reutilízalas; añade nuevas solo si ninguna encaja, máx 10 categorías únicas en total):\n${categoriasPermitidas.map((c) => `- ${c}`).join('\n')}`
    : `\n\nDefine entre 8 y 10 categorías únicas y úsalas de forma consistente en todos los vídeos.`;

  return `Actúa como un estratega de contenido SEO para YouTube especializado en ${nichoCtx}.

Genera un calendario editorial de 50 vídeos optimizados para posicionamiento orgánico en español.${exclusion}${categoriaBlock}

REGLA FUNDAMENTAL — PERSONAJE REAL OBLIGATORIO:
- Cada vídeo DEBE girar en torno a una PERSONA REAL con nombre concreto.
- El campo "personaje" es el nombre más conocido de esa persona en español (criminal, víctima célebre, líder de secta, dictador, etc.).
- CORRECTO: "Ted Bundy", "Andrei Chikatilo", "Josef Fritzl", "Jim Jones", "Elizabeth Báthory", "Gilles de Rais", "Vlad Tepes", "Jack el Destripador", "Rasputín", "Lucrezia Borgia".
- Para casos sin culpable identificado usa el nombre del caso más conocido: "Jack el Destripador", "El Zodíaco", "La Bestia de Gévaudan" — nunca una descripción genérica inventada.
- PROHIBIDO absolutamente: escritores (Poe, Kafka), músicos (Nina Simone, Cosby solo por su música), deportistas, personajes de ficción (Pinocho), líderes políticos/militares sin crímenes específicos (Geronimo, Alejandro Magno como héroe).
- PROHIBIDO: frases como "El asesino de X", "El caso de la desaparición de Maureen", "El misterio de la casa de..." sin un nombre concreto.
- NOMBRE CANÓNICO ÚNICO: usa siempre el mismo nombre para la misma persona. NO uses alias Y nombre real en distintas entradas (ej: "Son of Sam" y "David Berkowitz" son la misma persona — elige uno). El nombre canónico es el más buscado en YouTube en español.

DIVERSIDAD TEMPORAL OBLIGATORIA:
- Los 50 vídeos deben cubrir TODA la historia humana, no solo el siglo XX.
- Distribuye las épocas así (aproximadamente): 10 vídeos Antigüedad/Edad Media, 10 vídeos siglos XVI-XIX, 15 vídeos siglo XX, 15 vídeos siglo XXI o contemporáneo.
- Busca personajes de distintas culturas y continentes: Europa, América, Asia, África, Oriente Medio, Japón, etc.
- El campo "epoca" debe ser el siglo o período concreto (ej: "Siglo XV", "Siglo XIX", "años 70", "Imperio Romano"), nunca un lugar geográfico.

ESTRATEGIA SEO:
- Keyword principal SIEMPRE al inicio del título (máx 60 caracteres)
- Prioriza temas con alta demanda de búsqueda en español
- Mezcla variedad de categorías para construir autoridad temática transversal
- Los temas con busquedas "alto" deben ir en las primeras semanas
- Incluye ángulos evergreen: "quién fue", "historia real", "el caso de", "cómo ocurrió", "la verdad sobre"

JSON exacto (sin texto adicional):
{
  "videos": [
    {
      "semana": 1,
      "personaje": "Nombre Apellido (persona real, nunca genérico)",
      "titulo": "string (keyword al inicio, máx 60 caracteres)",
      "categoria": "string",
      "busquedas": "alto|medio",
      "epoca": "string"
    }
  ]
}`;
}

// GET — obtener calendario activo
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  await connectDB();
  // Usamos el documento Mongoose (sin lean) para poder guardar si hay entries sin _id
  const cal = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
  if (!cal) return NextResponse.json({ calendario: null });

  // Entries insertadas sin pasar por Mongoose no tienen _id — los asignamos y persistimos.
  // Usamos updateOne con $set sobre el array completo porque MongoDB no permite actualizar
  // el campo _id de subdocumentos ya existentes via save() de Mongoose.
  const missingIds = cal.entries.some((e) => !e._id);
  if (missingIds) {
    console.log('GET calendario: asignando _id a entries sin identificador');
    const fixedEntries = cal.entries.map((e) => ({
      ...(e as unknown as { toObject(): object }).toObject(),
      _id: e._id ?? new Types.ObjectId(),
    }));
    await StudioCalendario.updateOne({ _id: cal._id }, { $set: { entries: fixedEntries } });
    return NextResponse.json({ calendario: { ...cal.toJSON(), entries: fixedEntries } });
  }

  // toJSON() serializa ObjectId a string correctamente
  return NextResponse.json({ calendario: cal.toJSON() });
}

// POST — generar y añadir vídeos al calendario con Claude (no borra los existentes)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).select('config nicho descripcion').lean();
    const canalData = canal as { config?: Record<string, unknown>; nicho?: string; descripcion?: string } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

    // Cargar entradas existentes para excluirlas del prompt y no duplicar
    const existing = await StudioCalendario.findOne({ canal_id: session.canal_id }).sort({ generado_en: -1 });
    const existingEntries: ICalendarioEntry[] = existing ? existing.toObject().entries : [];
    const personajesExistentes = existingEntries.map((e) => e.personaje);
    const personajesSet = new Set(personajesExistentes.map((p) => p.toLowerCase()));

    // Categorías únicas ya usadas — el LLM debe reutilizarlas exactamente
    const categoriasPermitidas = [...new Set(existingEntries.map((e) => e.categoria.trim()).filter(Boolean))];

    const raw = await callLLM({
      system: `Eres un motor de planificación SEO para YouTube especializado en ${nichoCtx}. Piensas como un YouTube Search Engineer: priorizas volumen de búsqueda real, autoridad temática y diversidad de ángulos. REGLA CRÍTICA: cada vídeo del calendario debe tener un protagonista humano real con nombre y apellidos — nunca eventos genéricos ni casos sin persona concreta. Respondes SOLO con JSON válido.`,
      messages: [{ role: 'user', content: buildCalendarPrompt(nichoCtx, personajesExistentes, categoriasPermitidas) }],
      maxTokens: 8192,
      model: 'fast',
      canalConfig,
    });

    const parsed = JSON.parse(extractJSON(raw)) as { videos: Omit<ICalendarioEntry, 'orden'>[] };

    // Filtrar los que ya están en el calendario (case-insensitive por personaje)
    const nuevos = parsed.videos
      .filter((v) => !personajesSet.has(v.personaje.toLowerCase()))
      .map((v, i) => ({
        ...v,
        orden: existingEntries.length + i,
        completado: false,
        fecha_publicacion: null,
      }));

    let cal;
    if (existing) {
      // Añadir al calendario existente sin borrar nada
      existing.entries.push(...(nuevos as ICalendarioEntry[]));
      existing.actualizado_en = new Date();
      await existing.save();
      cal = existing;
    } else {
      cal = await StudioCalendario.create({ entries: nuevos, canal_id: session.canal_id });
    }

    return NextResponse.json({ success: true, calendario: cal.toJSON() });
  } catch (error) {
    console.error('Error generando calendario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
