import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection, Tono, Duracion } from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';
import { callLLM, extractJSON, LLMConfig } from '@/lib/studio/llm-client';
import { searchCaseContext } from '@/lib/studio/tavily';

interface GenerateScriptBody {
  personaje: string;
  epoca: string;
  tono: Tono;
  duracion: Duracion;
  tipo_guion?: string;
  titulo?: string;
  angulo?: string;
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
  const fechaHoy = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  if (override?.trim()) return `${override.trim()}\n\nFecha actual: ${fechaHoy}`;
  return `Eres un guionista experto en contenido divulgativo para YouTube.
Escribes guiones para vídeos faceless narrados en voz en off, en español de España.

Fecha actual: ${fechaHoy}

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

type SeccionDef = { id: string; titulo: string; instruccion: string; palabras?: string };

function parseMinPalabras(palabras?: string): number | null {
  if (!palabras) return null;
  const match = palabras.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

type TavilyContexto = {
  hechos: string[];
  timeline: { momento: string; tipo: string }[];
  giros_potenciales: string[];
  contradicciones: string[];
  detalles_inquietantes: string[];
  momentos_clipables: string[];
};

function formatContextoEstructurado(ctx: TavilyContexto): string {
  const lines: string[] = [
    '**ANÁLISIS NARRATIVO DEL CASO — BASE FACTUAL:**',
    '',
    'REGLAS DE USO:',
    '- Introduce los datos como pistas, dudas o revelaciones progresivas — nunca como resumen plano',
    '- PROHIBIDO: "La policía encontró X" → CORRECTO: "Cuando revisaron la casa, algo no cuadraba…"',
    '- Verifica antes de escribir: ¿hay al menos 3 giros? ¿hay progresión dramática? ¿hay clímax fuerte?',
    '- El resultado debe parecer una historia construida, no un informativo',
  ];
  if (ctx.hechos.length) lines.push('', `HECHOS CONFIRMADOS:\n${ctx.hechos.map((h) => `- ${h}`).join('\n')}`);
  if (ctx.timeline.length) lines.push('', `TIMELINE NARRATIVO (sigue este arco, no el orden plano de los datos):\n${ctx.timeline.map((t) => `- [${t.tipo.toUpperCase()}] ${t.momento}`).join('\n')}`);
  if (ctx.giros_potenciales.length) lines.push('', `GIROS (úsalos como puntos de alta tensión):\n${ctx.giros_potenciales.map((g) => `- ${g}`).join('\n')}`);
  if (ctx.contradicciones.length) lines.push('', `CONTRADICCIONES (no las resuelvas de golpe — mantenlas como duda hasta el clímax):\n${ctx.contradicciones.map((c) => `- ${c}`).join('\n')}`);
  if (ctx.detalles_inquietantes.length) lines.push('', `DETALLES INQUIETANTES (distribúyelos progresivamente a lo largo del guión):\n${ctx.detalles_inquietantes.map((d) => `- ${d}`).join('\n')}`);
  if (ctx.momentos_clipables.length) lines.push('', `MOMENTOS CLIPABLES (dales alta carga emocional — serán usados para shorts y clips):\n${ctx.momentos_clipables.map((m) => `- ${m}`).join('\n')}`);
  return lines.join('\n');
}

function buildTavilyAnalysisPrompt(personaje: string, epochs: string, rawContext: string): string {
  return `Analiza la siguiente información sobre "${personaje}" (${epochs}) extraída de fuentes web.

DATOS BRUTOS:
${rawContext}

Clasifica en este JSON exacto (sin markdown):
{
  "hechos": ["hecho factual confirmado", "..."],
  "timeline": [
    { "momento": "descripción del momento", "tipo": "inicio|sospecha|escalada|revelacion|climax|desenlace" }
  ],
  "giros_potenciales": ["giro narrativo real o implícito en los datos", "..."],
  "contradicciones": ["versión A vs versión B o inconsistencia detectada", "..."],
  "detalles_inquietantes": ["detalle perturbador, cifra llamativa o comportamiento extraño", "..."],
  "momentos_clipables": ["fragmento con alto potencial viral o emocional", "..."]
}

REGLAS:
- Solo incluir lo que aparece en los datos — no inventar hechos
- Si los datos son escasos, prioriza lo que hay y extrae lo máximo posible
- Máximo 6 items por array
- momentos_clipables: prioriza revelaciones, cifras impactantes, comportamientos inexplicables`;
}

function buildUserPrompt(body: GenerateScriptBody, totalPalabras: number, secciones: SeccionDef[] = SECCIONES, contextoEstructurado?: TavilyContexto | null): string {
  const tonoDesc = TONO_DESCRIPCION[body.tono] ?? body.tono;

  // Si las secciones tienen campo `palabras` (ej. "600–800"), usarlo como mínimo por sección.
  // En caso contrario, distribuir proporcionalmente.
  const hasPalabrasField = secciones.some((s) => s.palabras);
  const seccionesTexto = hasPalabrasField
    ? secciones.map((s) => {
        const minWords = parseMinPalabras(s.palabras);
        const label = minWords ? ` [MÍNIMO ${minWords} palabras]` : '';
        return `- **${s.titulo}**${label}: ${s.instruccion}`;
      }).join('\n')
    : (() => {
        const hookMin = Math.min(70, Math.round(totalPalabras * 0.04));
        const restMin = Math.round((totalPalabras - hookMin) / Math.max(secciones.length - 1, 1));
        return secciones.map((s, i) => {
          const minWords = i === 0 ? hookMin : restMin;
          return `- **${s.titulo}** [MÍNIMO ${minWords} palabras]: ${s.instruccion}`;
        }).join('\n');
      })();
  const titulosNumerados = secciones.map((s, i) => `${i + 1}. "${s.titulo}"`).join('\n');

  const contextExtra = [
    body.titulo ? `**Título objetivo del vídeo**: ${body.titulo}` : '',
    body.angulo ? `**Ángulo diferenciador (análisis de competencia)**: ${body.angulo}` : '',
    contextoEstructurado ? formatContextoEstructurado(contextoEstructurado) : '',
  ].filter(Boolean).join('\n');

  return `Escribe un guión completo para un vídeo de YouTube sobre el siguiente personaje:

**Personaje**: ${body.personaje}
**Época y contexto**: ${body.epoca}
**Tono**: ${tonoDesc}
**Duración objetivo**: ${body.duracion} minutos — MÍNIMO OBLIGATORIO: ${totalPalabras} palabras en total (no menos). Si el guión queda corto, expande con detalles, contexto y dramatismo adicional hasta alcanzar el mínimo.${contextExtra ? `\n${contextExtra}` : ''}

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
        .map((s, i) => `${i + 1}. "${s.title}" — "${s.content.slice(0, 150).replace(/"/g, "'")}..."`)
        .join('\n')
    : '(sin secciones disponibles)';

  return `Eres un especialista en psicología del clic y optimización de CTR para YouTube. Tu único objetivo es maximizar:
- CTR (click-through rate)
- Retención inicial (primeros 30 segundos)
- Curiosidad compulsiva
- Tensión psicológica que obliga a entrar

Canal: ${nichoCtx}
Tema del vídeo: "${personaje}" — Contexto: ${epoca}

━━━ VÍDEO LARGO: TÍTULOS ━━━

Genera EXACTAMENTE 5 variantes de título. Cada una usa un vector psicológico distinto:

1. AMENAZA IMPLÍCITA — algo terrible ocurrió, el espectador aún no sabe qué
   Ejemplo: "El asesino que vivió años sin levantar sospechas"

2. REVELACIÓN PERTURBADORA — hay información oculta que lo cambia todo
   Ejemplo: "Lo que encontraron en su sótano cambió el caso para siempre"

3. CONTRADICCIÓN O PARADOJA — la situación es imposible o contradictoria
   Ejemplo: "Todos lo conocían. Nadie lo vio venir."

4. ACCIÓN SIN CONTEXTO — empieza en el momento de máxima tensión
   Ejemplo: "La policía llegó tarde. Otra vez."

5. INCOMODIDAD SISTÉMICA — el sistema falló, hay injusticia o secreto
   Ejemplo: "Lo sabían desde el principio. Y no hicieron nada."

REGLAS DE TÍTULO:
- Las primeras 3-5 palabras deben parar el scroll
- Entre 45 y 70 caracteres
- Prohibido: "La historia de…", "Caso de…", "Biografía de…"
- SEO invisible: keywords integradas de forma natural, nunca forzadas
- Tono humano y emocional, jamás robótico
- El título COORDINA con la miniatura, no la repite
- Sin emojis en títulos de vídeo largo

Evalúa internamente todos los candidatos. Devuelve los 5 mejores ordenados de mayor a menor impacto de clic estimado.

━━━ TEXTO PARA MINIATURA ━━━

Genera un texto complementario para la miniatura. DEBE:
- Máximo 4 palabras en MAYÚSCULAS
- Transmitir lo que el título NO dice (complemento, no duplicado)
- Crear tensión adicional junto al título elegido
Ejemplo: si el título es "La policía llegó tarde. Otra vez." → miniatura: "NADIE LO VIO VENIR"

━━━ DESCRIPCIÓN ━━━

Estructura en este orden exacto (separado por saltos de línea \\n):
1. [HOOK — máx 2 líneas] Frase brutal que amplía la tensión del título. Debe funcionar sola, cortada por YouTube. Sin el nombre del caso en primera línea.
2. [NARRATIVA EMOCIONAL — 2-3 frases] Introduce el caso con tensión creciente, sin revelar el desenlace.
3. [PREGUNTAS ABIERTAS — 2-3 preguntas] Las que el espectador se hace y el vídeo responde.
4. [CONTEXTO MÍNIMO — 1-2 frases] Datos necesarios sin spoilers.
5. [CTA SUAVE — 1 frase] Natural, no forzado.
6. [HASHTAGS] 5-8 hashtags relevantes.

Prohibido en primeras 2 líneas: "en este vídeo", "hoy hablamos de", links, spam de keywords.

━━━ TAGS ━━━

Entre 15 y 20 tags. Mezcla obligatoria:
- Nombre completo del caso o persona
- Aliases o apodos conocidos
- Localización (ciudad, país, año)
- Tipo de crimen específico
- Términos true crime en español
- Búsquedas emocionales reales ("caso sin resolver", "asesino en serie", "crimen real")
- Variantes de búsqueda (con/sin tildes, nombre y apellidos)
- Sin tags genéricos inútiles

━━━ SHORTS: para cada sección ━━━

SECCIONES:
${sectionsBlock}

Para cada sección genera:
- titulo_a: gancho psicológico · máx 70 chars · impacto en las primeras 4 palabras · 1 emoji
- titulo_b: variante con ángulo emocional distinto · máx 70 chars · 1 emoji
- desc: 4 líneas → [Acción brutal sin contexto] | [La situación] | [Dato que lo cambia todo] | [CTA que fuerza el loop]
- tags: 8-12 tags mezclando nicho + intención específica

━━━ JSON DE RESPUESTA (sin markdown) ━━━

{
  "titulos": ["variante1", "variante2", "variante3", "variante4", "variante5"],
  "titulo_miniatura": "TEXTO MINIATURA",
  "descripcion": "string con saltos de línea \\n",
  "tags": ["string"],
  "shorts_seo": [
    { "titulo_a": "...", "titulo_b": "...", "desc": "línea1\\nlínea2\\nlínea3\\nlínea4", "tags": ["..."] }
  ]
}`;
}

function buildNarrativaPrompt(
  personaje: string,
  epochs: string,
  nichoCtx: string,
  sections: { title: string; content: string }[]
): string {
  const seccionesTexto = sections
    .map((s, i) => `### Sección ${i} — "${s.title}"\n${s.content.slice(0, 500)}`)
    .join('\n\n');
  const nSecciones = sections.length;

  return `Eres un analista de narrativa viral para ${nichoCtx}. Analiza el guión y genera las capas de optimización.

Vídeo: "${personaje}" — ${epochs}

GUIÓN (extracto):
${seccionesTexto}

Genera exactamente este JSON (sin markdown):
{
  "giros_detectados": [
    { "seccion": 0, "tipo": "GIRO", "frase": "frase exacta del giro (15-25 palabras)", "timestamp_estimado": "1:30" }
  ],
  "clips": [
    { "timestamp_estimado": "0:45", "texto": "fragmento literal del guión (20-40 palabras)", "tipo": "hook", "duracion": 30, "viralidad": 8 }
  ],
  "shorts_estructurados": [
    { "seccion": 0, "hook": "apertura agresiva máx 15 palabras", "desarrollo": "contexto mínimo 30-50 palabras", "cierre": "remate que fuerza el loop máx 15 palabras", "duracion_estimada": 30 }
  ],
  "plataformas": {
    "youtube": "reescribe el hook de sección 0 en tono narrativo largo 60-80 palabras",
    "tiktok": "versión staccato: frases 5-8 palabras ritmo rápido 40-50 palabras",
    "reels": "versión emocional del hook menos técnico 50-60 palabras"
  },
  "nivel_tension": [3, 5, 7, 8, 9, 6],
  "retention_warnings": []
}

REGLAS:
- giros_detectados: mínimo 1 por sección; tipo exactamente GIRO|REVELACION|SOSPECHA|IMPACTO
- clips: mínimo 5 clips distribuidos por todo el guión; tipo exactamente hook|giro|impacto|revelacion; duracion solo 15, 30 o 45; viralidad 1-10
- shorts_estructurados: exactamente 1 short por sección; lenguaje directo y agresivo; 15-40 segundos
- nivel_tension: exactamente ${nSecciones} números enteros 1-10; debe crecer hacia el clímax y bajar en el cierre
- retention_warnings: lista los problemas detectados; array vacío si no hay problemas`;
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
    const canalData = canal as { config?: LLMConfig & { system_prompt_guion?: string; secciones_personalizadas?: string; tipos_guion?: string; tavily_api_key?: string; tavily_enabled?: boolean }; nicho?: string; descripcion?: string } | null;
    const canalConfig = canalData?.config ?? {};
    const nichoCtx = [canalData?.nicho, canalData?.descripcion].filter(Boolean).join(' — ') || 'contenido en español';

    let seccionesActivas: SeccionDef[] = SECCIONES;

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
          const rawParsed = JSON.parse(seccionesRaw);
          // Soporta array plano o { estructura: [...], reglas_globales: {...} }
          const candidateArray: unknown = Array.isArray(rawParsed) ? rawParsed : (rawParsed?.estructura ?? null);
          if (Array.isArray(candidateArray) && candidateArray.length >= 2 && (candidateArray[0] as SeccionDef)?.titulo && (candidateArray[0] as SeccionDef)?.instruccion) {
            seccionesActivas = candidateArray as SeccionDef[];
          }
        } catch {
          // JSON inválido → usar SECCIONES por defecto
        }
      }
    }

    const tavilyKey = canalConfig.tavily_api_key?.trim();
    const tavilyEnabled = canalConfig.tavily_enabled !== false;
    let contextoEstructurado: TavilyContexto | null = null;
    let tavilyContextChars = 0;
    if (tavilyKey && tavilyEnabled) {
      const searchQuery = `${validBody.personaje} ${validBody.epoca} caso criminal real historia`;
      console.info(`[generate-script] Tavily search enabled for canal ${canal_id}: "${searchQuery}"`);
      const contextoRaw = await searchCaseContext(searchQuery, tavilyKey).catch((error) => {
        console.warn('[generate-script] Tavily search failed:', error instanceof Error ? error.message : error);
        return '';
      });
      tavilyContextChars = contextoRaw.length;
      if (contextoRaw) {
        try {
          const rawAnalysis = await callLLM({
            system: 'Eres un analista de narrativa true crime. Clasificas datos factuales en estructuras narrativas para guionistas. Respondes SOLO con JSON válido.',
            messages: [{ role: 'user', content: buildTavilyAnalysisPrompt(validBody.personaje.trim(), validBody.epoca.trim(), contextoRaw) }],
            maxTokens: 2000,
            model: 'fast',
            canalConfig,
          });
          contextoEstructurado = JSON.parse(extractJSON(rawAnalysis)) as TavilyContexto;
        } catch {
          console.warn('[generate-script] Análisis Tavily fallido — continuando sin análisis estructurado');
        }
      }
    } else if (!tavilyKey) {
      console.info(`[generate-script] Tavily skipped for canal ${canal_id}: no api key configured`);
    } else {
      console.info(`[generate-script] Tavily skipped for canal ${canal_id}: disabled`);
    }

    const rawText = await callLLM({
      system: buildSystemPrompt(canalConfig.system_prompt_guion),
      messages: [{ role: 'user', content: buildUserPrompt(validBody, totalPalabras, seccionesActivas, contextoEstructurado) }],
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

    // Pase de expansión: detectar secciones por debajo del 80% de su mínimo y ampliarlas
    const expansionItems = parsed.sections
      .map((s, i) => {
        const minPalabras = parseMinPalabras(seccionesActivas[i]?.palabras);
        if (!minPalabras) return null;
        const wc = s.content.split(/\s+/).filter(Boolean).length;
        if (wc >= minPalabras * 0.8) return null;
        return { index: i, title: s.title, content: s.content, wc, minPalabras };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (expansionItems.length > 0) {
      console.info(`[generate-script] Expansion pass: ${expansionItems.length} secciones cortas → ${expansionItems.map((x) => `"${x.title}" (${x.wc}/${x.minPalabras})`).join(', ')}`);
      const expansionPrompt = `Las siguientes secciones del guión no alcanzan el mínimo de palabras requerido. Amplía CADA UNA añadiendo más narrativa, detalles concretos, tensión progresiva y micro-eventos. Mantén exactamente el mismo tono y estilo.\n\n${
        expansionItems
          .map((item) => `SECCIÓN "${item.title}"\nActual: ${item.wc} palabras | MÍNIMO OBLIGATORIO: ${item.minPalabras} palabras\n---\n${item.content}`)
          .join('\n\n===\n\n')
      }\n\nJSON exacto (sin markdown): { "sections": [ { "title": "título exacto", "content": "texto expandido" } ] }\nIncluye SOLO las secciones listadas, en el mismo orden.`;
      try {
        const expansionRaw = await callLLM({
          system: buildSystemPrompt(canalConfig.system_prompt_guion),
          messages: [{ role: 'user', content: expansionPrompt }],
          maxTokens: 8192,
          model: 'main',
          canalConfig,
        });
        const expandedData = JSON.parse(extractJSON(expansionRaw)) as { sections: { title: string; content: string }[] };
        if (Array.isArray(expandedData.sections)) {
          expansionItems.forEach((item, ei) => {
            const expanded = expandedData.sections[ei];
            if (expanded?.content) parsed.sections[item.index].content = expanded.content;
          });
          console.info('[generate-script] Expansion pass completado');
        }
      } catch {
        console.warn('[generate-script] Expansion pass fallido — se guarda el guión original');
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

    // Llamadas paralelas: SEO + Hooks + Narrativa (las 7 capas)
    type ShortSeoItem = { titulo_a: string; titulo_b: string; desc: string; tags: string[] };
    type SeoData = { titulos: string[]; titulo_miniatura?: string; descripcion: string; tags: string[]; shorts_seo: ShortSeoItem[] };
    type HooksData = { hooks: { estilo: string; texto: string }[] };
    type NarrativaData = {
      giros_detectados: { seccion: number; tipo: string; frase: string; timestamp_estimado?: string }[];
      clips: { timestamp_estimado: string; texto: string; tipo: string; duracion: number; viralidad: number }[];
      shorts_estructurados: { seccion: number; hook: string; desarrollo: string; cierre: string; duracion_estimada: number }[];
      plataformas: { youtube: string; tiktok: string; reels: string };
      nivel_tension: number[];
      retention_warnings: string[];
    };

    const personaje = validBody.personaje.trim();
    const epoca = validBody.epoca.trim();
    const hookOriginal = parsed.sections[0]?.content ?? '';

    const [seoResult, hooksResult, narrativaResult] = await Promise.allSettled([
      callLLM({
        system: `Eres un especialista en psicología del clic y CTR para YouTube. Tu misión es generar títulos, descripciones y tags que maximicen el click-through rate y la retención inicial. Priorizas impacto psicológico sobre SEO clásico. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`,
        messages: [{ role: 'user', content: buildSeoPrompt(personaje, epoca, nichoCtx, parsed.sections) }],
        maxTokens: 4000,
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
      callLLM({
        system: `Eres un analista de narrativa viral especializado en ${nichoCtx}. Analizas guiones y generas capas de optimización: giros narrativos, mapa de clips virales, shorts estructurados, adaptaciones multiplataforma y métricas de tensión. Respondes SOLO con JSON válido.`,
        messages: [{ role: 'user', content: buildNarrativaPrompt(personaje, epoca, nichoCtx, parsed.sections) }],
        maxTokens: 3000,
        model: 'fast',
        canalConfig,
      }),
    ]);

    let seoData: SeoData | null = null;
    let hooksData: HooksData | null = null;
    let narrativaData: NarrativaData | null = null;
    const dbUpdate: Record<string, unknown> = { hook_original: hookOriginal };

    if (seoResult.status === 'fulfilled') {
      try {
        seoData = JSON.parse(extractJSON(seoResult.value)) as SeoData;
        const shortsSeo = seoData.shorts_seo ?? [];
        dbUpdate.titulos_seo = seoData.titulos;
        dbUpdate.titulo_miniatura_seo = seoData.titulo_miniatura ?? '';
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

    if (narrativaResult.status === 'fulfilled') {
      try {
        narrativaData = JSON.parse(extractJSON(narrativaResult.value)) as NarrativaData;
        if (narrativaData.giros_detectados?.length) dbUpdate.giros_detectados = narrativaData.giros_detectados;
        if (narrativaData.clips?.length) dbUpdate.clips = narrativaData.clips;
        if (narrativaData.shorts_estructurados?.length) dbUpdate.shorts_estructurados = narrativaData.shorts_estructurados;
        if (narrativaData.plataformas) dbUpdate.plataformas = narrativaData.plataformas;
        if (narrativaData.nivel_tension?.length) dbUpdate.nivel_tension = narrativaData.nivel_tension;
        if (Array.isArray(narrativaData.retention_warnings)) dbUpdate.retention_warnings = narrativaData.retention_warnings;
      } catch { console.error('Error parseando narrativa (no crítico)'); }
    } else {
      console.error('Error generando narrativa (no crítico):', narrativaResult.reason);
    }

    await StudioScript.findByIdAndUpdate(script._id, dbUpdate);

    return NextResponse.json({
      success: true,
      id: script._id.toString(),
      sections: parsed.sections,
      seo: seoData,
      hooks: hooksData?.hooks ?? null,
      giros_detectados: narrativaData?.giros_detectados ?? null,
      clips: narrativaData?.clips ?? null,
      shorts_estructurados: narrativaData?.shorts_estructurados ?? null,
      plataformas: narrativaData?.plataformas ?? null,
      nivel_tension: narrativaData?.nivel_tension ?? null,
      retention_warnings: narrativaData?.retention_warnings ?? null,
      tavily: {
        configured: Boolean(tavilyKey),
        enabled: tavilyEnabled,
        used: Boolean(contextoEstructurado),
        context_chars: tavilyContextChars,
      },
    });
  } catch (error) {
    console.error('Error generando guión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
