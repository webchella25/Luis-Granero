/**
 * Composición de carteles vía Puppeteer + HTML/CSS
 * Reemplaza el sistema Sharp para el canal "Almas Corruptas" / Cero Ocho
 */

import fs from 'fs';
import fsAsync from 'fs/promises';
import path from 'path';
import os from 'os';

const FONTS_DIR = path.join(process.cwd(), 'public/studio/fonts');
const BEBAS_PATH = path.join(FONTS_DIR, 'BebasNeue-Regular.ttf');
const MONTSERRAT_PATH = path.join(FONTS_DIR, 'Montserrat-Bold.ttf');

export interface ComposeParams {
  fondoBuffer: Buffer;
  djNombre: string;
  nombreEvento: string;
  fecha: string;        // "2026-05-15" o "15/05/2026"
  horaInicio: string;   // "22:00"
  horaFin: string | null;
  lugar: string;
  tematica: string;
  infoExtra: string | null;
  generos: string;
  usarFotoDj: boolean;
  djFotoBuffer: Buffer | null;
  logoLocalBuffer: Buffer | null;
  logoDjBuffer: Buffer | null;
  qrBuffer?: Buffer | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function bufToDataUri(buf: Buffer, mime = 'image/jpeg'): string {
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function fontToDataUri(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return `data:font/truetype;base64,${buf.toString('base64')}`;
}

function parseFecha(fecha: string): { dia: string; diaSemana: string; mes: string } {
  let d: Date;
  if (fecha.includes('-')) {
    d = new Date(fecha + 'T12:00:00');
  } else {
    const [day, month, year] = fecha.split('/');
    d = new Date(`${year}-${month}-${day}T12:00:00`);
  }
  return {
    dia: d.getDate().toString(),
    diaSemana: d.toLocaleString('es-ES', { weekday: 'long' }).toUpperCase(),
    mes: d.toLocaleString('es-ES', { month: 'long' }).toUpperCase(),
  };
}

function calcTitleFontSize(nombre: string): number {
  const len = nombre.length;
  if (len <= 5) return 280;
  if (len <= 8) return 240;
  if (len <= 12) return 190;
  if (len <= 16) return 150;
  return 120;
}

function esc(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function filterInfoExtra(infoExtra: string | null, tematica: string): string | null {
  if (!infoExtra || !tematica) return infoExtra;
  const inf = infoExtra.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const tem = tematica.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (inf.includes(tem) || tem.includes(inf)) return null;
  return infoExtra;
}

// ─── Generador HTML vertical (1080×1920) ────────────────────────────────────

export function generateCartelHTML(p: ComposeParams): string {
  const { dia, diaSemana, mes } = parseFecha(p.fecha);
  const nombreUpper = p.nombreEvento.toUpperCase();
  const fontSize = calcTitleFontSize(nombreUpper);
  const infoExtraFiltrada = filterInfoExtra(p.infoExtra, p.tematica);

  const fondoSrc = bufToDataUri(p.fondoBuffer);
  const bebasB64 = fontToDataUri(BEBAS_PATH);
  const montserratB64 = fontToDataUri(MONTSERRAT_PATH);

  const logoLocalSrc = p.logoLocalBuffer ? bufToDataUri(p.logoLocalBuffer, 'image/png') : null;
  const logoDjSrc = p.logoDjBuffer ? bufToDataUri(p.logoDjBuffer, 'image/png') : null;
  const djFotoSrc = (p.usarFotoDj && p.djFotoBuffer) ? bufToDataUri(p.djFotoBuffer) : null;
  const qrSrc = p.qrBuffer ? bufToDataUri(p.qrBuffer, 'image/png') : null;

  const horaLabel = p.horaFin
    ? `DESDE LAS ${p.horaInicio} HASTA LAS ${p.horaFin}`
    : `DESDE LAS ${p.horaInicio} HASTA CIERRE`;

  // Posición vertical del nombre DJ según si hay foto
  const djTop = djFotoSrc ? 920 : 900;
  const djFontSize = djFotoSrc ? 130 : 150;
  const djLeft = djFotoSrc ? 420 : '50%';
  const djTransform = djFotoSrc ? 'none' : 'translateX(-50%)';
  const djTextAlign = djFotoSrc ? 'left' : 'center';
  const djWidth = djFotoSrc ? '580px' : '980px';

  const generosTop = djTop + djFontSize + 20;
  const dresscodeTop = Math.max(generosTop + 70, 1200);
  const infoExtraTop = dresscodeTop + (p.tematica ? 70 : 0) + 60;

  // Subtítulo encima del título (si tematica es corta)
  const subtituloWords = p.tematica?.trim().split(/\s+/) ?? [];
  const subtitulo = subtituloWords.length <= 3 && p.tematica ? p.tematica.toUpperCase() : null;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @font-face {
    font-family: 'BebasNeue';
    src: url('${bebasB64}') format('truetype');
  }
  @font-face {
    font-family: 'Montserrat';
    src: url('${montserratB64}') format('truetype');
    font-weight: 700;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    position: relative;
    background: #000;
    font-family: 'BebasNeue', sans-serif;
  }

  .fondo {
    position: absolute;
    top: 0; left: 0;
    width: 1080px;
    height: 1920px;
    object-fit: cover;
  }

  .overlay-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 500px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.30) 60%, transparent 100%);
  }

  .overlay-bottom {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 680px;
    background: linear-gradient(to top, rgba(0,0,0,0.87) 0%, rgba(0,0,0,0.50) 40%, transparent 100%);
  }

  .noise {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
    pointer-events: none;
    z-index: 100;
  }
</style>
</head>
<body>

  <img class="fondo" src="${fondoSrc}" />
  <div class="overlay-top"></div>
  <div class="overlay-bottom"></div>

  <!-- Logo local arriba -->
  ${logoLocalSrc ? `
  <img src="${logoLocalSrc}" style="
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 320px;
    max-height: 160px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.8));
  " />` : ''}

  <!-- Subtítulo encima del título -->
  ${subtitulo ? `
  <div style="
    position: absolute;
    top: 262px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 58px;
    color: #FFE566;
    text-align: center;
    width: 900px;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
    opacity: 0.95;
  ">${esc(subtitulo)}</div>` : ''}

  <!-- Nombre evento -->
  <div style="
    position: absolute;
    top: 340px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'BebasNeue', sans-serif;
    font-size: ${fontSize}px;
    color: #FFFFFF;
    text-align: center;
    width: 980px;
    text-shadow: 4px 4px 0px #000, -2px -2px 0px #000;
    letter-spacing: 4px;
    line-height: 1.0;
  ">${esc(nombreUpper)}</div>

  <!-- Separador -->
  <div style="
    position: absolute;
    top: ${340 + fontSize * 1.05 + 30}px;
    left: 50%;
    transform: translateX(-50%);
    width: 648px;
    height: 2px;
    background: rgba(255,255,255,0.40);
  "></div>

  <!-- Foto DJ circular -->
  ${djFotoSrc ? `
  <div style="
    position: absolute;
    top: 880px;
    left: 80px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    overflow: hidden;
    border: 8px solid #FFFFFF;
    box-shadow: 0 0 40px rgba(0,0,0,0.8), 0 0 0 0 transparent;
  ">
    <img src="${djFotoSrc}" style="width:100%;height:100%;object-fit:cover;" />
  </div>` : ''}

  <!-- Nombre DJ -->
  <div style="
    position: absolute;
    top: ${djTop}px;
    left: ${typeof djLeft === 'number' ? djLeft + 'px' : djLeft};
    transform: ${djTransform};
    font-family: 'BebasNeue', sans-serif;
    font-size: ${djFontSize}px;
    color: #FFFFFF;
    text-shadow: 3px 3px 0px #000;
    text-align: ${djTextAlign};
    width: ${djWidth};
    line-height: 1.0;
  ">${esc(p.djNombre.toUpperCase())}</div>

  <!-- Géneros / sesión -->
  ${p.generos ? `
  <div style="
    position: absolute;
    top: ${generosTop}px;
    left: ${typeof djLeft === 'number' ? djLeft + 'px' : djLeft};
    transform: ${djTransform};
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 42px;
    color: #DDDDDD;
    text-align: ${djTextAlign};
    width: ${djWidth};
    letter-spacing: 3px;
  ">${esc(p.generos)}</div>` : ''}

  <!-- Dress code -->
  ${p.tematica && !subtitulo ? `
  <div style="
    position: absolute;
    top: ${dresscodeTop}px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 46px;
    color: #FFE566;
    text-align: center;
    width: 900px;
    text-transform: uppercase;
  ">${esc(p.tematica)}</div>` : ''}

  <!-- Info extra -->
  ${infoExtraFiltrada ? `
  <div style="
    position: absolute;
    top: ${infoExtraTop}px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 36px;
    color: rgba(255,255,255,0.85);
    text-align: center;
    width: 900px;
  ">${esc(infoExtraFiltrada)}</div>` : ''}

  <!-- Franja negra inferior -->
  <div style="
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 320px;
    background: rgba(0,0,0,0.70);
  "></div>

  <!-- Día semana -->
  <div style="
    position: absolute;
    bottom: 432px;
    right: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 40px;
    color: #FFE566;
    text-align: right;
  ">${esc(diaSemana)}</div>

  <!-- Número día -->
  <div style="
    position: absolute;
    bottom: 280px;
    right: 80px;
    font-family: 'BebasNeue', sans-serif;
    font-size: 180px;
    color: #FFFFFF;
    line-height: 1.0;
    text-shadow: 4px 4px 0px #000;
  ">${esc(dia)}</div>

  <!-- Mes -->
  <div style="
    position: absolute;
    bottom: 238px;
    right: 80px;
    font-family: 'BebasNeue', sans-serif;
    font-size: 75px;
    color: #FFE566;
    text-align: right;
  ">${esc(mes)}</div>

  <!-- Horario -->
  <div style="
    position: absolute;
    bottom: 178px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 36px;
    color: #FFFFFF;
    text-align: center;
    white-space: nowrap;
  ">${esc(horaLabel)}</div>

  <!-- Logo local abajo izquierda -->
  ${logoLocalSrc ? `
  <img src="${logoLocalSrc}" style="
    position: absolute;
    bottom: 80px;
    left: 70px;
    max-width: 200px;
    max-height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.9));
  " />` : ''}

  <!-- QR abajo derecha (o logo DJ) -->
  ${qrSrc ? `
  <img src="${qrSrc}" style="
    position: absolute;
    bottom: 70px;
    right: 70px;
    width: 190px;
    height: 190px;
  " />` : logoDjSrc ? `
  <img src="${logoDjSrc}" style="
    position: absolute;
    bottom: 80px;
    right: 70px;
    max-width: 180px;
    max-height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.9));
  " />` : ''}

  <!-- Dirección -->
  <div style="
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 28px;
    color: rgba(200,200,200,0.8);
    text-align: center;
    white-space: nowrap;
  ">${esc(p.lugar)}</div>

  <div class="noise"></div>

</body>
</html>`;
}

// ─── Generador HTML horizontal (1920×1080) ──────────────────────────────────

export function generateCartelHTMLHorizontal(p: ComposeParams): string {
  const { dia, diaSemana } = parseFecha(p.fecha);
  const nombreUpper = p.nombreEvento.toUpperCase();
  const fontSize = Math.round(calcTitleFontSize(nombreUpper) * 0.72);
  const infoExtraFiltrada = filterInfoExtra(p.infoExtra, p.tematica);

  const fondoSrc = bufToDataUri(p.fondoBuffer);
  const bebasB64 = fontToDataUri(BEBAS_PATH);
  const montserratB64 = fontToDataUri(MONTSERRAT_PATH);

  const logoLocalSrc = p.logoLocalBuffer ? bufToDataUri(p.logoLocalBuffer, 'image/png') : null;
  const logoDjSrc = p.logoDjBuffer ? bufToDataUri(p.logoDjBuffer, 'image/png') : null;
  const djFotoSrc = (p.usarFotoDj && p.djFotoBuffer) ? bufToDataUri(p.djFotoBuffer) : null;
  const qrSrc = p.qrBuffer ? bufToDataUri(p.qrBuffer, 'image/png') : null;

  const horaLabel = p.horaFin
    ? `${p.horaInicio} — ${p.horaFin}`
    : `Desde las ${p.horaInicio}`;

  const subtituloWords = p.tematica?.trim().split(/\s+/) ?? [];
  const subtitulo = subtituloWords.length <= 3 && p.tematica ? p.tematica.toUpperCase() : null;

  const titleEndY = 160 + fontSize * 1.05 * 2 + 20; // estimado para 2 líneas
  const generosY = titleEndY + 100;
  const dresscodeY = generosY + 60;
  const infoExtraY = dresscodeY + (p.tematica ? 60 : 0) + 50;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @font-face {
    font-family: 'BebasNeue';
    src: url('${bebasB64}') format('truetype');
  }
  @font-face {
    font-family: 'Montserrat';
    src: url('${montserratB64}') format('truetype');
    font-weight: 700;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    position: relative;
    background: #000;
  }

  .noise {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.06;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
    pointer-events: none;
    z-index: 100;
  }
</style>
</head>
<body>

  <!-- Fondo -->
  <img src="${fondoSrc}" style="
    position: absolute;
    top: 0; left: 0;
    width: 1920px;
    height: 1080px;
    object-fit: cover;
  " />

  <!-- Overlay izquierdo (zona texto) -->
  <div style="
    position: absolute;
    top: 0; left: 0;
    width: 1050px;
    height: 1080px;
    background: linear-gradient(to right, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.45) 70%, transparent 100%);
  "></div>

  <!-- Foto DJ circular derecha -->
  ${djFotoSrc ? `
  <div style="
    position: absolute;
    top: 50%;
    right: 120px;
    transform: translateY(-50%);
    width: 340px;
    height: 340px;
    border-radius: 50%;
    overflow: hidden;
    border: 8px solid #FFFFFF;
    box-shadow: 0 0 60px rgba(0,0,0,0.8);
  ">
    <img src="${djFotoSrc}" style="width:100%;height:100%;object-fit:cover;" />
  </div>` : ''}

  <!-- Subtítulo -->
  ${subtitulo ? `
  <div style="
    position: absolute;
    top: ${160 - fontSize - 14}px;
    left: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 52px;
    color: #FFE566;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.9);
    opacity: 0.92;
  ">${esc(subtitulo)}</div>` : ''}

  <!-- Nombre evento -->
  <div style="
    position: absolute;
    top: 160px;
    left: 80px;
    font-family: 'BebasNeue', sans-serif;
    font-size: ${fontSize}px;
    color: #FFFFFF;
    text-shadow: 4px 4px 0px #000, -2px -2px 0px #000;
    letter-spacing: 4px;
    line-height: 1.0;
    width: 900px;
  ">${esc(nombreUpper)}</div>

  <!-- Nombre DJ -->
  <div style="
    position: absolute;
    top: ${titleEndY + 10}px;
    left: 80px;
    font-family: 'BebasNeue', sans-serif;
    font-size: 88px;
    color: #FFFFFF;
    text-shadow: 3px 3px 0px #000;
    line-height: 1.0;
  ">${esc(p.djNombre.toUpperCase())}</div>

  <!-- Géneros -->
  ${p.generos ? `
  <div style="
    position: absolute;
    top: ${generosY}px;
    left: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 34px;
    color: #DDDDDD;
    letter-spacing: 2px;
  ">${esc(p.generos)}</div>` : ''}

  <!-- Dress code -->
  ${p.tematica && !subtitulo ? `
  <div style="
    position: absolute;
    top: ${dresscodeY}px;
    left: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 36px;
    color: #FFE566;
    text-transform: uppercase;
  ">${esc(p.tematica)}</div>` : ''}

  <!-- Info extra -->
  ${infoExtraFiltrada ? `
  <div style="
    position: absolute;
    top: ${infoExtraY}px;
    left: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 30px;
    color: rgba(255,255,255,0.85);
  ">${esc(infoExtraFiltrada)}</div>` : ''}

  <!-- Fecha + hora (esquina inferior izquierda) -->
  <div style="
    position: absolute;
    bottom: 130px;
    left: 80px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 32px;
    color: #FFE566;
  ">${esc(diaSemana)}</div>

  <div style="
    position: absolute;
    bottom: 20px;
    left: 80px;
    font-family: 'BebasNeue', sans-serif;
    font-size: 110px;
    color: #FFFFFF;
    line-height: 1.0;
    text-shadow: 4px 4px 0px #000;
  ">${esc(dia)}</div>

  <div style="
    position: absolute;
    bottom: 130px;
    left: 220px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 28px;
    color: #AAAAAA;
  ">${esc(horaLabel)}</div>

  <!-- Dirección -->
  <div style="
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: 26px;
    color: rgba(200,200,200,0.8);
    text-align: center;
    white-space: nowrap;
  ">${esc(p.lugar)}</div>

  <!-- Logo local abajo izquierda -->
  ${logoLocalSrc ? `
  <img src="${logoLocalSrc}" style="
    position: absolute;
    bottom: 20px;
    left: 80px;
    max-width: 180px;
    max-height: 90px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.9));
  " />` : ''}

  <!-- QR / logo DJ abajo derecha -->
  ${qrSrc ? `
  <img src="${qrSrc}" style="
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 150px;
    height: 150px;
  " />` : logoDjSrc ? `
  <img src="${logoDjSrc}" style="
    position: absolute;
    bottom: 20px;
    right: 20px;
    max-width: 160px;
    max-height: 90px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.9));
  " />` : ''}

  <div class="noise"></div>

</body>
</html>`;
}

// ─── Render con Puppeteer ────────────────────────────────────────────────────

async function renderHtmlToJpeg(
  html: string,
  width: number,
  height: number,
  deviceScaleFactor: number,
  outputPath: string
): Promise<void> {
  const puppeteer = (await import('puppeteer')).default;

  const tmpHtml = path.join(os.tmpdir(), `cartel-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  await fsAsync.writeFile(tmpHtml, html, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor });
    await page.goto(`file://${tmpHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });
    // Breve espera para que el layout termine de calcular
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: outputPath as `${string}.jpg`,
      type: 'jpeg',
      quality: 95,
      clip: { x: 0, y: 0, width, height },
    });
  } finally {
    await browser.close();
    await fsAsync.unlink(tmpHtml).catch(() => {});
  }
}

/** Renderiza el cartel vertical 1080×1920 y lo guarda en outputPath */
export async function renderCartel(p: ComposeParams, outputPath: string): Promise<void> {
  const html = generateCartelHTML(p);
  await renderHtmlToJpeg(html, 1080, 1920, 1.5, outputPath);
}

/** Renderiza el cartel horizontal 1920×1080 y lo guarda en outputPath */
export async function renderCartelHorizontal(p: ComposeParams, outputPath: string): Promise<void> {
  const html = generateCartelHTMLHorizontal(p);
  await renderHtmlToJpeg(html, 1920, 1080, 1.5, outputPath);
}

// ─── V2: Tipos y constantes ──────────────────────────────────────────────────

export interface TextoCampoV2 {
  texto: string;
  visible: boolean;
  color: string;
}
export interface TextoCampoConSizeV2 extends TextoCampoV2 {
  size: number;
}
export interface TextosV2 {
  nombre_evento: TextoCampoConSizeV2;
  subtitulo: TextoCampoV2;
  nombre_dj: TextoCampoConSizeV2;
  sesion: TextoCampoV2;
  dress_code: TextoCampoV2;
  info_extra: TextoCampoV2;
  dia_semana: { texto: string; visible: boolean };
  dia_numero: string;
  mes: TextoCampoV2;
  horario: { texto: string; visible: boolean };
  direccion: { texto: string; visible: boolean };
}

export interface ComposeParamsV2 {
  // Assets (buffers)
  fondoBuffer: Buffer;
  djFotoBuffer: Buffer | null;
  logoLocalBuffer: Buffer | null;
  logoDjBuffer: Buffer | null;
  qrBuffer: Buffer | null;

  // Estilo
  preset: string;
  fuente: string;          // 'Bebas Neue' | 'Anton' | 'Playfair Display' | 'Oswald' | 'Pacifico'
  colorAcento: string;     // '#FFD700'
  efectoTexto: string;     // 'Normal' | 'Sombra larga' | 'Stroke grueso' | 'Neón' | 'Desgastado'
  overlayIntensidad: number; // 0-100
  granoIntensidad: number;   // 0-30

  // Layout
  layout: string;          // 'CLASICO' | 'PORTADA' | 'MINIMALISTA' | 'DJ_PROTAGONISTA'
  fotoDjSize: number;      // diámetro en px (200-450)
  fotoDjPositionY: number; // offset Y respecto al default del layout
  tituloPositionY: number; // offset Y respecto al default
  fechaPositionY: number;  // offset Y respecto al default (negativo = subir)

  // Textos
  textos: TextosV2;

  // Flags
  usarFotoDj: boolean;
  usarLogoLocal: boolean;
  usarLogoDj: boolean;
}

const FONT_MAP: Record<string, string> = {
  'Bebas Neue':       'BebasNeue-Regular.ttf',
  'Anton':            'Anton-Regular.ttf',
  'Playfair Display': 'Playfair_Display-Bold.ttf',
  'Oswald':           'Oswald-Bold.ttf',
  'Pacifico':         'Pacifico-Regular.ttf',
};

// Posiciones base por layout (en px para canvas 1080×1920)
const LAYOUT_DEFAULTS = {
  CLASICO: {
    tituloTop: 340,
    fotoDjTop: 860,
    fotoDjLeft: 80,
    nombreDjTop: 960,
    nombreDjLeft: 420,
    nombreDjAlign: 'left' as const,
    nombreDjWidth: '560px',
    nombreDjCenter: false,
    fechaDiaSemanaBtm: 432,
    fechaNumBtm: 272,
    fechaMesBtm: 230,
    horarioBtm: 170,
  },
  PORTADA: {
    tituloTop: 150,
    fotoDjTop: 0,
    fotoDjLeft: 0,
    nombreDjTop: 960,
    nombreDjLeft: 0,
    nombreDjAlign: 'center' as const,
    nombreDjWidth: '980px',
    nombreDjCenter: true,
    fechaDiaSemanaBtm: 360,
    fechaNumBtm: 200,
    fechaMesBtm: 158,
    horarioBtm: 100,
  },
  MINIMALISTA: {
    tituloTop: 280,
    fotoDjTop: 0,
    fotoDjLeft: 0,
    nombreDjTop: 920,
    nombreDjLeft: 0,
    nombreDjAlign: 'center' as const,
    nombreDjWidth: '980px',
    nombreDjCenter: true,
    fechaDiaSemanaBtm: 540,
    fechaNumBtm: 380,
    fechaMesBtm: 338,
    horarioBtm: 278,
  },
  DJ_PROTAGONISTA: {
    tituloTop: 180,
    fotoDjTop: 480,
    fotoDjLeft: -1, // -1 = centrado
    nombreDjTop: 430,
    nombreDjLeft: 0,
    nombreDjAlign: 'center' as const,
    nombreDjWidth: '980px',
    nombreDjCenter: true,
    fechaDiaSemanaBtm: 370,
    fechaNumBtm: 210,
    fechaMesBtm: 168,
    horarioBtm: 108,
  },
} as const;

function buildEfectoTexto(efecto: string, colorAcento: string): string {
  switch (efecto) {
    case 'Sombra larga':
      return 'text-shadow: 4px 4px 0 #000, 8px 8px 0 rgba(0,0,0,0.5);';
    case 'Stroke grueso':
      return '-webkit-text-stroke: 3px #000; paint-order: stroke fill;';
    case 'Neón':
      return `text-shadow: 0 0 10px ${colorAcento}, 0 0 20px ${colorAcento}, 0 0 40px ${colorAcento};`;
    case 'Desgastado':
      return 'opacity: 0.85; letter-spacing: 6px;';
    default:
      return 'text-shadow: 4px 4px 0px #000, -2px -2px 0px rgba(0,0,0,0.5);';
  }
}

// ─── V2: Generador HTML vertical 1080×1920 ───────────────────────────────────

export function generateCartelHTMLv2(p: ComposeParamsV2): string {
  const t = p.textos;
  const layout = LAYOUT_DEFAULTS[p.layout as keyof typeof LAYOUT_DEFAULTS] ?? LAYOUT_DEFAULTS.CLASICO;

  // Fuente
  const fontFile = FONT_MAP[p.fuente] ?? FONT_MAP['Bebas Neue'];
  const fontPath = path.join(FONTS_DIR, fontFile);
  const fontB64 = fontToDataUri(fontPath);
  const montserratB64 = fontToDataUri(MONTSERRAT_PATH);
  const fontFamily = `'TituloV2', sans-serif`;

  // Assets
  const fondoSrc = bufToDataUri(p.fondoBuffer);
  const logoLocalSrc = (p.usarLogoLocal && p.logoLocalBuffer) ? bufToDataUri(p.logoLocalBuffer, 'image/png') : null;
  const logoDjSrc = (p.usarLogoDj && p.logoDjBuffer) ? bufToDataUri(p.logoDjBuffer, 'image/png') : null;
  const djFotoSrc = (p.usarFotoDj && p.djFotoBuffer) ? bufToDataUri(p.djFotoBuffer) : null;
  const qrSrc = p.qrBuffer ? bufToDataUri(p.qrBuffer, 'image/png') : null;

  // Overlays
  const opa = Math.max(0, Math.min(1, p.overlayIntensidad / 100));
  const opaTop = (opa * 0.85).toFixed(2);
  const opaBot = opa.toFixed(2);

  // Efecto texto título
  const efectoCSS = buildEfectoTexto(p.efectoTexto, p.colorAcento);

  // Posiciones con offset del usuario
  const tituloTop = layout.tituloTop + p.tituloPositionY;
  const fotoDjSize = p.fotoDjSize;
  const fotoDjTop = layout.fotoDjTop + p.fotoDjPositionY;
  const fotoDjLeft = layout.fotoDjLeft === -1
    ? Math.round((1080 - fotoDjSize) / 2)
    : layout.fotoDjLeft;

  const nombreDjTop = layout.nombreDjTop + p.fotoDjPositionY;
  const fechaOffset = p.fechaPositionY; // negativo = subir, positivo = bajar

  // Nombre DJ posición
  const djLeftCSS = layout.nombreDjCenter
    ? '50%'
    : `${layout.nombreDjLeft}px`;
  const djTransformCSS = layout.nombreDjCenter ? 'translateX(-50%)' : 'none';

  // Grano
  const granoOpacity = (Math.max(0, Math.min(30, p.granoIntensidad)) / 100).toFixed(3);

  // Fecha (solo si visible)
  const diaSemanaBtm = layout.fechaDiaSemanaBtm - fechaOffset;
  const diaNumBtm = layout.fechaNumBtm - fechaOffset;
  const mesBtm = layout.fechaMesBtm - fechaOffset;
  const horarioBtm = layout.horarioBtm - fechaOffset;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @font-face {
    font-family: 'TituloV2';
    src: url('${fontB64}') format('truetype');
  }
  @font-face {
    font-family: 'Montserrat';
    src: url('${montserratB64}') format('truetype');
    font-weight: 700;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    position: relative;
    background: #000;
  }
</style>
</head>
<body>

  <!-- Fondo -->
  <img src="${fondoSrc}" style="position:absolute;top:0;left:0;width:1080px;height:1920px;object-fit:cover;" />

  <!-- Overlay superior -->
  <div style="position:absolute;top:0;left:0;right:0;height:600px;
    background:linear-gradient(to bottom,rgba(0,0,0,${opaTop}) 0%,rgba(0,0,0,${(opa*0.4).toFixed(2)}) 60%,transparent 100%);"></div>

  <!-- Overlay inferior -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:700px;
    background:linear-gradient(to top,rgba(0,0,0,${opaBot}) 0%,rgba(0,0,0,${(opa*0.5).toFixed(2)}) 50%,transparent 100%);"></div>

  <!-- Logo local arriba -->
  ${logoLocalSrc ? `
  <img src="${logoLocalSrc}" style="position:absolute;top:70px;left:50%;transform:translateX(-50%);
    max-width:320px;max-height:160px;object-fit:contain;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.8));" />` : ''}

  <!-- Subtítulo -->
  ${t.subtitulo.visible && t.subtitulo.texto ? `
  <div style="position:absolute;top:${tituloTop - 70}px;left:50%;transform:translateX(-50%);
    font-family:'Montserrat',sans-serif;font-weight:700;font-size:52px;
    color:${esc(t.subtitulo.color)};text-align:center;width:900px;
    text-shadow:2px 2px 8px rgba(0,0,0,0.9);">
    ${esc(t.subtitulo.texto.toUpperCase())}
  </div>` : ''}

  <!-- Nombre evento -->
  ${t.nombre_evento.visible && t.nombre_evento.texto ? `
  <div style="position:absolute;top:${tituloTop}px;left:50%;transform:translateX(-50%);
    font-family:${fontFamily};font-size:${t.nombre_evento.size}px;
    color:${esc(t.nombre_evento.color)};text-align:center;width:980px;
    letter-spacing:4px;line-height:1.0;${efectoCSS}">
    ${esc(t.nombre_evento.texto.toUpperCase())}
  </div>` : ''}

  <!-- Separador -->
  <div style="position:absolute;top:${tituloTop + t.nombre_evento.size * 1.05 + 30}px;left:50%;
    transform:translateX(-50%);width:648px;height:2px;background:rgba(255,255,255,0.35);"></div>

  <!-- Foto DJ circular -->
  ${djFotoSrc && layout.fotoDjTop > 0 ? `
  <div style="position:absolute;top:${fotoDjTop}px;left:${fotoDjLeft}px;
    width:${fotoDjSize}px;height:${fotoDjSize}px;border-radius:50%;overflow:hidden;
    border:8px solid #fff;box-shadow:0 0 40px rgba(0,0,0,0.8);">
    <img src="${djFotoSrc}" style="width:100%;height:100%;object-fit:cover;" />
  </div>` : ''}

  <!-- Nombre DJ -->
  ${t.nombre_dj.visible && t.nombre_dj.texto ? `
  <div style="position:absolute;top:${nombreDjTop}px;left:${djLeftCSS};
    transform:${djTransformCSS};font-family:${fontFamily};font-size:${t.nombre_dj.size}px;
    color:${esc(t.nombre_dj.color)};text-shadow:3px 3px 0px #000;
    text-align:${layout.nombreDjAlign};width:${layout.nombreDjWidth};line-height:1.0;">
    ${esc(t.nombre_dj.texto.toUpperCase())}
  </div>` : ''}

  <!-- Sesión / géneros -->
  ${t.sesion.visible && t.sesion.texto ? `
  <div style="position:absolute;top:${nombreDjTop + t.nombre_dj.size + 16}px;
    left:${djLeftCSS};transform:${djTransformCSS};
    font-family:'Montserrat',sans-serif;font-weight:700;font-size:38px;
    color:${esc(t.sesion.color)};text-align:${layout.nombreDjAlign};width:${layout.nombreDjWidth};letter-spacing:3px;">
    ${esc(t.sesion.texto)}
  </div>` : ''}

  <!-- Dress code -->
  ${t.dress_code.visible && t.dress_code.texto ? `
  <div style="position:absolute;top:${nombreDjTop + t.nombre_dj.size + 70}px;
    left:50%;transform:translateX(-50%);
    font-family:'Montserrat',sans-serif;font-weight:700;font-size:42px;
    color:${esc(t.dress_code.color)};text-align:center;width:900px;text-transform:uppercase;">
    ${esc(t.dress_code.texto)}
  </div>` : ''}

  <!-- Info extra -->
  ${t.info_extra.visible && t.info_extra.texto ? `
  <div style="position:absolute;top:${nombreDjTop + t.nombre_dj.size + 130}px;
    left:50%;transform:translateX(-50%);
    font-family:'Montserrat',sans-serif;font-weight:400;font-size:34px;
    color:${esc(t.info_extra.color)};text-align:center;width:900px;">
    ${esc(t.info_extra.texto)}
  </div>` : ''}

  <!-- Franja negra inferior -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:310px;background:rgba(0,0,0,0.70);"></div>

  <!-- Día semana -->
  ${t.dia_semana.visible && t.dia_semana.texto ? `
  <div style="position:absolute;bottom:${diaSemanaBtm}px;right:80px;
    font-family:'Montserrat',sans-serif;font-weight:700;font-size:38px;
    color:${esc(p.colorAcento)};text-align:right;">
    ${esc(t.dia_semana.texto.toUpperCase())}
  </div>` : ''}

  <!-- Número día -->
  ${t.dia_numero ? `
  <div style="position:absolute;bottom:${diaNumBtm}px;right:80px;
    font-family:${fontFamily};font-size:180px;color:#FFFFFF;line-height:1.0;
    text-shadow:4px 4px 0px #000;">
    ${esc(t.dia_numero)}
  </div>` : ''}

  <!-- Mes -->
  ${t.mes.visible && t.mes.texto ? `
  <div style="position:absolute;bottom:${mesBtm}px;right:80px;
    font-family:${fontFamily};font-size:72px;color:${esc(t.mes.color)};text-align:right;">
    ${esc(t.mes.texto.toUpperCase())}
  </div>` : ''}

  <!-- Horario -->
  ${t.horario.visible && t.horario.texto ? `
  <div style="position:absolute;bottom:${horarioBtm}px;left:50%;transform:translateX(-50%);
    font-family:'Montserrat',sans-serif;font-weight:700;font-size:34px;
    color:#FFFFFF;text-align:center;white-space:nowrap;">
    ${esc(t.horario.texto)}
  </div>` : ''}

  <!-- Logo local abajo izquierda -->
  ${logoLocalSrc ? `
  <img src="${logoLocalSrc}" style="position:absolute;bottom:80px;left:70px;
    max-width:200px;max-height:110px;object-fit:contain;
    filter:drop-shadow(0 2px 8px rgba(0,0,0,0.9));" />` : ''}

  <!-- QR o logo DJ abajo derecha -->
  ${qrSrc ? `
  <img src="${qrSrc}" style="position:absolute;bottom:70px;right:70px;width:190px;height:190px;" />
  ` : logoDjSrc ? `
  <img src="${logoDjSrc}" style="position:absolute;bottom:80px;right:70px;
    max-width:180px;max-height:110px;object-fit:contain;
    filter:drop-shadow(0 2px 8px rgba(0,0,0,0.9));" />` : ''}

  <!-- Dirección -->
  ${t.direccion.visible && t.direccion.texto ? `
  <div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);
    font-family:'Montserrat',sans-serif;font-weight:400;font-size:26px;
    color:rgba(200,200,200,0.8);text-align:center;white-space:nowrap;">
    ${esc(t.direccion.texto)}
  </div>` : ''}

  <!-- Grano / noise overlay -->
  <svg style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:${granoOpacity};pointer-events:none;">
    <filter id="nv2">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#nv2)"/>
  </svg>

</body>
</html>`;
}

/** Renderiza el cartel V2 vertical 1080×1920 */
export async function renderCartelV2(p: ComposeParamsV2, outputPath: string): Promise<void> {
  const html = generateCartelHTMLv2(p);
  await renderHtmlToJpeg(html, 1080, 1920, 1.5, outputPath);
}
