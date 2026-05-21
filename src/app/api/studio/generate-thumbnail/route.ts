import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { callLLM, extractJSON, type LLMConfig } from '@/lib/studio/llm-client';
import { runComfyWorkflow } from '@/lib/studio/comfyui-client';

const FONT_PATH = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public/studio/thumbnails');

interface ThumbnailTexts {
  texto_principal: string;
  subtitulo: string;
  contexto: string;
}

function generateFallbackTexts(personaje: string, epoca: string): ThumbnailTexts {
  // Extraer año de la época si existe
  const yearMatch = epoca.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
  const year = yearMatch ? yearMatch[0] : '';
  // Extraer lugar aproximado
  const lugar = epoca.split(',')[0].trim().toUpperCase().substring(0, 20);
  const contexto = year ? `${lugar}, ${year}` : lugar || 'HISTORIA REAL';
  const nombre = personaje.toUpperCase();
  return {
    texto_principal: nombre.length > 20 ? nombre.split(' ').slice(0, 2).join(' ') : nombre,
    subtitulo: 'LA HISTORIA REAL',
    contexto,
  };
}

async function generateThumbnailTexts(
  canalConfig: LLMConfig,
  personaje: string,
  epoca: string,
  guionHook: string
): Promise<ThumbnailTexts> {
  try {
    const raw = await callLLM({
      system: 'Eres un copywriter experto en YouTube. Respondes SOLO con JSON válido, sin texto extra ni bloques de código.',
      messages: [
        {
          role: 'user',
          content: `Crea textos de miniatura para un vídeo de YouTube sobre ${personaje} (${epoca}).

3 niveles jerárquicos — sigue las reglas estrictamente:
- texto_principal: GANCHO de máximo 3 palabras en mayúsculas que genere tensión o curiosidad (ej: "SANGRE FRÍA", "EL SECRETO", "NADIE ESCAPÓ", "LA BESTIA")
- subtitulo: nombre del personaje o del crimen en mayúsculas, puede ser más largo (ej: "CHARLES MANSON", "EL CRIMEN DE ALCÀSSER")
- contexto: solo "CIUDAD, AÑO" o "PAÍS, AÑO" (ej: "LOS ÁNGELES, 1969")

Devuelve SOLO este JSON:
{"texto_principal":"GANCHO CORTO","subtitulo":"NOMBRE O CRIMEN","contexto":"LUGAR, AÑO"}

Contexto del vídeo: ${guionHook.substring(0, 200)}`,
        },
      ],
      maxTokens: 200,
      model: 'fast',
      canalConfig,
    });

    const cleaned = extractJSON(raw);
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return generateFallbackTexts(personaje, epoca);

    const parsed = JSON.parse(jsonMatch[0]) as ThumbnailTexts;
    if (!parsed.texto_principal) return generateFallbackTexts(personaje, epoca);
    return parsed;
  } catch {
    return generateFallbackTexts(personaje, epoca);
  }
}

const DEFAULT_STYLE_PROMPT =
  'Dramatic cinematic portrait of [character description], black and white with red accents, extreme close up face, dark menacing expression, dark atmospheric background, dramatic chiaroscuro lighting, photorealistic, high detail, no text, no watermark, film noir style, intimidating';

async function generateFluxPrompt(
  canalConfig: LLMConfig,
  personaje: string,
  epoca: string,
  guionHook: string,
  stylePrompt?: string
): Promise<string> {
  const systemInstructions = stylePrompt?.trim() || DEFAULT_STYLE_PROMPT;
  const raw = await callLLM({
    system: `${systemInstructions}\n\nYou generate English image prompts for AI image generators. Return ONLY the prompt text, no explanations, no markdown.`,
    messages: [
      {
        role: 'user',
        content: `Generate a YouTube thumbnail image prompt (80–120 words) specifically for: ${personaje} (${epoca}).\n\nContext: ${guionHook.substring(0, 250)}\n\nApply your style instructions exactly. Make it specific to this subject — vary composition, expression, and visual details based on who this person is and when they lived. Return ONLY the prompt text.`,
      },
    ],
    maxTokens: 300,
    model: 'fast',
    canalConfig,
  });
  const finalPrompt = raw.trim() + ', no text, no letters, no watermarks';
  console.log(`[generate-thumbnail] FLUX prompt para "${personaje}":`, finalPrompt);
  return finalPrompt;
}

async function freepikGenerateThumbnail(prompt: string, apiKey: string): Promise<Buffer> {
  const createRes = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
    method: 'POST',
    headers: {
      'x-freepik-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: 'text, watermark, cartoon, anime, logo, signature, letters, numbers, low quality, blurry',
      num_images: 1,
      image: { size: 'landscape_16_9' },
      styling: { style: 'photo' },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Freepik error ${createRes.status}: ${errText.slice(0, 300)}`);
  }

  const createData = (await createRes.json()) as {
    data: Array<{ base64?: string }> | { _id?: string; task_id?: string; status?: string; generated?: Array<{ base64?: string }> };
  };

  if (Array.isArray(createData.data)) {
    const first = createData.data[0];
    if (first?.base64) return Buffer.from(first.base64, 'base64');
    throw new Error('Freepik síncrono: sin base64');
  }

  const asyncData = createData.data as { _id?: string; task_id?: string; status?: string; generated?: Array<{ base64?: string }> };
  if (asyncData?.generated?.[0]?.base64) return Buffer.from(asyncData.generated[0].base64!, 'base64');

  const taskId = asyncData?._id ?? asyncData?.task_id;
  if (!taskId) throw new Error('Freepik: formato de respuesta desconocido');

  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.freepik.com/v1/ai/text-to-image/${taskId}`, {
      headers: { 'x-freepik-api-key': apiKey, Accept: 'application/json' },
    });
    if (!pollRes.ok) continue;
    const pollData = (await pollRes.json()) as { data?: { status?: string; generated?: Array<{ base64?: string }> } };
    const status = pollData.data?.status?.toUpperCase();
    if ((status === 'COMPLETED' || status === 'DONE') && pollData.data?.generated?.[0]?.base64) {
      return Buffer.from(pollData.data.generated[0].base64!, 'base64');
    }
    if (status === 'FAILED' || status === 'ERROR') throw new Error(`Freepik: generación fallida (task ${taskId})`);
  }

  throw new Error(`Freepik: timeout esperando miniatura (task ${taskId})`);
}

async function generateAiCompleteThumbnail(
  canalConfig: LLMConfig & { openai_api_key?: string; thumbnail_style_prompt?: string },
  personaje: string,
  epoca: string,
  guionHook: string,
  outputPath: string
): Promise<void> {
  const apiKey = canalConfig.openai_api_key;
  if (!apiKey) throw new Error('OpenAI API key no configurada — necesaria para modo AI completa');

  const styleInstructions = canalConfig.thumbnail_style_prompt?.trim() || DEFAULT_STYLE_PROMPT;

  // Paso 1: LLM genera un prompt visual optimizado para gpt-image-1
  const dallePrompt = await callLLM({
    system: `${styleInstructions}\n\nYou generate English image prompts for OpenAI image generation. Return ONLY the final image prompt text, no explanations, no markdown, no rules.`,
    messages: [
      {
        role: 'user',
        content: `Generate a complete image prompt (100–150 words) for a YouTube thumbnail about: ${personaje} (${epoca}).\n\nContext: ${guionHook.substring(0, 250)}\n\nApply your visual style rules. Describe the subject's appearance, expression, lighting, and composition in concrete visual terms. The image must be 16:9. Return ONLY the prompt text.`,
      },
    ],
    maxTokens: 350,
    model: 'fast',
    canalConfig,
  });

  console.log(`[generate-thumbnail] gpt-image-1 prompt para "${personaje}":`, dallePrompt.trim());

  // Paso 2: Llamada a gpt-image-1
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: dallePrompt.trim() + ', no text, no letters, no watermarks',
      n: 1,
      size: '1536x1024',
      quality: 'high',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DALL-E error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { data: Array<{ b64_json?: string }> };
  const b64 = data.data[0]?.b64_json;
  if (!b64) throw new Error('DALL-E: respuesta sin imagen');

  const imgBuffer = Buffer.from(b64, 'base64');

  // Paso 3: Redimensionar a 1280x720 con Sharp
  const sharp = (await import('sharp')).default;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(imgBuffer).resize(1280, 720, { fit: 'cover', position: 'center' }).jpeg({ quality: 92 }).toFile(outputPath);
}

async function generateBaseImageWithFlux(prompt: string, outputPath: string): Promise<void> {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) throw new Error('HUGGINGFACE_TOKEN no configurado');

  const negativePrompt =
    'cartoon, anime, text, watermark, low quality, blurry, deformed, ugly';

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width: 1280,
              height: 720,
              num_inference_steps: 4,
              negative_prompt: negativePrompt,
            },
          }),
          signal: AbortSignal.timeout(60000),
        }
      );

      if (response.status === 503) {
        // Modelo cargando, esperar y reintentar
        await new Promise((r) => setTimeout(r, 20000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HuggingFace error ${response.status}: ${errText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1000) throw new Error('Imagen demasiado pequeña, posible error');

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) await new Promise((r) => setTimeout(r, 5000));
    }
  }

  throw lastError ?? new Error('Error desconocido generando imagen');
}

// ── Bebas Neue: ratio ancho/alto ≈ 0.50 (fuente condensada) ──────────────
const CHAR_RATIO = 0.50;

/** Tamaño del texto principal según longitud */
function calcMainFontSize(len: number): number {
  if (len <= 20) return 120;
  if (len <= 30) return 95;
  return 75;
}

/** Divide texto en líneas respetando maxWidth */
function wrapWords(text: string, maxWidth: number, fontSize: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * CHAR_RATIO));
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= charsPerLine) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Tamaño óptimo para el subtítulo que quepa en maxLines */
function calcSubFontSize(text: string, maxWidth: number, maxLines: number): number {
  for (const size of [90, 70, 55, 45, 35]) {
    if (wrapWords(text, maxWidth, size).length <= maxLines) return size;
  }
  return 35;
}

/** Genera SVG <text> con <tspan> para word-wrap */
function buildTextElement(
  lines: string[],
  x: number,
  baselineY: number,
  fontSize: number,
  fill: string,
  filterId: string,
  maxLines: number,
  extraAttrs = ''
): string {
  const lineHeight = Math.round(fontSize * 1.1);
  const tspans = lines
    .slice(0, maxLines)
    .map((line, i) =>
      `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('');
  return `<text x="${x}" y="${baselineY}" font-family="BebasNeue, Arial Black, sans-serif" font-size="${fontSize}" fill="${fill}" filter="url(#${filterId})" font-weight="bold"${extraAttrs}>${tspans}</text>`;
}

async function composeThumbnail(
  baseImagePath: string,
  texts: ThumbnailTexts,
  outputPath: string,
  accentColor: string = '#CC0000',
  canalNombre: string = 'STUDIO'
): Promise<void> {
  const sharp = (await import('sharp')).default;

  const W = 1280;
  const H = 720;
  const X = 70;              // padding lateral (deja espacio al borde rojo)
  const MAX_W_MAIN = 430;    // tercio izquierdo — imagen FLUX respira
  const MAX_W_SUB  = 430;
  const CTX_SIZE   = 32;

  // ── Cálculos ───────────────────────────────────────────────────────────
  const mainFontSize  = calcMainFontSize(texts.texto_principal.length);
  const mainLines     = wrapWords(texts.texto_principal, MAX_W_MAIN, mainFontSize);
  const mainLineH     = Math.round(mainFontSize * 1.1);

  const subText       = texts.subtitulo.toUpperCase();
  const subFontSize   = calcSubFontSize(subText, MAX_W_SUB, 2);
  const subLines      = wrapWords(subText, MAX_W_SUB, subFontSize);
  const subLineH      = Math.round(subFontSize * 1.1);

  // Y baselines (SVG y = baseline primera línea)
  const mainBaseY  = 80 + mainFontSize;
  const mainBottom = mainBaseY + (mainLines.length - 1) * mainLineH;
  const subBaseY   = mainBottom + subFontSize + 24;
  const subBottom  = subBaseY  + (subLines.length  - 1) * subLineH;
  const ctxY       = Math.min(subBottom + CTX_SIZE + 18, H - 55);

  // ── Overlay ────────────────────────────────────────────────────────────
  const overlayLeft = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeRight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   style="stop-color:black;stop-opacity:0.88"/>
          <stop offset="60%"  style="stop-color:black;stop-opacity:0.55"/>
          <stop offset="100%" style="stop-color:black;stop-opacity:0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeRight)"/>
      <rect x="0" y="0" width="6" height="${H}" fill="${accentColor}"/>
    </svg>`
  );

  // ── Texto SVG ──────────────────────────────────────────────────────────
  const textSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>@font-face { font-family: 'BebasNeue'; src: url('${FONT_PATH}'); }</style>
        <filter id="shadowMain" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="4" dy="4" stdDeviation="4" flood-color="black" flood-opacity="0.9"/>
        </filter>
        <filter id="shadowSub" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="3" dy="3" stdDeviation="3" flood-color="black" flood-opacity="0.9"/>
        </filter>
        <filter id="shadowCtx" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.8"/>
        </filter>
      </defs>

      ${buildTextElement(mainLines, X, mainBaseY, mainFontSize, accentColor, 'shadowMain', 4)}
      ${buildTextElement(subLines,  X, subBaseY,  subFontSize,  '#FFFFFF', 'shadowSub',  2)}

      <text x="${X}" y="${ctxY}"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="${CTX_SIZE}" fill="#CCCCCC" filter="url(#shadowCtx)"
      >— ${escapeXml(texts.contexto)} —</text>

      <text x="${X}" y="682"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="28" fill="#AAAAAA" letter-spacing="2"
      >${escapeXml(canalNombre.toUpperCase())}</text>
    </svg>`
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await sharp(baseImagePath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .composite([
      { input: overlayLeft, blend: 'over' },
      { input: textSvg,     blend: 'over' },
    ])
    .jpeg({ quality: 92 })
    .toFile(outputPath);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId } = (await request.json()) as { scriptId?: string };

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).lean();
    const canalConfig = ((canal as { config?: LLMConfig } | null)?.config ?? {}) as LLMConfig;

    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    if (script.thumbnail_status === 'processing') {
      return NextResponse.json({ status: 'processing', message: 'Ya está generando miniatura' });
    }

    // Marcar como procesando
    await StudioScript.findByIdAndUpdate(scriptId, {
      thumbnail_status: 'processing',
      thumbnail_error: undefined,
    });

    // Ejecutar en background
    (async () => {
      try {
        // Extraer hook del primer párrafo del guión
        const primerSeccion = script.guion_json?.[0];
        const guionHook = primerSeccion
          ? `${primerSeccion.title}: ${primerSeccion.content.substring(0, 200)}`
          : `${script.personaje}, ${script.epoca}`;

        const rawCanalFull = canal as { nombre?: string; config?: { thumbnail_mode?: string; thumbnail_style_prompt?: string; thumbnail_accent_color?: string; imagen_motor?: string; comfyui_api_key?: string; comfyui_workflow_overrides?: Record<string, string>; openai_api_key?: string } } | null;
        const thumbnailMode = rawCanalFull?.config?.thumbnail_mode ?? 'classic';

        if (thumbnailMode === 'ai_complete') {
          // ── MODO AI COMPLETA: DALL-E genera la imagen base, overlay igual que classic ──
          const basePath = path.join(THUMBNAILS_DIR, `${scriptId}-base.jpg`);
          const finalPath = path.join(THUMBNAILS_DIR, `${scriptId}.jpg`);
          const aiConfig = { ...canalConfig, openai_api_key: rawCanalFull?.config?.openai_api_key, thumbnail_style_prompt: rawCanalFull?.config?.thumbnail_style_prompt };

          // Paso 1: DALL-E genera la imagen base
          await generateAiCompleteThumbnail(aiConfig, script.personaje, script.epoca, guionHook, basePath);

          // Paso 2: Generar textos con LLM
          const texts = await generateThumbnailTexts(canalConfig, script.personaje, script.epoca, guionHook);

          // Paso 3: Componer miniatura final con overlay SVG
          const accentColor = rawCanalFull?.config?.thumbnail_accent_color ?? '#CC0000';
          const canalNombre = rawCanalFull?.nombre ?? 'STUDIO';
          await composeThumbnail(basePath, texts, finalPath, accentColor, canalNombre);

          await StudioScript.findByIdAndUpdate(scriptId, {
            thumbnail_status: 'ready',
            thumbnail_path: `/studio/thumbnails/${scriptId}.jpg`,
            thumbnail_base_path: `/studio/thumbnails/${scriptId}-base.jpg`,
            thumbnail_texts: texts,
            $unset: { thumbnail_error: '' },
          });
        } else {
          // ── MODO CLÁSICO: imagen base + overlay SVG ────────────────────────────
          // Paso 1: Generar textos con LLM del canal
          const texts = await generateThumbnailTexts(canalConfig, script.personaje, script.epoca, guionHook);

          // Paso 2: Generar prompt de imagen
          const fluxPrompt = await generateFluxPrompt(
            canalConfig,
            script.personaje,
            script.epoca,
            guionHook,
            rawCanalFull?.config?.thumbnail_style_prompt
          );

          // Paso 3: Generar imagen base según motor configurado
          const basePath = path.join(THUMBNAILS_DIR, `${scriptId}-base.jpg`);
          const imagenMotor = rawCanalFull?.config?.imagen_motor ?? 'auto';
          if (imagenMotor === 'comfyui') {
            const comfyKey = rawCanalFull?.config?.comfyui_api_key;
            if (!comfyKey) throw new Error('API key ComfyUI no configurada');
            const overrides = rawCanalFull?.config?.comfyui_workflow_overrides ?? {};
            const imgBuffer = await runComfyWorkflow('thumbnail', { prompt: fluxPrompt }, comfyKey, overrides.thumbnail);
            fs.mkdirSync(path.dirname(basePath), { recursive: true });
            fs.writeFileSync(basePath, imgBuffer);
          } else if (imagenMotor === 'freepik' || (imagenMotor === 'auto' && process.env.FREEPIK_API_KEY)) {
            const freepikKey = process.env.FREEPIK_API_KEY;
            if (!freepikKey) throw new Error('FREEPIK_API_KEY no configurada');
            const imgBuffer = await freepikGenerateThumbnail(fluxPrompt, freepikKey);
            fs.mkdirSync(path.dirname(basePath), { recursive: true });
            fs.writeFileSync(basePath, imgBuffer);
          } else {
            await generateBaseImageWithFlux(fluxPrompt, basePath);
          }

          // Paso 4: Componer miniatura final con Sharp
          const finalPath = path.join(THUMBNAILS_DIR, `${scriptId}.jpg`);
          const accentColor = rawCanalFull?.config?.thumbnail_accent_color ?? '#CC0000';
          const canalNombre = rawCanalFull?.nombre ?? 'STUDIO';
          await composeThumbnail(basePath, texts, finalPath, accentColor, canalNombre);

          // Paso 5: Guardar en MongoDB
          await StudioScript.findByIdAndUpdate(scriptId, {
            thumbnail_status: 'ready',
            thumbnail_path: `/studio/thumbnails/${scriptId}.jpg`,
            thumbnail_base_path: `/studio/thumbnails/${scriptId}-base.jpg`,
            thumbnail_texts: texts,
            $unset: { thumbnail_error: '' },
          });
        }
      } catch (err) {
        console.error('[generate-thumbnail] Error background:', err);
        await StudioScript.findByIdAndUpdate(scriptId, {
          thumbnail_status: 'error',
          thumbnail_error: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    })();

    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Generando miniatura en background',
    });
  } catch (err) {
    console.error('[generate-thumbnail] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
