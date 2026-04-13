import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection } from '@/models/StudioScript';

const execAsync = promisify(exec);

const BEBAS_FONT = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const FALLBACK_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

// Secciones válidas para generar Shorts
const VALID_SECTIONS = [0, 2, 3];
const SHORT_MAX_DURATION = 58; // segundos — YouTube Shorts < 60s obligatorio

const SECTION_LABELS: Record<number, string> = {
  0: 'Hook',
  2: 'Ascenso al poder',
  3: 'El lado oscuro',
};

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg salió con código ${code}: ${stderr.slice(-5).join('')}`));
    });
    proc.on('error', reject);
  });
}

function escapeDt(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '')
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function splitIntoBlocks(text: string, wordsPerBlock = 5): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const blocks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerBlock) {
    blocks.push(words.slice(i, i + wordsPerBlock).join(' '));
  }
  return blocks;
}

function wrapLine(line: string, maxChars = 20): string {
  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.join('\n');
}

/** Genera el título automático para cada sección */
function generateShortTitle(seccionIdx: number, personaje: string, content: string): string {
  const firstSentence = (content.split(/[.!?]/)[0] ?? '').trim().slice(0, 55);
  switch (seccionIdx) {
    case 0:
      return `¿Sabías que ${firstSentence.toLowerCase()}? #${personaje.split(' ')[0]} #AlmasCorruptas`.slice(0, 100);
    case 2:
      return `Así llegó al poder ${personaje} #HistoriaOscura #AlmasCorruptas`.slice(0, 100);
    case 3:
      return `Lo más perturbador de ${personaje} #CrimenReal #AlmasCorruptas`.slice(0, 100);
    default:
      return `${personaje} — Historia #AlmasCorruptas`.slice(0, 100);
  }
}

async function getAudioDuration(audioAbsPath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioAbsPath}"`
  );
  return parseFloat(stdout.trim());
}

async function buildShortForSection(params: {
  seccionIdx: number;
  personaje: string;
  imageAbsPath: string;
  audioAbsPath: string;
  audioStart: number;
  audioDuration: number;
  sectionText: string;
  outputPath: string;
  tmpDir: string;
}): Promise<void> {
  const { seccionIdx, personaje, imageAbsPath, audioAbsPath, audioStart, audioDuration, sectionText, outputPath, tmpDir } = params;

  let fontPath = BEBAS_FONT;
  try { await fs.access(BEBAS_FONT); } catch { fontPath = FALLBACK_FONT; }

  const TOTAL_DUR = audioDuration;
  const FPS = 24;
  const totalFrames = Math.round(TOTAL_DUR * FPS);

  // Extraer fragmento de audio de la sección
  const sectionLabel = SECTION_LABELS[seccionIdx] ?? `sec_${seccionIdx}`;
  const shortAudioPath = path.join(tmpDir, `audio_sec_${seccionIdx}.mp3`);
  await runFFmpeg([
    '-i', audioAbsPath,
    '-ss', audioStart.toFixed(3),
    '-t', audioDuration.toFixed(3),
    '-acodec', 'copy',
    '-y',
    shortAudioPath,
  ]);

  // ── Música de fondo (pista de intro aleatoria) ──
  const publicDir = path.join(process.cwd(), 'public');
  const musicIntroDir = path.join(publicDir, 'studio', 'music', 'intro');
  let bgMusicPath: string | null = null;
  try {
    const musicFiles = (await fs.readdir(musicIntroDir)).filter((f) => f.endsWith('.mp3'));
    if (musicFiles.length > 0) {
      const picked = musicFiles[Math.floor(Math.random() * musicFiles.length)];
      bgMusicPath = path.join(musicIntroDir, picked);
    }
  } catch { /* sin música */ }

  // ── Bloques de texto progresivo ──
  const blocks = splitIntoBlocks(sectionText, 5);
  const blockDur = TOTAL_DUR / blocks.length;

  const blurBg = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:20';
  const fgScale = 'scale=1080:-1';
  const zoompan = `zoompan=z='min(1+0.10*on/${totalFrames}\\,1.10)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${FPS}`;

  const pjEsc = escapeDt(personaje.toUpperCase());
  const labelEsc = escapeDt(sectionLabel.toUpperCase());

  // Intro: nombre personaje + sección (fade out a t=2)
  const introPersonaje = [
    `drawtext=fontfile='${fontPath}'`,
    `text='${pjEsc}'`,
    'fontcolor=white', 'fontsize=90',
    'x=(w-text_w)/2', 'y=(h-text_h)/2-60',
    'shadowcolor=black@1.0', 'shadowx=4', 'shadowy=4',
    `alpha='if(lt(t\\,1.5)\\,1\\,max(0\\,1-(t-1.5)/0.5))'`,
  ].join(':');

  const introSeccion = [
    `drawtext=fontfile='${fontPath}'`,
    `text='${labelEsc}'`,
    'fontcolor=0xAAAAAA', 'fontsize=36',
    'x=(w-text_w)/2', 'y=(h-text_h)/2+60',
    'shadowcolor=black@0.8', 'shadowx=2', 'shadowy=2',
    `alpha='if(lt(t\\,1.5)\\,1\\,max(0\\,1-(t-1.5)/0.5))'`,
  ].join(':');

  const blockFilters = blocks.map((block, idx) => {
    const start = (idx * blockDur).toFixed(3);
    const end = ((idx + 1) * blockDur).toFixed(3);
    const wrapped = escapeDt(wrapLine(block.toUpperCase(), 20));
    return [
      `drawtext=fontfile='${fontPath}'`,
      `text='${wrapped}'`,
      'fontcolor=white', 'fontsize=72',
      'x=(w-text_w)/2', 'y=h*0.75',
      'borderw=3', 'bordercolor=black', 'line_spacing=10',
      `enable='between(t\\,${start}\\,${end})'`,
    ].join(':');
  }).join(',');

  const fadeIn = 'fade=t=in:st=0:d=0.4';
  const fadeOut = `fade=t=out:st=${(TOTAL_DUR - 0.4).toFixed(3)}:d=0.4`;
  const textFilters = [introPersonaje, introSeccion, blockFilters, fadeIn, fadeOut].join(',');

  const filterComplex = [
    `[0:v]split[bg_raw][fg_raw]`,
    `[bg_raw]${blurBg}[blurred]`,
    `[fg_raw]${fgScale}[fg]`,
    `[blurred][fg]overlay=(W-w)/2:(H-h)/2[composed]`,
    `[composed]${zoompan}[zoomed]`,
    `[zoomed]${textFilters}[vout]`,
  ].join(';');

  if (bgMusicPath) {
    await runFFmpeg([
      '-loop', '1', '-i', imageAbsPath,
      '-i', shortAudioPath,
      '-stream_loop', '-1', '-i', bgMusicPath,
      '-filter_complex',
      filterComplex + `;[1:a][2:a]amix=inputs=2:weights=1 0.15:normalize=0[aout]`,
      '-map', '[vout]', '-map', '[aout]',
      '-t', String(TOTAL_DUR), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart',
      '-y', outputPath,
    ]);
  } else {
    await runFFmpeg([
      '-loop', '1', '-i', imageAbsPath,
      '-i', shortAudioPath,
      '-filter_complex', filterComplex,
      '-map', '[vout]', '-map', '1:a',
      '-t', String(TOTAL_DUR), '-r', String(FPS),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart',
      '-y', outputPath,
    ]);
  }

  // Limpiar audio temporal de esta sección
  await fs.unlink(shortAudioPath).catch(() => null);
}

async function generateShortsBackground(
  scriptId: string,
  personaje: string,
  guionSections: ScriptSection[],
  imagesPaths: string[],
  audioAbsPath: string,
  secciones: number[]
): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const shortsDir = path.join(publicDir, 'studio', 'shorts');
  const tmpDir = path.join('/tmp', `studio-shorts-${scriptId}`);
  await fs.mkdir(shortsDir, { recursive: true });
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const totalDuration = await getAudioDuration(audioAbsPath);
    const sectionWordCounts = guionSections.map((s) => s.content.split(/\s+/).filter(Boolean).length);
    const totalWords = sectionWordCounts.reduce((a, b) => a + b, 0) || 1;

    for (const seccionIdx of secciones) {
      const section = guionSections[seccionIdx];
      if (!section) continue;

      // Calcular timestamp de inicio y duración para esta sección
      const wordsBefore = sectionWordCounts.slice(0, seccionIdx).reduce((a, b) => a + b, 0);
      const sectionWords = sectionWordCounts[seccionIdx] ?? 0;
      const startTime = (wordsBefore / totalWords) * totalDuration;
      const sectionFullDuration = (sectionWords / totalWords) * totalDuration;
      const audioDuration = Math.min(sectionFullDuration, SHORT_MAX_DURATION);

      // Imagen correspondiente a esta sección (o la más cercana disponible)
      const imgIdx = Math.min(seccionIdx, imagesPaths.length - 1);
      const imgRaw = imagesPaths[imgIdx];
      const imgApiMatch = imgRaw?.match(/\/api\/studio\/image\/([^/]+)\/([^/]+)$/);
      const imageAbsPath = imgApiMatch
        ? path.join(publicDir, 'studio', 'images', imgApiMatch[1], imgApiMatch[2])
        : path.join(publicDir, imgRaw ?? '');

      const outputFilename = `${scriptId}-seccion-${seccionIdx}.mp4`;
      const outputPath = path.join(shortsDir, outputFilename);
      const shortPath = `/api/studio/short/${outputFilename}`;

      try {
        await buildShortForSection({
          seccionIdx,
          personaje,
          imageAbsPath,
          audioAbsPath,
          audioStart: startTime,
          audioDuration,
          sectionText: section.content,
          outputPath,
          tmpDir,
        });

        // Actualizar entry en el array shorts
        await connectDB();
        const s = await StudioScript.findById(scriptId);
        if (s) {
          const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccionIdx);
          if (entry) {
            entry.path = shortPath;
            entry.status = 'ready';
          }
          await s.save();
          console.log(`✅ Short sección ${seccionIdx} listo: ${shortPath}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error generando Short sección ${seccionIdx}:`, msg);
        await connectDB();
        const s = await StudioScript.findById(scriptId);
        if (s) {
          const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccionIdx);
          if (entry) {
            entry.status = 'error';
            entry.error = msg.slice(0, 500);
          }
          await s.save();
        }
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const body = (await request.json()) as { scriptId?: string; secciones?: number[] };
    const { scriptId } = body;
    const secciones = (body.secciones ?? [0]).filter((s) => VALID_SECTIONS.includes(s));

    if (!scriptId) return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    if (secciones.length === 0) return NextResponse.json({ error: 'No hay secciones válidas (0, 2, 3)' }, { status: 400 });

    await connectDB();
    const script = await StudioScript.findById(scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    if (!script.audio_path) return NextResponse.json({ error: 'El guión no tiene narración' }, { status: 400 });
    if (!script.images_paths?.length) return NextResponse.json({ error: 'El guión no tiene imágenes' }, { status: 400 });

    // Verificar que no haya ninguna sección solicitada ya en proceso
    const existingShorts = script.shorts ?? [];
    const alreadyProcessing = secciones.some(
      (s) => existingShorts.find((sh) => sh.seccion === s)?.status === 'processing'
    );
    if (alreadyProcessing) return NextResponse.json({ status: 'processing', message: 'Alguna sección ya está en proceso' });

    const guionSections = (script.guion_json ?? []) as ScriptSection[];
    const personaje = (script.personaje as string | undefined) ?? '';

    // Inicializar / actualizar entries en el array shorts
    const updatedShorts = [...existingShorts.filter((sh) => !secciones.includes(sh.seccion))];
    for (const seccionIdx of secciones) {
      const section = guionSections[seccionIdx];
      const titulo = section ? generateShortTitle(seccionIdx, personaje, section.content) : '';
      updatedShorts.push({
        seccion: seccionIdx,
        titulo,
        path: null,
        status: 'processing',
        youtube_status: 'idle',
      });
    }
    script.shorts = updatedShorts;
    await script.save();

    const publicDir = path.join(process.cwd(), 'public');
    const audioAbsPath = path.join(publicDir, script.audio_path as string);
    const imagesPaths = script.images_paths as string[];
    const sid = scriptId;

    generateShortsBackground(sid, personaje, guionSections, imagesPaths, audioAbsPath, secciones)
      .catch(console.error);

    return NextResponse.json({ status: 'processing', secciones });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando generación de Shorts:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
