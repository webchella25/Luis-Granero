import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import StudioCanal from '@/models/StudioCanal';

const FONT_PATH = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const MINIATURAS_DIR = path.join(process.cwd(), 'public/studio/musica-ambiental/miniaturas');

const DEFAULT_STYLE_PROMPT =
  'Atmospheric ambient music background, dreamy aesthetic, soft bokeh lights, purple and blue tones, cozy aesthetic, misty forest or cozy room, photorealistic, cinematic mood lighting, no text, no watermark';

interface ThumbnailTexts {
  texto_principal: string;
  subtitulo: string;
  contexto: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const CHAR_RATIO = 0.50;

function calcMainFontSize(len: number): number {
  if (len <= 20) return 120;
  if (len <= 30) return 95;
  return 75;
}

function wrapWords(text: string, maxWidth: number, fontSize: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * CHAR_RATIO));
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= charsPerLine) { current = test; }
    else { if (current) lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

function calcSubFontSize(text: string, maxWidth: number, maxLines: number): number {
  for (const size of [90, 70, 55, 45, 35]) {
    if (wrapWords(text, maxWidth, size).length <= maxLines) return size;
  }
  return 35;
}

function buildTextElement(
  lines: string[], x: number, baselineY: number, fontSize: number,
  fill: string, filterId: string, maxLines: number, extraAttrs = ''
): string {
  const lineHeight = Math.round(fontSize * 1.1);
  const tspans = lines.slice(0, maxLines)
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');
  return `<text x="${x}" y="${baselineY}" font-family="BebasNeue, Arial Black, sans-serif" font-size="${fontSize}" fill="${fill}" filter="url(#${filterId})" font-weight="bold"${extraAttrs}>${tspans}</text>`;
}

function filterNonLatin(text: string): string {
  return text.replace(/[^\x00-\x7FÀ-ɏ]/g, '').trim();
}

const LOFI_FILLER = new Set([
  'LOFI','LO-FI','LO','FI','HIP','HOP','MUSIC','MUSICA',
  'PARA','ESTUDIAR','RELAX','RELAXING','STUDY','STUDYING',
  'BEATS','BEAT','PIANO','SESSION','HORA','HORAS','HOUR','HOURS',
  'MIX','PLAYLIST','CHILL','VIBES','VIBE','AND','Y','&','WITH',
]);

function shortLofiText(title: string): string {
  const clean = title.replace(/[^\x00-\x7FÀ-ɏ]/g, '').replace(/[|•·\-_]/g, ' ').trim();
  const words = clean.toUpperCase().split(/\s+/).filter(Boolean);
  const strong = words.filter(w => !LOFI_FILLER.has(w) && w.length > 1);
  return strong.slice(0, 2).join(' ') || clean.split(' ').slice(0, 2).join(' ').toUpperCase();
}

async function composeThumbnail(
  baseImagePath: string,
  texts: ThumbnailTexts,
  outputPath: string,
  accentColor: string,
  canalNombre: string
): Promise<void> {
  const sharp = (await import('sharp')).default;
  const W = 1280, H = 720;
  const TX = 60;
  const TEXT_ZONE_W = 560;

  const TITLE_SIZE = 58;
  const TAG_SIZE   = 30;
  const BRAND_SIZE = 22;

  const principal = filterNonLatin(texts.texto_principal);
  const subtitulo = filterNonLatin(texts.subtitulo);
  const contexto  = filterNonLatin(texts.contexto);

  const DUR_SIZE = Math.max(60, Math.min(120, Math.floor(TEXT_ZONE_W / Math.max(1, principal.length * CHAR_RATIO))));

  const hasSub     = subtitulo.length > 0;
  const titleLines = hasSub ? wrapWords(subtitulo, TEXT_ZONE_W, TITLE_SIZE) : [];
  const titleLineH = Math.round(TITLE_SIZE * 1.15);

  const brandY = H - 18;
  const tagY   = brandY - BRAND_SIZE - 14;

  let titleY = 0;
  let durY: number;
  if (hasSub) {
    titleY = tagY - TAG_SIZE - 22;
    durY   = titleY - TITLE_SIZE - 32;
  } else {
    durY = tagY - TAG_SIZE - 60 - DUR_SIZE;
  }

  const titleBottom = hasSub ? titleY + (titleLines.length - 1) * titleLineH : tagY - TAG_SIZE - 22;
  const realTagY   = Math.max(tagY,   titleBottom + TAG_SIZE   + 18);
  const realBrandY = Math.max(brandY, realTagY   + BRAND_SIZE + 14);

  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   style="stop-color:black;stop-opacity:0"/>
          <stop offset="35%"  style="stop-color:black;stop-opacity:0"/>
          <stop offset="70%"  style="stop-color:black;stop-opacity:0.65"/>
          <stop offset="100%" style="stop-color:black;stop-opacity:0.93"/>
        </linearGradient>
        <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   style="stop-color:black;stop-opacity:0.35"/>
          <stop offset="22%"  style="stop-color:black;stop-opacity:0"/>
        </linearGradient>
        <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   style="stop-color:black;stop-opacity:0.45"/>
          <stop offset="50%"  style="stop-color:black;stop-opacity:0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeUp)"/>
      <rect x="0" y="0" width="${W}" height="${Math.round(H * 0.22)}" fill="url(#fadeDown)"/>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeLeft)"/>
    </svg>`
  );

  const textSvg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>@font-face { font-family: 'BebasNeue'; src: url('${FONT_PATH}'); }</style>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="shadowSoft" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="black" flood-opacity="0.85"/>
        </filter>
      </defs>

      <text x="${TX}" y="${durY}"
        text-anchor="start"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="${DUR_SIZE}" fill="${accentColor}"
        filter="url(#glow)" letter-spacing="8"
      >${escapeXml(principal.toUpperCase())}</text>

      ${titleLines.slice(0, 2).map((line, i) =>
        `<text x="${TX}" y="${titleY + i * titleLineH}"
          text-anchor="start"
          font-family="BebasNeue, Arial Black, sans-serif"
          font-size="${TITLE_SIZE}" fill="#FFFFFF"
          filter="url(#shadowSoft)" letter-spacing="3"
        >${escapeXml(line)}</text>`
      ).join('\n')}

      <text x="${TX}" y="${realTagY}"
        text-anchor="start"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="${TAG_SIZE}" fill="#CCCCCC"
        filter="url(#shadowSoft)" letter-spacing="6"
      >${escapeXml(contexto.toUpperCase())}</text>

      <text x="${TX}" y="${realBrandY}"
        font-family="BebasNeue, Arial Black, sans-serif"
        font-size="${BRAND_SIZE}" fill="#888888" letter-spacing="3"
      >${escapeXml(canalNombre.toUpperCase())}</text>
    </svg>`
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await sharp(baseImagePath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .composite([{ input: overlay, blend: 'over' }, { input: textSvg, blend: 'over' }])
    .jpeg({ quality: 95 })
    .toFile(outputPath);
}

async function generateFluxImage(prompt: string, outputPath: string): Promise<void> {
  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) throw new Error('HUGGINGFACE_TOKEN no configurado');

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(
        'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { width: 1280, height: 720, num_inference_steps: 4 },
          }),
          signal: AbortSignal.timeout(60000),
        }
      );
      if (response.status === 503) { await new Promise((r) => setTimeout(r, 20000)); continue; }
      if (!response.ok) throw new Error(`HuggingFace error ${response.status}: ${await response.text()}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1000) throw new Error('Imagen demasiado pequeña');
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

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const video = await StudioMusicaAmbiental.findById(id);
    if (!video) return NextResponse.json({ error: 'Vídeo no encontrado' }, { status: 404 });
    if (video.canal_id !== session.canal_id) return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    if (video.thumbnail_status === 'processing') return NextResponse.json({ status: 'processing', message: 'Ya está generando miniatura' });

    await StudioMusicaAmbiental.findByIdAndUpdate(id, { thumbnail_status: 'processing', thumbnail_error: null });

    (async () => {
      try {
        const canal = await StudioCanal.findById(video.canal_id).lean() as {
          nombre?: string;
          config?: { thumbnail_style_prompt?: string; thumbnail_accent_color?: string };
        } | null;

        const stylePrompt = canal?.config?.thumbnail_style_prompt?.trim() || DEFAULT_STYLE_PROMPT;
        const accentColor = canal?.config?.thumbnail_accent_color ?? '#7C3AED';
        const canalNombre = canal?.nombre ?? 'STUDIO';

        const durLabel = video.duracion_horas === 1 ? '1 HORA' : `${video.duracion_horas} HORAS`;
        const texts: ThumbnailTexts = {
          texto_principal: shortLofiText(video.titulo || video.mood),
          subtitulo: '',
          contexto: `LO-FI · ${durLabel}`,
        };

        const fluxPrompt = `${stylePrompt}. Mood: ${video.mood}. Cozy desk with steaming mug, open books, small plant and headphones. Scene on right side, dark empty space on left for text. No text, no letters, no watermarks, atmospheric, dreamy.`;

        const basePath  = path.join(MINIATURAS_DIR, `${id}-base.jpg`);
        const finalPath = path.join(MINIATURAS_DIR, `${id}.jpg`);

        await generateFluxImage(fluxPrompt, basePath);
        await composeThumbnail(basePath, texts, finalPath, accentColor, canalNombre);

        await StudioMusicaAmbiental.findByIdAndUpdate(id, {
          thumbnail_status: 'ready',
          thumbnail_path: `/api/studio/musica-ambiental/miniatura/${id}.jpg`,
          thumbnail_base_path: `/api/studio/musica-ambiental/miniatura/${id}-base.jpg`,
          thumbnail_texts: texts,
          $unset: { thumbnail_error: '' },
        });
      } catch (err) {
        console.error('[generar-miniatura] Error background:', err);
        await StudioMusicaAmbiental.findByIdAndUpdate(id, {
          thumbnail_status: 'error',
          thumbnail_error: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    })();

    return NextResponse.json({ success: true, status: 'processing' });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 });
  }
}
