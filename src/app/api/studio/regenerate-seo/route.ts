import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, extractJSON } from '@/lib/studio/llm-client';

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

    const sections = (script.guion_json ?? []) as { title: string; content: string }[];

    const seoRaw = await callLLM({
      system: `Eres un especialista en psicología del clic y CTR para YouTube. Tu misión es generar títulos, descripciones y tags que maximicen el click-through rate y la retención inicial. Priorizas impacto psicológico sobre SEO clásico. Canal: ${nichoCtx}. Respondes SOLO con JSON válido.`,
      messages: [{ role: 'user', content: buildSeoPrompt(script.personaje, script.epoca, nichoCtx, sections) }],
      maxTokens: 4000,
      model: 'fast',
      canalConfig,
    });

    type ShortSeo = { titulo_a: string; titulo_b: string; desc: string; tags: string[] };
    const seoData = JSON.parse(extractJSON(seoRaw)) as {
      titulos: string[];
      titulo_miniatura?: string;
      descripcion: string;
      tags: string[];
      shorts_seo: ShortSeo[];
    };

    const shortsSeo: ShortSeo[] = seoData.shorts_seo ?? [];

    await StudioScript.findByIdAndUpdate(scriptId, {
      titulos_seo: seoData.titulos,
      titulo_miniatura_seo: seoData.titulo_miniatura ?? '',
      descripcion_seo: seoData.descripcion,
      tags_seo: seoData.tags,
      titulos_seo_shorts: shortsSeo.map((s) => s.titulo_a),
      shorts_seo: shortsSeo,
      seo_titulo_seleccionado: 0,
    });

    return NextResponse.json({ success: true, seo: { ...seoData, titulos_shorts: shortsSeo.map((s) => s.titulo_a) } });
  } catch (error) {
    console.error('Error regenerando SEO:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
