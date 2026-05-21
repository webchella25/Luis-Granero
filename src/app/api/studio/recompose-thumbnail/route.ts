import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';

const FONT_PATH = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public/studio/thumbnails');

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

function calcSubFontSize(text: string, maxWidth: number, maxLines: number): number {
  for (const size of [90, 70, 55, 45, 35]) {
    if (wrapWords(text, maxWidth, size).length <= maxLines) return size;
  }
  return 35;
}

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
  texts: { texto_principal: string; subtitulo: string; contexto: string },
  outputPath: string,
  accentColor: string = '#CC0000',
  canalNombre: string = 'STUDIO'
): Promise<void> {
  const sharp = (await import('sharp')).default;

  const W = 1280;
  const H = 720;
  const X = 70;
  const MAX_W_MAIN = 430;
  const MAX_W_SUB  = 430;
  const CTX_SIZE   = 32;

  const mainFontSize  = calcMainFontSize(texts.texto_principal.length);
  const mainLines     = wrapWords(texts.texto_principal, MAX_W_MAIN, mainFontSize);
  const mainLineH     = Math.round(mainFontSize * 1.1);

  const subText       = texts.subtitulo.toUpperCase();
  const subFontSize   = calcSubFontSize(subText, MAX_W_SUB, 2);
  const subLines      = wrapWords(subText, MAX_W_SUB, subFontSize);
  const subLineH      = Math.round(subFontSize * 1.1);

  const mainBaseY  = 80 + mainFontSize;
  const mainBottom = mainBaseY + (mainLines.length - 1) * mainLineH;
  const subBaseY   = mainBottom + subFontSize + 24;
  const subBottom  = subBaseY  + (subLines.length  - 1) * subLineH;
  const ctxY       = Math.min(subBottom + CTX_SIZE + 18, H - 55);

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
      ${buildTextElement(subLines,  X, subBaseY,  subFontSize,  '#FFFFFF',   'shadowSub',  2)}

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

  await sharp(baseImagePath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .composite([
      { input: overlayLeft, blend: 'over' },
      { input: textSvg,     blend: 'over' },
    ])
    .jpeg({ quality: 92 })
    .toFile(outputPath);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const body = (await request.json()) as {
      scriptId?: string;
      texts?: { texto_principal: string; subtitulo: string; contexto: string };
    };

    const { scriptId, texts } = body;

    if (!scriptId || !texts) {
      return NextResponse.json({ error: 'scriptId y texts son obligatorios' }, { status: 400 });
    }

    await connectDB();
    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    const canal = await StudioCanal.findById(session.canal_id).lean();
    const accentColor = (canal as { config?: { thumbnail_accent_color?: string } } | null)?.config?.thumbnail_accent_color ?? '#CC0000';
    const canalNombre = (canal as { nombre?: string } | null)?.nombre ?? 'STUDIO';

    // Siempre partir de la imagen FLUX original guardada en DB, nunca de la miniatura ya compuesta
    const rawBase = (script as { thumbnail_base_path?: string }).thumbnail_base_path;
    if (!rawBase) {
      return NextResponse.json(
        { error: 'No existe imagen base. Genera primero la miniatura completa.' },
        { status: 400 }
      );
    }
    const basePath = path.join(process.cwd(), 'public', rawBase);
    if (!fs.existsSync(basePath)) {
      return NextResponse.json(
        { error: 'No existe imagen base. Genera primero la miniatura completa.' },
        { status: 400 }
      );
    }

    const finalPath = path.join(THUMBNAILS_DIR, `${scriptId}.jpg`);
    await composeThumbnail(basePath, texts, finalPath, accentColor, canalNombre);

    await StudioScript.findByIdAndUpdate(scriptId, {
      thumbnail_status: 'ready',
      thumbnail_path: `/studio/thumbnails/${scriptId}.jpg`,
      thumbnail_texts: texts,
    });

    return NextResponse.json({
      success: true,
      thumbnailPath: `/studio/thumbnails/${scriptId}.jpg`,
      texts,
      message: 'Miniatura recompuesta correctamente',
    });
  } catch (err) {
    console.error('[recompose-thumbnail] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error interno' },
      { status: 500 }
    );
  }
}
