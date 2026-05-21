/**
 * Composición Sharp de carteles de eventos 1080x1920
 * Sistema de capas v3 — diseño humano, no IA
 * Jeraquía tipográfica agresiva, asimetría controlada, grano final
 */

import path from 'path';

const BEBAS = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const MONTSERRAT = path.join(process.cwd(), 'public/studio/fonts/Montserrat-Bold.ttf');

function esc(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface ComposeParams {
  fondoBuffer: Buffer;
  djNombre: string;
  nombreEvento: string;
  fecha: string;        // "2026-05-15"
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

async function makeCircular(buf: Buffer, diameter: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const r = Math.floor(diameter / 2);
  const mask = Buffer.from(
    `<svg width="${diameter}" height="${diameter}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`
  );
  return sharp(buf)
    .resize(diameter, diameter, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function parseFecha(fecha: string): { dia: string; diaSemana: string; mes: string } {
  let d: Date;
  if (fecha.includes('-')) {
    d = new Date(fecha + 'T12:00:00');
  } else {
    const [day, month, year] = fecha.split('/');
    d = new Date(`${year}-${month}-${day}T12:00:00`);
  }
  const dia = d.getDate().toString();
  const diaSemana = d.toLocaleString('es-ES', { weekday: 'long' }).toUpperCase();
  const mes = d.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  return { dia, diaSemana, mes };
}

/** Calcula tamaño de fuente del título según longitud */
function calcTitleFontSize(nombre: string): { lines: string[]; fontSize: number } {
  const words = nombre.trim().split(/\s+/);
  if (words.length === 1) {
    return {
      lines: [nombre],
      fontSize: nombre.length <= 7 ? 280 : 200,
    };
  }
  const mid = Math.ceil(words.length / 2);
  const lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  const maxLen = Math.max(...lines.map((l) => l.length));
  return { lines, fontSize: maxLen > 12 ? 130 : 160 };
}

/** El subtítulo sobre el título: tematica si es corta (≤3 palabras), sino vacío */
function getSubtitulo(tematica: string): string | null {
  if (!tematica) return null;
  const words = tematica.trim().split(/\s+/);
  return words.length <= 3 ? tematica.toUpperCase() : null;
}

/** Genera buffer de ruido aleatorio para efecto grano */
async function generateGrain(width: number, height: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    pixels[i] = v;
    pixels[i + 1] = v;
    pixels[i + 2] = v;
    pixels[i + 3] = 22; // ~9% opacity
  }
  return sharp(pixels, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Filtra info_extra si duplica dress code de tematica */
function filterInfoExtra(infoExtra: string | null, tematica: string): string | null {
  if (!infoExtra || !tematica) return infoExtra;
  const inf = infoExtra.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const tem = tematica.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (inf.includes(tem) || tem.includes(inf)) return null;
  return infoExtra;
}

export async function composeCartel(p: ComposeParams): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const W = 1080;
  const H = 1920;

  const { dia, diaSemana, mes: _mes } = parseFecha(p.fecha);
  const { lines: eventoLines, fontSize: evFontSize } = calcTitleFontSize(p.nombreEvento.toUpperCase());
  const subtitulo = getSubtitulo(p.tematica);
  const infoExtraFiltrada = filterInfoExtra(p.infoExtra, p.tematica);

  // Posición dinámica del título y separador
  const titleY = 420;
  const titleLineH = evFontSize + 12;
  const titleEndY = titleY + eventoLines.length * titleLineH;
  const separatorY = titleEndY + 30;

  // Zona DJ: centrada entre separador y sección inferior
  const djZoneCenter = Math.round((separatorY + 1280) / 2);
  const hasDjPhoto = p.usarFotoDj && !!p.djFotoBuffer;

  // X del título: ligeramente a la izquierda del centro
  const titleX = W / 2 - 30;

  const composites: import('sharp').OverlayOptions[] = [];

  // ── Capa 2a: Overlay oscuro superior (top→centro, 80%→0%)
  composites.push({
    input: Buffer.from(
      `<svg width="${W}" height="650" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="black" stop-opacity="0.82"/>
            <stop offset="60%" stop-color="black" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="black" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="${W}" height="650" fill="url(#g)"/>
      </svg>`
    ),
    top: 0,
    left: 0,
  });

  // ── Capa 2b: Overlay oscuro inferior (centro→bottom, 0%→87%)
  composites.push({
    input: Buffer.from(
      `<svg width="${W}" height="680" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="black" stop-opacity="0"/>
            <stop offset="40%" stop-color="black" stop-opacity="0.50"/>
            <stop offset="100%" stop-color="black" stop-opacity="0.87"/>
          </linearGradient>
        </defs>
        <rect width="${W}" height="680" fill="url(#g2)"/>
      </svg>`
    ),
    top: 1240,
    left: 0,
  });

  // ── Capa 3: Logo local arriba centrado (max 320x160, y:80)
  if (p.logoLocalBuffer) {
    const logoLarge = await sharp(p.logoLocalBuffer)
      .resize(320, 160, { fit: 'inside' })
      .toBuffer();
    const meta = await sharp(logoLarge).metadata();
    const lw = meta.width ?? 240;
    composites.push({
      input: logoLarge,
      top: 80,
      left: Math.floor((W - lw) / 2),
    });
  }

  // ── Capa 6: Línea separadora (2px, blanco 40%, 60% del ancho, bajo título)
  const sepWidth = Math.floor(W * 0.6);
  const sepLeft = Math.floor((W - sepWidth) / 2);
  composites.push({
    input: Buffer.from(
      `<svg width="${sepWidth}" height="2" xmlns="http://www.w3.org/2000/svg">
        <rect width="${sepWidth}" height="2" fill="white" fill-opacity="0.40"/>
      </svg>`
    ),
    top: separatorY,
    left: sepLeft,
  });

  // ── Capa 7b: Foto DJ circular — izquierda (x:80), centrada verticalmente en zona DJ
  if (hasDjPhoto) {
    const diameter = 300;
    const photoLeft = 80;
    const photoTop = djZoneCenter - diameter / 2;
    const circularPhoto = await makeCircular(p.djFotoBuffer!, diameter);

    // Sombra difusa negra 25px
    const shadowPad = 50;
    const shadowSize = diameter + shadowPad * 2;
    composites.push({
      input: Buffer.from(
        `<svg width="${shadowSize}" height="${shadowSize}" xmlns="http://www.w3.org/2000/svg">
          <defs><filter id="blur"><feGaussianBlur stdDeviation="25"/></filter></defs>
          <circle cx="${shadowSize / 2}" cy="${shadowSize / 2}" r="${diameter / 2}"
            fill="black" opacity="0.80" filter="url(#blur)"/>
        </svg>`
      ),
      top: photoTop - shadowPad,
      left: photoLeft - shadowPad,
    });

    // Borde blanco 6px
    const ringSize = diameter + 12;
    composites.push({
      input: Buffer.from(
        `<svg width="${ringSize}" height="${ringSize}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${diameter / 2}"
            fill="none" stroke="white" stroke-width="6"/>
        </svg>`
      ),
      top: photoTop - 6,
      left: photoLeft - 6,
    });
    composites.push({ input: circularPhoto, top: photoTop, left: photoLeft });
  }

  // ── Capa 11: Franja inferior oscura (negro 70%, y:1600, h:320)
  composites.push({
    input: Buffer.from(
      `<svg width="${W}" height="320" xmlns="http://www.w3.org/2000/svg">
        <rect width="${W}" height="320" fill="black" fill-opacity="0.70"/>
      </svg>`
    ),
    top: 1600,
    left: 0,
  });

  // ── Capa 14: Logo local abajo izquierda (200x110, y:1800, x:60)
  if (p.logoLocalBuffer) {
    const logoSmall = await sharp(p.logoLocalBuffer)
      .resize(200, 110, { fit: 'inside' })
      .toBuffer();
    const meta = await sharp(logoSmall).metadata();
    const lw = meta.width ?? 140;
    const lh = meta.height ?? 70;
    composites.push({
      input: Buffer.from(
        `<svg width="${lw + 14}" height="${lh + 10}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${lw + 14}" height="${lh + 10}" rx="6" fill="black" fill-opacity="0.35"/>
        </svg>`
      ),
      top: 1800 - 5,
      left: 60 - 7,
    });
    composites.push({ input: logoSmall, top: 1800, left: 60 });
  }

  // ── Capa 16: QR esquina inferior derecha (180x180, y:1710, x:870)
  if (p.qrBuffer) {
    const qrResized = await sharp(p.qrBuffer)
      .resize(170, 170, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
    composites.push({ input: qrResized, top: 1710, left: 880 });
  }

  // ── Capas 4, 5, 7, 8, 9, 10, 12, 13, 15: todo el texto en un SVG
  const djTextX = hasDjPhoto ? 430 : W / 2;
  const djTextAnchor = hasDjPhoto ? 'start' : 'middle';
  const djFontSize = hasDjPhoto ? 120 : 110;
  const djNombreY = djZoneCenter + Math.round(djFontSize * 0.38);
  const generosY = djNombreY + 52;
  const dresscodeY = Math.max(generosY + 80, 1200);

  // Hora en la franja inferior
  const horaLabel = p.horaFin
    ? `DESDE LAS ${p.horaInicio} · HASTA LAS ${p.horaFin}`
    : `DESDE LAS ${p.horaInicio} HASTA CIERRE`;

  const subtituloColor = '#FFE566'; // amarillo cálido consistente

  const textSvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face { font-family: 'BebasNeue'; src: url('${BEBAS}'); }
      @font-face { font-family: 'Montserrat'; src: url('${MONTSERRAT}'); font-weight: bold; }
    </style>
    <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="8" flood-color="black" flood-opacity="0.90"/>
    </filter>
    <filter id="tsLight" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="5" flood-color="black" flood-opacity="0.70"/>
    </filter>
  </defs>

  <!-- Capa 5: Subtítulo sobre el título -->
  ${subtitulo ? `<text x="${titleX + 20}" y="${titleY - evFontSize - 18}"
    text-anchor="middle"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="65"
    fill="${subtituloColor}" opacity="0.92"
    filter="url(#tsLight)">${esc(subtitulo)}</text>` : ''}

  <!-- Capa 4: Nombre evento (título principal, asimétrico) -->
  ${eventoLines.map((line, i) => `<text x="${titleX}" y="${titleY + i * titleLineH}"
    text-anchor="middle"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="${evFontSize}"
    fill="white" stroke="black" stroke-width="6" paint-order="stroke fill"
    filter="url(#ts)">${esc(line)}</text>`).join('\n  ')}

  <!-- Capa 7: Nombre DJ -->
  <text x="${djTextX}" y="${djNombreY}"
    text-anchor="${djTextAnchor}"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="${djFontSize}"
    fill="white" stroke="black" stroke-width="4" paint-order="stroke fill"
    filter="url(#ts)">${esc(p.djNombre.toUpperCase())}</text>

  <!-- Capa 8: Géneros / tipo sesión -->
  ${p.generos ? `<text x="${djTextX}" y="${generosY}"
    text-anchor="${djTextAnchor}"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="40"
    fill="#DDDDDD"
    filter="url(#tsLight)">${esc(p.generos)}</text>` : ''}

  <!-- Capa 9: Dress code -->
  ${p.tematica && !subtitulo ? `<text x="${W / 2}" y="${dresscodeY}"
    text-anchor="middle"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="44"
    fill="${subtituloColor}" stroke="black" stroke-width="2" paint-order="stroke fill"
    filter="url(#tsLight)">${esc(p.tematica.toUpperCase())}</text>` : ''}

  <!-- Capa 10: Info extra -->
  ${infoExtraFiltrada ? `<text x="${W / 2}" y="${(p.tematica && !subtitulo ? dresscodeY : generosY) + 65}"
    text-anchor="middle"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="36"
    fill="white" opacity="0.85"
    filter="url(#tsLight)">${esc(infoExtraFiltrada)}</text>` : ''}

  <!-- Capa 12: Horario en franja inferior -->
  <text x="${W / 2}" y="1660"
    text-anchor="middle"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="32"
    fill="#AAAAAA"
    filter="url(#tsLight)">${esc(horaLabel)}</text>
  <text x="${W / 2}" y="1740"
    text-anchor="middle"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="75"
    fill="white" stroke="black" stroke-width="3" paint-order="stroke fill"
    filter="url(#ts)">${esc(p.horaInicio)}</text>

  <!-- Capa 13: Fecha — esquina inferior derecha -->
  <text x="730" y="1688"
    text-anchor="start"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="38"
    fill="${subtituloColor}"
    filter="url(#tsLight)">${esc(diaSemana)}</text>
  <text x="730" y="1840"
    text-anchor="start"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="160"
    fill="white" stroke="black" stroke-width="5" paint-order="stroke fill"
    filter="url(#ts)">${esc(dia)}</text>

  <!-- Capa 15: Dirección -->
  <text x="${W / 2}" y="1892"
    text-anchor="middle"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="29"
    fill="#AAAAAA"
    filter="url(#tsLight)">${esc(p.lugar)}</text>
</svg>`);

  composites.push({ input: textSvg, top: 0, left: 0 });

  // ── Capa 17: Grano/noise final (efecto diseño real)
  const grainBuffer = await generateGrain(W, H);
  composites.push({ input: grainBuffer, blend: 'soft-light', top: 0, left: 0 });

  return sharp(p.fondoBuffer)
    .resize(W, H, { fit: 'cover' })
    .composite(composites)
    .jpeg({ quality: 93 })
    .toBuffer();
}

/** Versión horizontal 1920x1080 con layout adaptado */
export async function composeCartelHorizontal(p: ComposeParams): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const W = 1920;
  const H = 1080;
  const { dia, diaSemana, mes: _mes } = parseFecha(p.fecha);
  const { lines: eventoLines, fontSize: evFontSize } = calcTitleFontSize(p.nombreEvento.toUpperCase());
  const subtitulo = getSubtitulo(p.tematica);
  const infoExtraFiltrada = filterInfoExtra(p.infoExtra, p.tematica);
  const horaLabel = p.horaFin ? `${p.horaInicio} — ${p.horaFin}` : `Desde las ${p.horaInicio}`;
  const hasDjPhoto = p.usarFotoDj && !!p.djFotoBuffer;

  const evFontSizeH = Math.round(evFontSize * 0.72);
  const titleLineHH = evFontSizeH + 10;

  const composites: import('sharp').OverlayOptions[] = [];

  // Overlay izquierdo (zona texto)
  composites.push({
    input: Buffer.from(
      `<svg width="1050" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="black" stop-opacity="0.90"/>
            <stop offset="70%" stop-color="black" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="black" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect width="1050" height="${H}" fill="url(#g)"/>
      </svg>`
    ),
    top: 0,
    left: 0,
  });

  // Foto DJ circular derecha (si usar_foto_dj)
  if (hasDjPhoto) {
    const diameter = 340;
    const circularPhoto = await makeCircular(p.djFotoBuffer!, diameter);
    const photoLeft = W - diameter - 120;
    const photoTop = Math.floor((H - diameter) / 2);

    const shadowPad = 50;
    const shadowSize = diameter + shadowPad * 2;
    composites.push({
      input: Buffer.from(
        `<svg width="${shadowSize}" height="${shadowSize}" xmlns="http://www.w3.org/2000/svg">
          <defs><filter id="blur"><feGaussianBlur stdDeviation="25"/></filter></defs>
          <circle cx="${shadowSize / 2}" cy="${shadowSize / 2}" r="${diameter / 2}"
            fill="black" opacity="0.80" filter="url(#blur)"/>
        </svg>`
      ),
      top: photoTop - shadowPad,
      left: photoLeft - shadowPad,
    });

    const ringSize = diameter + 12;
    composites.push({
      input: Buffer.from(
        `<svg width="${ringSize}" height="${ringSize}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${diameter / 2}"
            fill="none" stroke="white" stroke-width="6"/>
        </svg>`
      ),
      top: photoTop - 6,
      left: photoLeft - 6,
    });
    composites.push({ input: circularPhoto, top: photoTop, left: photoLeft });
  }

  const subtituloColor = '#FFE566';
  const titleY = 190;
  const titleEndY = titleY + eventoLines.length * titleLineHH;

  const textSvgH = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face { font-family: 'BebasNeue'; src: url('${BEBAS}'); }
      @font-face { font-family: 'Montserrat'; src: url('${MONTSERRAT}'); font-weight: bold; }
    </style>
    <filter id="ts" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="8" flood-color="black" flood-opacity="0.90"/>
    </filter>
    <filter id="tsLight" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="1" stdDeviation="5" flood-color="black" flood-opacity="0.70"/>
    </filter>
  </defs>

  ${subtitulo ? `<text x="80" y="${titleY - evFontSizeH - 14}"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="52"
    fill="${subtituloColor}" opacity="0.92"
    filter="url(#tsLight)">${esc(subtitulo)}</text>` : ''}

  ${eventoLines.map((line, i) => `<text x="80" y="${titleY + i * titleLineHH}"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="${evFontSizeH}"
    fill="white" stroke="black" stroke-width="5" paint-order="stroke fill"
    filter="url(#ts)">${esc(line)}</text>`).join('\n  ')}

  <text x="80" y="${titleEndY + 80}"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="88"
    fill="white" stroke="black" stroke-width="3" paint-order="stroke fill"
    filter="url(#ts)">${esc(p.djNombre.toUpperCase())}</text>

  ${p.generos ? `<text x="80" y="${titleEndY + 140}"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="34"
    fill="#DDDDDD" filter="url(#tsLight)">${esc(p.generos)}</text>` : ''}

  ${p.tematica && !subtitulo ? `<text x="80" y="${titleEndY + 200}"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="36"
    fill="${subtituloColor}" stroke="black" stroke-width="2" paint-order="stroke fill"
    filter="url(#tsLight)">${esc(p.tematica.toUpperCase())}</text>` : ''}

  ${infoExtraFiltrada ? `<text x="80" y="${titleEndY + (p.tematica && !subtitulo ? 250 : 200)}"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="30"
    fill="white" opacity="0.85" filter="url(#tsLight)">${esc(infoExtraFiltrada)}</text>` : ''}

  <text x="80" y="830"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="28"
    fill="#AAAAAA" filter="url(#tsLight)">${esc(horaLabel)}</text>

  <text x="80" y="910"
    font-family="BebasNeue, Arial Black, sans-serif" font-size="110"
    fill="white" stroke="black" stroke-width="4" paint-order="stroke fill"
    filter="url(#ts)">${esc(dia)}</text>
  <text x="220" y="845"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="32"
    fill="${subtituloColor}" filter="url(#tsLight)">${esc(diaSemana)}</text>

  <text x="80" y="1060"
    font-family="Montserrat, Arial, sans-serif" font-weight="bold" font-size="26"
    fill="#AAAAAA" filter="url(#tsLight)">${esc(p.lugar)}</text>
</svg>`);

  composites.push({ input: textSvgH, top: 0, left: 0 });

  // QR esquina inferior derecha
  if (p.qrBuffer) {
    const qrSize = 150;
    const qrResized = await sharp(p.qrBuffer)
      .resize(qrSize, qrSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();
    composites.push({ input: qrResized, top: H - qrSize - 20, left: W - qrSize - 20 });
  }

  if (p.logoLocalBuffer) {
    const logoLocal = await sharp(p.logoLocalBuffer).resize(180, 90, { fit: 'inside' }).toBuffer();
    const meta = await sharp(logoLocal).metadata();
    const lw = meta.width ?? 140;
    const lh = meta.height ?? 60;
    composites.push({
      input: Buffer.from(
        `<svg width="${lw + 14}" height="${lh + 10}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${lw + 14}" height="${lh + 10}" rx="5" fill="black" fill-opacity="0.35"/>
        </svg>`
      ),
      top: H - lh - 20 - 5,
      left: 80 - 7,
    });
    composites.push({ input: logoLocal, top: H - lh - 20, left: 80 });
  }

  // Grano final
  const grainBuffer = await generateGrain(W, H);
  composites.push({ input: grainBuffer, blend: 'soft-light', top: 0, left: 0 });

  return sharp(p.fondoBuffer)
    .resize(W, H, { fit: 'cover' })
    .composite(composites)
    .jpeg({ quality: 93 })
    .toBuffer();
}
