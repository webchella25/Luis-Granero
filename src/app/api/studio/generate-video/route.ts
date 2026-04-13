import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection } from '@/models/StudioScript';
import StudioMusicTrack, { MusicCategory } from '@/models/StudioMusicTrack';
import StudioConfig from '@/models/StudioConfig';

const execAsync = promisify(exec);

// Mapeo sección → categoría de música
const SECTION_MUSIC_MAP: MusicCategory[] = [
  'intro',       // 0 - Hook
  'background',  // 1 - Contexto histórico
  'background',  // 2 - Ascenso al poder
  'intense',     // 3 - El lado oscuro
  'intense',     // 4 - Caída
  'ending',      // 5 - Reflexión final
];

// MEJORA 4: Ken Burns zoom end factor por sección (0=Hook, 3=El lado oscuro)
const SECTION_ZOOM_END: Record<number, number> = { 0: 1.08, 3: 1.12 };
const DEFAULT_ZOOM_END = 1.05;

// MEJORA 3: Títulos de sección (null = no mostrar)
const SECTION_TITLE_LABELS: (string | null)[] = [
  null,                // 0 Hook — sin título
  null,                // 1 Contexto — se construye desde `epoca`
  '— EL ASCENSO —',   // 2
  '— LA OSCURIDAD —', // 3
  '— LA CAÍDA —',     // 4
  '— EL LEGADO —',    // 5
];

const INTRO_DURATION = 3; // segundos de la intro animada

// ── Utilidades ───────────────────────────────────────────────────────────────

async function getAudioDuration(audioAbsPath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioAbsPath}"`
  );
  return parseFloat(stdout.trim());
}

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

interface TrackLean {
  _id: unknown;
  archivo_path: string;
}

async function selectTrack(
  categoria: MusicCategory,
  lastUsed: Record<string, string[]>
): Promise<{ track: TrackLean | null }> {
  const tracks = await StudioMusicTrack.find({ categoria }).lean();
  if (tracks.length === 0) return { track: null };
  const lastUsedForCat = lastUsed[categoria] ?? [];
  const lastUsedFilename = lastUsedForCat[0];
  const candidates = tracks.filter(
    (t) => path.basename(t.archivo_path) !== lastUsedFilename
  );
  const pool = candidates.length > 0 ? candidates : tracks;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return { track: selected as TrackLean };
}

async function prepareSectionMusic(
  trackAbsPath: string,
  duracion: number,
  outputPath: string
): Promise<void> {
  await runFFmpeg([
    '-stream_loop', '-1',
    '-i', trackAbsPath,
    '-t', duracion.toFixed(3),
    '-af', 'afade=t=in:d=2,afade=t=out:d=2',
    '-y',
    outputPath,
  ]);
}

async function concatenateMusicSections(
  sectionPaths: string[],
  outputPath: string
): Promise<void> {
  const inputs: string[] = [];
  for (const p of sectionPaths) inputs.push('-i', p);
  const filterInputs = sectionPaths.map((_, i) => `[${i}]`).join('');
  const filterComplex = `${filterInputs}concat=n=${sectionPaths.length}:v=0:a=1[out]`;
  await runFFmpeg([...inputs, '-filter_complex', filterComplex, '-map', '[out]', '-y', outputPath]);
}

/** Escapa texto para usar en drawtext dentro de filter_script */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, '')
    .replace(/'/g, '\u2019')   // comilla tipográfica
    .replace(/:/g, '\\:')
    .replace(/[[\]]/g, '');
}

/** Limpia el contenido de una sección para mostrar como subtítulo */
function cleanSectionText(content: string): string {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^\(.*\)$/.test(l) && !/^\[.*\]$/.test(l))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Divide texto en bloques de N palabras máximo */
function chunkByWords(text: string, n: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const result: string[] = [];
  for (let i = 0; i < words.length; i += n) result.push(words.slice(i, i + n).join(' '));
  return result;
}

// ── Pipeline principal ───────────────────────────────────────────────────────

async function buildVideoBackground(
  scriptId: string,
  personaje: string,
  epoca: string,
  guionSections: ScriptSection[],
  imagePaths: string[],
  audioAbsPath: string,
  outputPath: string
): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const tmpDir = path.join('/tmp', `studio-${scriptId}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const fontPath = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
  const titleText = escapeDrawtext(personaje.toUpperCase());
  const fps = 24;

  try {
    // ── 1. Duraciones ──────────────────────────────────────────────────────────
    const totalDuration = await getAudioDuration(audioAbsPath);
    const durPerImage = totalDuration / imagePaths.length;

    // Duración por sección proporcional a palabras (para música y títulos)
    const sectionWordCounts = guionSections.map(
      (s) => s.content.split(/\s+/).filter(Boolean).length
    );
    const totalWords = sectionWordCounts.reduce((a, b) => a + b, 0) || 1;
    const sectionDurations = sectionWordCounts.map((w) => (w / totalWords) * totalDuration);

    // Timestamps de inicio de cada sección en el vídeo principal
    const sectionStartTimes: number[] = [];
    let accum = 0;
    for (const dur of sectionDurations) {
      sectionStartTimes.push(accum);
      accum += dur;
    }

    // ── 2. Música por sección ──────────────────────────────────────────────────
    const configDoc = await StudioConfig.findOne({ key: 'last_used_tracks' }).lean();
    const lastUsedTracks: Record<string, string[]> =
      (configDoc?.data as Record<string, string[]>) ?? {};
    const selectedTracks: (string | null)[] = [];
    const newLastUsed: Record<string, string[]> = { ...lastUsedTracks };

    for (let i = 0; i < Math.min(guionSections.length, SECTION_MUSIC_MAP.length); i++) {
      const categoria = SECTION_MUSIC_MAP[i];
      const { track } = await selectTrack(categoria, lastUsedTracks);
      if (track) {
        const absPath = path.join(publicDir, track.archivo_path);
        selectedTracks.push(absPath);
        newLastUsed[categoria] = [path.basename(track.archivo_path)];
        await StudioMusicTrack.findByIdAndUpdate(track._id as string, {
          $inc: { uses: 1 },
          ultimo_uso: new Date(),
        });
      } else {
        selectedTracks.push(null);
      }
    }

    await StudioConfig.findOneAndUpdate(
      { key: 'last_used_tracks' },
      { key: 'last_used_tracks', data: newLastUsed, updated_at: new Date() },
      { upsert: true, new: true }
    );

    // ── 3. Construir música completa + mezclar con narración ──────────────────
    // Un único audio_final.mp3 cubre TODA la duración (narración + música).
    // La intro y el vídeo principal comparten este mismo audio desde t=0.
    let audioFinalPath = audioAbsPath;
    const hasSomeMusic = selectedTracks.some((t) => t !== null);

    if (hasSomeMusic) {
      // Construir music_full.mp3 en un solo comando FFmpeg con atrim+concat
      const trackInputArgs: string[] = [];
      const filterTrimParts: string[] = [];
      const concatInputLabels: string[] = [];

      for (let i = 0; i < selectedTracks.length; i++) {
        const trackPath = selectedTracks[i];
        const secDur = (sectionDurations[i] ?? durPerImage).toFixed(3);
        if (trackPath) {
          trackInputArgs.push('-stream_loop', '-1', '-i', trackPath);
        } else {
          trackInputArgs.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
        }
        filterTrimParts.push(
          `[${i}:a]atrim=0:${secDur},asetpts=PTS-STARTPTS,aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[m${i}]`
        );
        concatInputLabels.push(`[m${i}]`);
      }

      const concatFilter = `${concatInputLabels.join('')}concat=n=${selectedTracks.length}:v=0:a=1[music_full]`;
      const musicFullPath = path.join(tmpDir, 'music_full.mp3');

      await runFFmpeg([
        ...trackInputArgs,
        '-filter_complex', [...filterTrimParts, concatFilter].join(';'),
        '-map', '[music_full]',
        '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', '-ac', '2',
        '-y', musicFullPath,
      ]);

      const durNarracion = await getAudioDuration(audioAbsPath);
      const durMusica = await getAudioDuration(musicFullPath);
      console.log('[Video] Duración narración:', durNarracion.toFixed(2), 's');
      console.log('[Video] Duración música completa:', durMusica.toFixed(2), 's');

      const audioMixedPath = path.join(tmpDir, 'audio_final.mp3');
      await runFFmpeg([
        '-i', audioAbsPath,
        '-i', musicFullPath,
        '-filter_complex', '[1:a]volume=0.15[m];[0:a][m]amix=inputs=2:duration=first:normalize=0',
        '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', '-ac', '2',
        '-y', audioMixedPath,
      ]);

      const durAudioFinal = await getAudioDuration(audioMixedPath);
      console.log('[Video] Duración audio final:', durAudioFinal.toFixed(2), 's');
      audioFinalPath = audioMixedPath;
    }

    // ── MEJORA 2: Intro animada (3s) — solo vídeo, sin audio propio ──────────
    // El audio de la intro son los primeros segundos de audio_final (música+narración).
    const introSilentPath = path.join(tmpDir, 'intro_silent.mp4');
    const introFilterScript = path.join(tmpDir, 'intro_filter.txt');
    const introFilter = [
      `drawtext=fontfile='${fontPath}':text='ALMAS CORRUPTAS':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:shadowcolor=black@1.0:shadowx=4:shadowy=4:alpha='if(lt(t\\,0.5)\\,0\\,if(lt(t\\,1.0)\\,t-0.5\\,if(lt(t\\,2.5)\\,1\\,3-t)))'`,
      `drawtext=fontfile='${fontPath}':text='Historia real. Sin filtros.':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t\\,1.5)\\,0\\,if(lt(t\\,2.0)\\,t-1.5\\,if(lt(t\\,2.5)\\,1\\,3-t)))'`,
    ].join(',\n');

    await fs.writeFile(introFilterScript, introFilter);
    await runFFmpeg([
      '-f', 'lavfi',
      '-i', `color=c=black:size=1920x1080:duration=${INTRO_DURATION}`,
      '-filter_script:v', introFilterScript,
      '-r', String(fps),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-an', '-y', introSilentPath,
    ]);

    // ── MEJORA 1+4: Chunks de imagen con subtítulos Hook y Ken Burns variable ──
    const chunkPaths: string[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imgApiMatch = imagePaths[i].match(/\/api\/studio\/image\/([^/]+)\/([^/]+)$/);
      const imgAbsPath = imgApiMatch
        ? path.join(publicDir, 'studio', 'images', imgApiMatch[1], imgApiMatch[2])
        : path.join(publicDir, imagePaths[i]);
      const chunkPath = path.join(tmpDir, `chunk_${i}.mp4`);
      chunkPaths.push(chunkPath);

      const sectionIdx = Math.floor(i * guionSections.length / imagePaths.length);
      const dur = durPerImage.toFixed(3);
      const durFrames = Math.round(durPerImage * fps);
      const zoomEnd = SECTION_ZOOM_END[sectionIdx] ?? DEFAULT_ZOOM_END;
      const zoomRate = (zoomEnd - 1).toFixed(3);

      // Expresión zoompan (la coma en min() se escapa con \, para el parser de FFmpeg)
      const zoompanExpr = `zoompan=z='min(1+${zoomRate}*on/${durFrames}\\,${zoomEnd})':d=${durFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=${fps}`;

      if (i === 0) {
        // Hook: zoompan + título del personaje + MEJORA 1 subtítulos
        const hookText = cleanSectionText(guionSections[0]?.content ?? '');
        const subtitleBlocks = chunkByWords(hookText, 6);
        const blockDur = subtitleBlocks.length > 0 ? durPerImage / subtitleBlocks.length : 0;

        const subtitleFilters = subtitleBlocks.map((block, bi) => {
          const start = (bi * blockDur).toFixed(3);
          const end = ((bi + 1) * blockDur - 0.05).toFixed(3);
          return `drawtext=fontfile='${fontPath}':text='${escapeDrawtext(block)}':fontsize=72:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.78:enable='between(t\\,${start}\\,${end})'`;
        });

        const titleFilter = `drawtext=fontfile='${fontPath}':text='${titleText}':fontcolor=white:fontsize=90:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black@1.0:shadowx=5:shadowy=5:alpha='if(lt(t\\,2)\\,1\\,max(0\\,1-(t-2)/1))'`;

        const allFilters = [zoompanExpr, titleFilter, ...subtitleFilters].join(',\n');
        const filterScriptPath = path.join(tmpDir, 'chunk0_filter.txt');
        await fs.writeFile(filterScriptPath, allFilters);

        await runFFmpeg([
          '-loop', '1', '-i', imgAbsPath,
          '-filter_script:v', filterScriptPath,
          '-t', dur, '-r', String(fps),
          '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
          '-an', '-y', chunkPath,
        ]);
      } else {
        // Resto de imágenes: zoompan con zoom según sección
        await runFFmpeg([
          '-loop', '1', '-i', imgAbsPath,
          '-vf', zoompanExpr,
          '-t', dur, '-r', String(fps),
          '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
          '-an', '-y', chunkPath,
        ]);
      }
    }

    // ── Concatenar chunks de imagen ────────────────────────────────────────────
    const listPath = path.join(tmpDir, 'chunks.txt');
    await fs.writeFile(listPath, chunkPaths.map((p) => `file '${p}'`).join('\n'), 'utf-8');
    const concatPath = path.join(tmpDir, 'concat.mp4');
    await runFFmpeg([
      '-f', 'concat', '-safe', '0', '-i', listPath,
      '-c', 'copy', '-y', concatPath,
    ]);

    // ── MEJORA 3: Títulos de sección + fades en un solo pase ──────────────────
    const fadeOutStart = Math.max(0, totalDuration - 2).toFixed(3);
    const audioFadeOutStart = Math.max(0, totalDuration - 3).toFixed(3);

    const videoFilters: string[] = [
      `fade=t=in:st=0:d=0.5`,
      `fade=t=out:st=${fadeOutStart}:d=2`,
    ];

    for (let i = 1; i < Math.min(guionSections.length, SECTION_TITLE_LABELS.length + 1); i++) {
      let label: string | null = i < SECTION_TITLE_LABELS.length ? SECTION_TITLE_LABELS[i] : null;
      if (i === 1 && epoca) {
        label = `— ${escapeDrawtext(epoca.toUpperCase().slice(0, 35))} —`;
      }
      if (!label || sectionStartTimes[i] == null) continue;

      const tStart = sectionStartTimes[i].toFixed(3);
      const tEnd = (sectionStartTimes[i] + 2).toFixed(3);
      videoFilters.push(
        `drawtext=fontfile='${fontPath}':text='${escapeDrawtext(label)}':fontsize=52:fontcolor=#CCCCCC:x=(w-text_w)/2:y=h*0.12:enable='between(t\\,${tStart}\\,${tEnd})'`
      );
    }

    const videoFilterScript = path.join(tmpDir, 'video_filter.txt');
    await fs.writeFile(videoFilterScript, videoFilters.join(',\n'));

    const styledVideoPath = path.join(tmpDir, 'styled.mp4');
    await runFFmpeg([
      '-i', concatPath,
      '-filter_script:v', videoFilterScript,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-an', '-y', styledVideoPath,
    ]);

    // ── Concatenar intro + vídeo principal (solo vídeo) ──────────────────────
    // Ambos son libx264/yuv420p/24fps → -c copy es seguro. Sin audio aún.
    const fullVideoPath = path.join(tmpDir, 'full_video.mp4');
    const finalListPath = path.join(tmpDir, 'final_concat.txt');
    await fs.writeFile(finalListPath, [
      `file '${introSilentPath}'`,
      `file '${styledVideoPath}'`,
    ].join('\n'));
    await runFFmpeg([
      '-f', 'concat', '-safe', '0', '-i', finalListPath,
      '-c', 'copy', '-y', fullVideoPath,
    ]);

    // ── Añadir audio_final al vídeo completo ─────────────────────────────────
    // audio_final dura totalDuration; full_video dura totalDuration+INTRO_DURATION.
    // apad extiende el audio con silencio hasta cubrir los últimos segundos del vídeo.
    const fullVideoDuration = (totalDuration + INTRO_DURATION).toFixed(3);
    await runFFmpeg([
      '-i', fullVideoPath,
      '-i', audioFinalPath,
      '-filter_complex', `[1:a]afade=t=in:st=0:d=2,afade=t=out:st=${audioFadeOutStart}:d=3,apad=whole_dur=${fullVideoDuration}[aout]`,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      '-y', outputPath,
    ]);

  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

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
    const script = await StudioScript.findById(scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });

    if (!script.audio_path) {
      return NextResponse.json({ error: 'El guión no tiene narración de audio' }, { status: 400 });
    }
    if (!script.images_paths?.length) {
      return NextResponse.json({ error: 'El guión no tiene imágenes generadas' }, { status: 400 });
    }
    if (script.video_status === 'processing') {
      return NextResponse.json({ status: 'processing', message: 'Ya está en proceso' });
    }

    script.video_status = 'processing';
    script.video_error = undefined;
    await script.save();

    const publicDir = path.join(process.cwd(), 'public');
    const audioAbsPath = path.join(publicDir, script.audio_path);
    const videosDir = path.join(publicDir, 'studio', 'videos');
    await fs.mkdir(videosDir, { recursive: true });

    const outputFilename = `${scriptId}.mp4`;
    const outputPath = path.join(videosDir, outputFilename);
    const videoPath = `/api/studio/video/${outputFilename}`;
    const imagesPaths = script.images_paths as string[];
    const guionSections = (script.guion_json ?? []) as ScriptSection[];
    const sid = scriptId;
    const pje = (script.personaje as string | undefined) ?? '';
    const ep = (script.epoca as string | undefined) ?? '';

    // ── Proceso en background (no await) ──
    buildVideoBackground(sid, pje, ep, guionSections, imagesPaths, audioAbsPath, outputPath)
      .then(async () => {
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) {
          s.video_path = videoPath;
          s.video_status = 'ready';
          await s.save();
          console.log(`✅ Vídeo listo: ${videoPath}`);
        }
      })
      .catch(async (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error montando vídeo:', msg);
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) {
          s.video_status = 'error';
          s.video_error = msg.slice(0, 500);
          await s.save();
        }
      });

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando generación de vídeo:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
