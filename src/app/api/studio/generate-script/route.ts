import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection, Tono, Duracion } from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

interface GenerateScriptBody {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
}

const TONO_DESCRIPCION: Record<Tono, string> = {
  oscuro: 'oscuro y serio, con un tono grave y perturbador que transmite la oscuridad del personaje',
  divulgativo: 'divulgativo y didáctico, equilibrado entre rigor histórico y entretenimiento',
  misterioso: 'misterioso e intrigante, con giros narrativos y suspense que mantienen al espectador en tensión',
};

const PALABRAS_POR_DURACION: Record<Duracion, number> = {
  '12': 1560,
  '15': 1950,
  '18': 2340,
};

const SECCIONES = [
  { id: 'hook', titulo: 'Hook (0–30s)', instruccion: 'Gancho impactante de 50-70 palabras. Comienza in media res con el momento más oscuro o perturbador del personaje. Sin presentaciones todavía.' },
  { id: 'contexto', titulo: 'Contexto histórico (30s–2min)', instruccion: 'Sitúa al espectador en la época, el lugar y las circunstancias que hicieron posible la historia. Aproximadamente 250-300 palabras.' },
  { id: 'ascenso', titulo: 'Ascenso al poder', instruccion: 'Narra cómo el personaje llegó a donde llegó. Sus motivaciones, alianzas, habilidades o circunstancias que lo catapultaron. Aproximadamente 300-400 palabras.' },
  { id: 'lado_oscuro', titulo: 'El lado oscuro', instruccion: 'La parte central y más impactante del guión. Detalla los actos, decisiones o características que definen la oscuridad del personaje. Es la sección más larga. Aproximadamente 400-600 palabras.' },
  { id: 'caida', titulo: 'Caída o legado', instruccion: 'Cómo terminó la historia del personaje (si aplica) y qué huella dejó en la historia. Aproximadamente 250-350 palabras.' },
  { id: 'reflexion', titulo: 'Reflexión final + CTA', instruccion: 'Cierre reflexivo que invite al espectador a pensar. Termina con una pregunta retórica o afirmación potente. Incluye una llamada a la acción natural para suscribirse. Aproximadamente 100-150 palabras.' },
];

function buildSystemPrompt(override?: string): string {
  if (override?.trim()) return override.trim();
  return `Eres un guionista experto en contenido de divulgación histórica para YouTube.
Escribes guiones para vídeos faceless narrados en voz en off, en español de España.

Reglas de escritura:
- Español de España (vosotros, castellano peninsular estándar)
- Sin emojis, sin asteriscos de markdown
- Frases cortas y contundentes, ritmo ágil
- Optimizado para ser narrado en voz en off (nada de "a continuación veremos" o lenguaje de texto)
- Tiempo verbal: pasado preferentemente, presente histórico para dramatismo
- Nunca uses "En conclusión" ni "Para finalizar"
- Cada sección debe fluir naturalmente hacia la siguiente
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después

Formato de respuesta obligatorio:
{
  "sections": [
    { "title": "título de la sección", "content": "texto completo de la sección" },
    ...
  ]
}`;
}

function buildUserPrompt(body: GenerateScriptBody, totalPalabras: number): string {
  const tonoDesc = TONO_DESCRIPCION[body.tono];
  const seccionesTexto = SECCIONES.map(
    (s) => `- **${s.titulo}**: ${s.instruccion}`
  ).join('\n');

  return `Escribe un guión completo para un vídeo de YouTube sobre el siguiente personaje:

**Personaje**: ${body.personaje}
**Época y contexto**: ${body.epoca}
**Tono**: ${tonoDesc}
**Duración objetivo**: ${body.duracion} minutos (~${totalPalabras} palabras en total)

El guión debe dividirse exactamente en estas 6 secciones:
${seccionesTexto}

Responde con el JSON siguiendo el formato especificado. Los "title" de cada sección deben ser exactamente:
1. "Hook (0–30s)"
2. "Contexto histórico (30s–2min)"
3. "Ascenso al poder"
4. "El lado oscuro"
5. "Caída o legado"
6. "Reflexión final + CTA"`;
}

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

function buildSeoPrompt(personaje: string, epoca: string): string {
  return `Para un vídeo sobre ${personaje} en el contexto ${epoca}, genera:
- 3 títulos alternativos optimizados para SEO (incluir keywords evergreen como 'historia real', 'quién fue', 'cómo capturaron', 'biografía', 'crimen explicado')
- 1 descripción completa de YouTube (150-200 palabras con keywords naturales, párrafo de gancho, resumen del contenido, CTA a suscribirse, hashtags)
- 20 tags relevantes (mix de específicos del personaje + genéricos del nicho)
- 3 títulos de Shorts (máximo 100 caracteres, con hashtags #HistoriaOscura #CrimenReal #AlmasCorruptas #TrueCrime, formato gancho: pregunta o dato impactante): uno para el Hook, uno para el Ascenso al poder, uno para El lado oscuro

JSON exacto:
{
  "titulos": ["string", "string", "string"],
  "descripcion": "string",
  "tags": ["string"],
  "titulos_shorts": ["string", "string", "string"]
}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
  const { canal_id } = session;
  try {
    const body = (await request.json()) as Partial<GenerateScriptBody>;

    // Validación básica
    if (!body.personaje?.trim()) {
      return NextResponse.json({ error: 'El nombre del personaje es obligatorio' }, { status: 400 });
    }
    if (!body.epoca?.trim()) {
      return NextResponse.json({ error: 'La época/contexto es obligatoria' }, { status: 400 });
    }
    if (!body.tono || !['oscuro', 'divulgativo', 'misterioso'].includes(body.tono)) {
      return NextResponse.json({ error: 'Tono inválido' }, { status: 400 });
    }
    if (!body.duracion || !['12', '15', '18'].includes(body.duracion)) {
      return NextResponse.json({ error: 'Duración inválida' }, { status: 400 });
    }

    const validBody = body as GenerateScriptBody;
    const totalPalabras = PALABRAS_POR_DURACION[validBody.duracion];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    await connectDB();
    const canal = await StudioCanal.findById(canal_id).lean();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8192,
      system: buildSystemPrompt((canal as { config?: { system_prompt_guion?: string } } | null)?.config?.system_prompt_guion),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(validBody, totalPalabras),
        },
      ],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parsear JSON — limpiar posibles bloques de código markdown
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: { sections: ScriptSection[] };
    try {
      parsed = JSON.parse(jsonText) as { sections: ScriptSection[] };
    } catch {
      return NextResponse.json(
        { error: 'El modelo devolvió una respuesta no válida. Intenta de nuevo.' },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      return NextResponse.json(
        { error: 'La respuesta no contiene secciones válidas.' },
        { status: 502 }
      );
    }

    // Guardar en MongoDB
    const script = await StudioScript.create({
      personaje: validBody.personaje.trim(),
      epoca: validBody.epoca.trim(),
      tono: validBody.tono,
      duracion: validBody.duracion,
      guion_json: parsed.sections,
      canal_id,
    });

    // Segunda y tercera llamadas: SEO + Hooks en paralelo (no bloquean la respuesta al usuario)
    type SeoData = { titulos: string[]; descripcion: string; tags: string[]; titulos_shorts: string[] };
    type HooksData = { hooks: { estilo: string; texto: string }[] };

    const personaje = validBody.personaje.trim();
    const epoca = validBody.epoca.trim();
    const hookOriginal = parsed.sections[0]?.content ?? '';

    const [seoResult, hooksResult] = await Promise.allSettled([
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: 'Eres un experto en SEO para YouTube especializado en canales de historia oscura y true crime en español. Generas títulos, descripciones y tags optimizados para posicionamiento evergreen. Respondes SOLO con JSON válido.',
        messages: [{ role: 'user', content: buildSeoPrompt(personaje, epoca) }],
      }),
      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'Eres experto en hooks virales para YouTube de true crime e historia oscura en español. Generas aperturas de 2-3 frases que enganchan en los primeros 10 segundos. Nunca empiezas con "En este vídeo" ni con el nombre del personaje directamente. Respondes SOLO con JSON válido.',
        messages: [{ role: 'user', content: buildHooksPrompt(personaje, epoca) }],
      }),
    ]);

    function extractJson(msg: Anthropic.Message): string {
      return msg.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    }

    let seoData: SeoData | null = null;
    let hooksData: HooksData | null = null;
    const dbUpdate: Record<string, unknown> = { hook_original: hookOriginal };

    if (seoResult.status === 'fulfilled') {
      try {
        seoData = JSON.parse(extractJson(seoResult.value)) as SeoData;
        dbUpdate.titulos_seo = seoData.titulos;
        dbUpdate.descripcion_seo = seoData.descripcion;
        dbUpdate.tags_seo = seoData.tags;
        dbUpdate.titulos_seo_shorts = seoData.titulos_shorts;
      } catch { console.error('Error parseando SEO'); }
    } else {
      console.error('Error generando SEO (no crítico):', seoResult.reason);
    }

    if (hooksResult.status === 'fulfilled') {
      try {
        hooksData = JSON.parse(extractJson(hooksResult.value)) as HooksData;
        dbUpdate.hooks_seo = hooksData.hooks;
      } catch { console.error('Error parseando hooks'); }
    } else {
      console.error('Error generando hooks (no crítico):', hooksResult.reason);
    }

    await StudioScript.findByIdAndUpdate(script._id, dbUpdate);

    return NextResponse.json({
      success: true,
      id: script._id.toString(),
      sections: parsed.sections,
      seo: seoData,
      hooks: hooksData?.hooks ?? null,
    });
  } catch (error) {
    console.error('Error generando guión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
