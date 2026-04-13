import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';

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
  anthropic: Anthropic,
  personaje: string,
  epoca: string,
  guionHook: string
): Promise<ThumbnailTexts> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Eres un copywriter experto en YouTube. Crea textos de miniatura para un documental histórico sobre ${personaje} (${epoca}).

Devuelve SOLO este JSON (sin texto extra, sin bloques de código):
{"texto_principal":"FRASE CORTA EN MAYÚSCULAS","subtitulo":"SUBTÍTULO IMPACTANTE","contexto":"LUGAR, AÑO"}

Contexto del documental: ${guionHook.substring(0, 200)}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return generateFallbackTexts(personaje, epoca);

    // Eliminar bloques de código markdown si los hay
    const cleaned = content.text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return generateFallbackTexts(personaje, epoca);

    const parsed = JSON.parse(jsonMatch[0]) as ThumbnailTexts;
    if (!parsed.texto_principal) return generateFallbackTexts(personaje, epoca);
    return parsed;
  } catch {
    return generateFallbackTexts(personaje, epoca);
  }
}

async function generateFluxPrompt(
  anthropic: Anthropic,
  personaje: string,
  epoca: string,
  guionHook: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Generate a short English image prompt (max 50 words) for a dramatic portrait of ${personaje} from ${epoca} in the style: "Dramatic cinematic portrait of [character description], ${epoca}, black and white with red accents, extreme close up face, dark menacing expression, dark atmospheric background, dramatic chiaroscuro lighting, photorealistic, high detail, no text, no watermark, film noir style, intimidating". Context: ${guionHook}. Return ONLY the prompt text.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Respuesta inesperada');
  return content.text.trim();
}

async function generateBaseImageWithFlux(prompt: string, outputPath: string): Promise<void> {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) throw new Error('HUGGINGFACE_TOKEN no configurado');

  const negativePrompt =
    'cartoon, anime, text, watermark, bright colors, happy, smiling, modern clothing, low quality, blurry';

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
  outputPath: string
): Promise<void> {
  const sharp = (await import('sharp')).default;

  const W = 1280;
  const H = 720;
  const X = 50;              // padding lateral izquierdo
  const MAX_W_MAIN = 1180;   // 1280 - 50 - 50
  const MAX_W_SUB  = 1100;
  const CTX_SIZE   = 45;

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
          <stop offset="0%"   style="stop-color:black;stop-opacity:0.85"/>
          <stop offset="75%"  style="stop-color:black;stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:black;stop-opacity:0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeRight)"/>
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

      ${buildTextElement(mainLines, X, mainBaseY, mainFontSize, '#CC0000', 'shadowMain', 4)}
      ${buildTextElement(subLines,  X, subBaseY,  subFontSize,  '#FFFFFF', 'shadowSub',  2)}

      <text x="${X}" y="${ctxY}"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="${CTX_SIZE}" fill="#AAAAAA" filter="url(#shadowCtx)"
      >— ${escapeXml(texts.contexto)} —</text>

      <text x="${X}" y="685"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="28" fill="#666666" letter-spacing="2"
      >ALMAS CORRUPTAS</text>
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

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 });
    }

    await connectDB();
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
        const anthropic = new Anthropic({ apiKey: anthropicKey });

        // Extraer hook del primer párrafo del guión
        const primerSeccion = script.guion_json?.[0];
        const guionHook = primerSeccion
          ? `${primerSeccion.title}: ${primerSeccion.content.substring(0, 200)}`
          : `${script.personaje}, ${script.epoca}`;

        // Paso 1: Generar textos con Claude
        const texts = await generateThumbnailTexts(
          anthropic,
          script.personaje,
          script.epoca,
          guionHook
        );

        // Paso 2: Generar prompt FLUX
        const fluxPrompt = await generateFluxPrompt(
          anthropic,
          script.personaje,
          script.epoca,
          guionHook
        );

        // Paso 3: Generar imagen base con FLUX
        const basePath = path.join(THUMBNAILS_DIR, `${scriptId}-base.jpg`);
        await generateBaseImageWithFlux(fluxPrompt, basePath);

        // Paso 4: Componer miniatura final con Sharp
        const finalPath = path.join(THUMBNAILS_DIR, `${scriptId}.jpg`);
        await composeThumbnail(basePath, texts, finalPath);

        // Paso 5: Guardar en MongoDB
        await StudioScript.findByIdAndUpdate(scriptId, {
          thumbnail_status: 'ready',
          thumbnail_path: `/studio/thumbnails/${scriptId}.jpg`,
          thumbnail_base_path: `/studio/thumbnails/${scriptId}-base.jpg`,
          thumbnail_texts: texts,
          $unset: { thumbnail_error: '' },
        });
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
