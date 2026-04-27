import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection, Tono, Duracion } from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';
import { callLLM, extractJSON, LLMConfig } from '@/lib/studio/llm-client';

interface GenerateScriptBody {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  tipo_guion?: string;
}

const TONO_DESCRIPCION: Record<string, string> = {
  oscuro: 'oscuro y serio, con un tono grave y perturbador',
  divulgativo: 'divulgativo y didáctico, equilibrado entre rigor informativo y entretenimiento',
  misterioso: 'misterioso e intrigante, con giros narrativos y suspense que mantienen al espectador en tensión',
  amigable: 'amigable y cercano, con un lenguaje accesible que conecta directamente con la audiencia',
  educativo: 'educativo y detallado, con énfasis en explicar conceptos de forma clara y práctica',
  inspirador: 'inspirador y motivacional, que mueve a la acción y transmite entusiasmo',
};

const PALABRAS_POR_DURACION: Record<string, number> = {
  '5': 650,
  '8': 1040,
  '10': 1400,
  '12': 1560,
  '15': 2100,
  '18': 2340,
  '20': 2800,
};

const SECCIONES = [
  { id: 'hook', titulo: 'Hook (0–30s)', instruccion: 'Gancho impactante de 50-70 palabras. Arranca directamente con el dato, momento o pregunta más llamativa del tema. Sin presentaciones todavía.' },
  { id: 'introduccion', titulo: 'Introducción y contexto', instruccion: 'Sitúa al espectador: qué es el tema, por qué importa y qué va a aprender. Aproximadamente 250-300 palabras.' },
  { id: 'desarrollo', titulo: 'Desarrollo principal', instruccion: 'El cuerpo central del vídeo. Explica, narra o argumenta el tema con profundidad, usando ejemplos concretos. Aproximadamente 300-400 palabras.' },
  { id: 'profundizacion', titulo: 'Profundización / Puntos clave', instruccion: 'La parte más densa e interesante. Amplía el desarrollo con datos relevantes, matices o ángulos sorprendentes. Es la sección más larga. Aproximadamente 400-600 palabras.' },
  { id: 'perspectiva', titulo: 'Perspectiva e impacto', instruccion: 'Qué consecuencias tiene el tema, qué enseña o qué impacto tiene en la vida del espectador. Aproximadamente 250-350 palabras.' },
  { id: 'reflexion', titulo: 'Reflexión final + CTA', instruccion: 'Cierre reflexivo que invite al espectador a pensar. Termina con una pregunta retórica o afirmación potente. Incluye una llamada a la acción natural para suscribirse. Aproximadamente 100-150 palabras.' },
];

function buildSystemPrompt(override?: string): string {
  if (override?.trim()) return override.trim();
  return `Eres un guionista experto en contenido divulgativo para YouTube.
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

type SeccionDef = { id: string; titulo: string; instruccion: string };

function buildUserPrompt(body: GenerateScriptBody, totalPalabras: number, secciones: SeccionDef[] = SECCIONES): string {
  const tonoDesc = TONO_DESCRIPCION[body.tono] ?? body.tono;
  const seccionesTexto = secciones.map(
    (s) => `- **${s.titulo}**: ${s.instruccion}`
  ).join('\n');
  const titulosNumerados = secciones.map((s, i) => `${i + 1}. "${s.titulo}"`).join('\n');

  return `Escribe un guión completo para un vídeo de YouTube sobre el siguiente personaje:

**Personaje**: ${body.personaje}
**Época y contexto**: ${body.epoca}
**Tono**: ${tonoDesc}
**Duración objetivo**: ${body.duracion} minutos (~${totalPalabras} palabras en total)

El guión debe dividirse exactamente en estas ${secciones.length} secciones:
${seccionesTexto}

Responde con el JSON siguiendo el formato especificado. Los "title" de cada sección deben ser exactamente:
${titulosNumerados}`;
}

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

function buildSeoPrompt(
  personaje: string,
  epoca: string,
  nichoCtx: string,
  sections: { title: string; content: string }[] = []
): string {
  const sectionsBlock = sections.length
    ? sections
        .map((s, i) => `${i + 1}. "${s.title}" — "${s.content.slice(0, 100).replace(/"/g, "'")}..."`)
        .join('\n')
    : '(sin secciones disponibles)';

  return `Eres un experto en crecimiento en YouTube Shorts y copywriting viral.

Canal: ${nichoCtx}
Tema del vídeo: "${personaje}" — Contexto: ${epoca}

VÍDEO LARGO — genera 3 variantes de título:
1. SEO puro: keyword al inicio, optimizado para búsqueda, máx 60 chars
2. CTR alto: gancho emocional o curiosidad, máx 70 chars
3. Híbrido: equilibrio búsqueda + engagement, máx 65 chars
Descripción: línea 1-2 = keyword + ángulo de interés (SEO); luego resumen breve + CTA + hashtags de nicho.
Tags: 10-15, sin duplicados, basados en búsqueda real.

SHORTS — para cada sección genera título A/B + descripción + tags:

SECCIONES:
${sectionsBlock}

REGLAS SHORTS:
- titulo_a: gancho fuerte (curiosidad/sorpresa/utilidad) · máx 70 chars · 1 emoji relevante
- titulo_b: variante con ángulo distinto · máx 70 chars · 1 emoji
- Tono automático adaptado al nicho del canal (${nichoCtx})
- desc: exactamente 4 líneas separadas por \\n → Hook | Contexto | Valor/misterio | CTA (sin link)
- tags: 8-12 tags mezclando nicho + tema específico + intención de búsqueda
- NO repetir el título en la descripción · NO frases tipo "en este vídeo"

Ejemplos título por nicho:
True crime: "Nadie esperaba esto… 😨" / "Lo que descubrieron fue aterrador 💀"
Salud/comida: "Esto parece sano… pero no lo es 🧠" / "La forma más fácil de comer mejor 🔥"

JSON exacto (sin markdown):
{
  "titulos": ["SEO puro", "CTR alto", "híbrido"],
  "descripcion": "string",
  "tags": ["string"],
  "shorts_seo": [
    { "titulo_a": "...", "titulo_b": "...", "desc": "línea1\\nlínea2\\nlínea3\\nlínea4", "tags": ["..."] }
  ]
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
    if (!body.tono?.trim()) {
      return NextResponse.json({ error: 'Tono inválido' }, { status: 400 });
    }
    if (!body.duracion || !PALABRAS_POR_DURACION[body.duracion]) {
      return NextResponse.json({ error: 'Duración inválida' }, { status: 400 });
    }

    const validBody = body as GenerateScriptBody;
    const totalPalabras = PALABRAS_POR_DURACION[validBody.duracion];

    await connectDB();
    const canal = await StudioCanal.findById(canal_id).lean();
    const canalData = canal as { config?: LLMConfig & { system_prompt_guion?: string; secciones_personalizadas?: string; tipos_guion?: string }; nicho?: string; descripcion?: string } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

    let seccionesActivas = SECCIONES;

    // Prioridad 1: tipo_guion del request → buscar en tipos_guion del canal
    const tiposGuionRaw = canalConfig.tipos_guion?.trim();
    if (validBody.tipo_guion && tiposGuionRaw) {
      try {
        const tipos = JSON.parse(tiposGuionRaw) as Array<{ id: string; nombre: string; secciones: SeccionDef[] }>;
        const tipoMatch = tipos.find((t) => t.id === validBody.tipo_guion);
        if (tipoMatch?.secciones && Array.isArray(tipoMatch.secciones) && tipoMatch.secciones.length >= 2) {
          seccionesActivas = tipoMatch.secciones;
        }
      } catch {
        // JSON inválido → continuar al siguiente fallback
      }
    }

    // Prioridad 2: secciones_personalizadas (backward compat)
    if (seccionesActivas === SECCIONES) {
      const seccionesRaw = canalConfig.secciones_personalizadas?.trim();
      if (seccionesRaw) {
        try {
          const parsed = JSON.parse(seccionesRaw) as SeccionDef[];
          if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0]?.titulo && parsed[0]?.instruccion) {
            seccionesActivas = parsed;
          }
        } catch {
          // JSON inválido → usar SECCIONES por defecto
        }
      }
    }

    const rawText = await callLLM({
      system: buildSystemPrompt(canalConfig.system_prompt_guion),
      messages: [{ role: 'user', content: buildUserPrompt(validBody, totalPalabras, seccionesActivas) }],
      maxTokens: 8192,
      model: 'main',
      canalConfig,
    });

    let parsed: { sections: ScriptSection[] };
    try {
      parsed = JSON.parse(extractJSON(rawText)) as { sections: ScriptSection[] };
    } catch {
      console.error('[generate-script] JSON parse failed. rawText:', rawText?.slice(0, 500));
      return NextResponse.json(
        { error: 'El modelo devolvió una respuesta no válida. Intenta de nuevo.' },
        { status: 502 }
      );
    }

    // Acepta tanto "sections" como "script" (algunos system_prompt_guion personalizados usan "script")
    if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      const alt = (parsed as unknown as { script?: ScriptSection[] }).script;
      if (Array.isArray(alt) && alt.length > 0) {
        parsed.sections = alt;
      } else {
        console.error('[generate-script] No sections. parsed keys:', Object.keys(parsed ?? {}), 'rawText:', rawText?.slice(0, 500));
        return NextResponse.json(
          { error: 'La respuesta no contiene secciones válidas.' },
          { status: 502 }
        );
      }
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
    type ShortSeoItem = { titulo_a: string; titulo_b: string; desc: string; tags: string[] };
    type SeoData = { titulos: string[]; descripcion: string; tags: string[]; shorts_seo: ShortSeoItem[] };
    type HooksData = { hooks: { estilo: string; texto: string }[] };

    const personaje = validBody.personaje.trim();
    const epoca = validBody.epoca.trim();
    const hookOriginal = parsed.sections[0]?.content ?? '';

    const [seoResult, hooksResult] = await Promise.allSettled([
      callLLM({
        system: `Eres un experto en copywriting viral y SEO para YouTube. Adaptas automáticamente el tono al nicho específico del canal. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`,
        messages: [{ role: 'user', content: buildSeoPrompt(personaje, epoca, nichoCtx, parsed.sections) }],
        maxTokens: 3000,
        model: 'fast',
        canalConfig,
      }),
      callLLM({
        system: `Eres un experto en retención para YouTube. Piensas como un retention strategist: cada hook debe crear tensión desde la primera palabra, maximizar el watch time y forzar el loop en Shorts. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`,
        messages: [{ role: 'user', content: buildHooksPrompt(personaje, epoca, nichoCtx) }],
        maxTokens: 1024,
        model: 'fast',
        canalConfig,
      }),
    ]);

    let seoData: SeoData | null = null;
    let hooksData: HooksData | null = null;
    const dbUpdate: Record<string, unknown> = { hook_original: hookOriginal };

    if (seoResult.status === 'fulfilled') {
      try {
        seoData = JSON.parse(extractJSON(seoResult.value)) as SeoData;
        const shortsSeo = seoData.shorts_seo ?? [];
        dbUpdate.titulos_seo = seoData.titulos;
        dbUpdate.descripcion_seo = seoData.descripcion;
        dbUpdate.tags_seo = seoData.tags;
        dbUpdate.titulos_seo_shorts = shortsSeo.map((s) => s.titulo_a);
        dbUpdate.shorts_seo = shortsSeo;
      } catch { console.error('Error parseando SEO'); }
    } else {
      console.error('Error generando SEO (no crítico):', seoResult.reason);
    }

    if (hooksResult.status === 'fulfilled') {
      try {
        hooksData = JSON.parse(extractJSON(hooksResult.value)) as HooksData;
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
