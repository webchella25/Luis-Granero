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
import StudioCanal from '@/models/StudioCanal';

const execAsync = promisify(exec);

// Mapeo sección → categoría de música (1:1 con secciones del guión)
const SECTION_MUSIC_MAP: MusicCategory[] = [
  'hook',           // 0 - Hook / Apertura
  'intro',          // 1 - Introducción
  'desarrollo',     // 2 - Desarrollo principal
  'profundizacion', // 3 - Clímax / Profundización
  'perspectiva',    // 4 - Perspectiva
  'reflexion',      // 5 - Cierre / Reflexión
];

const INTRO_DURATION_DEFAULT = 3; // segundos fallback si no hay intro Remotion
const REMOTION_RENDER_FPS = 24;
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
type ProgressCallback = (progress: number, stage: string) => void | Promise<void>;

async function updateVideoProgress(scriptId: string, progress: number, stage: string): Promise<void> {
  await connectDB();
  await StudioScript.findByIdAndUpdate(scriptId, {
    video_progress: Math.max(0, Math.min(100, Math.round(progress))),
    video_stage: stage,
  });
}

// 6 patrones Ken Burns alternantes: zoom-in/out + paneo en distintas direcciones
function getKBPattern(idx: number, durFrames: number, fps: number): string {
  const f = durFrames;
  const patterns = [
    { z: `min(1+0.08*on/${f}\\,1.08)`, x: 'iw/2-(iw/zoom/2)',            y: 'ih/2-(ih/zoom/2)'            }, // zoom-in centro
    { z: `max(1.08-0.08*on/${f}\\,1.0)`, x: 'iw/2-(iw/zoom/2)',           y: 'ih/2-(ih/zoom/2)'            }, // zoom-out centro
    { z: `min(1+0.05*on/${f}\\,1.05)`,  x: `(iw-iw/zoom)*on/${f}`,        y: 'ih/2-(ih/zoom/2)'            }, // zoom-in + paneo izq→der
    { z: `min(1+0.05*on/${f}\\,1.05)`,  x: 'iw/2-(iw/zoom/2)',            y: `(ih-ih/zoom)*on/${f}`        }, // zoom-in + paneo arr→abj
    { z: `max(1.10-0.05*on/${f}\\,1.05)`, x: `(iw-iw/zoom)*(1-on/${f})`, y: 'ih/2-(ih/zoom/2)'            }, // zoom-out + paneo der→izq
    { z: `min(1+0.05*on/${f}\\,1.05)`,  x: 'iw/2-(iw/zoom/2)',            y: `(ih-ih/zoom)*(1-on/${f})`   }, // zoom-in + paneo abj→arr
  ];
  const p = patterns[idx % patterns.length];
  return `zoompan=z='${p.z}':d=${f}:x='${p.x}':y='${p.y}':s=1920x1080:fps=${fps}`;
}

// ── Utilidades ───────────────────────────────────────────────────────────────

async function getAudioDuration(audioAbsPath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioAbsPath}"`
  );
  return parseFloat(stdout.trim());
}

async function hasAudioStream(mediaAbsPath: string): Promise<boolean> {
  const { stdout } = await execAsync(
    `ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "${mediaAbsPath}"`
  );
  return stdout.trim().length > 0;
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

interface RemotionStudioProps {
  canalNombre: string;
  personaje: string;
  epoca: string;
  images: string[];
  sections: Array<{ title: string; content: string; start: number; duration: number }>;
  totalDuration: number;
  introDuration: number;
}

async function selectTrack(
  categoria: MusicCategory,
  lastUsed: Record<string, string[]>,
  canal_id: string
): Promise<{ track: TrackLean | null }> {
  const tracks = await StudioMusicTrack.find({ categoria, canal_id }).lean();
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

function runRemotion(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['remotion', ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Remotion salió con código ${code}: ${stderr.slice(-10).join('')}`));
    });
    proc.on('error', reject);
  });
}

async function findIntroSource(canalId: string, remotionDir: string): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), 'public', 'studio', 'canales', canalId, 'intro.mp4'),
    path.join(remotionDir, 'out', 'intro.mp4'),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

async function prepareIntroClip(
  tmpDir: string,
  canalId: string,
  remotionDir: string
): Promise<{ path: string; duration: number } | null> {
  const introSource = await findIntroSource(canalId, remotionDir);
  if (!introSource) return null;

  const duration = await getAudioDuration(introSource);
  const introPath = path.join(tmpDir, 'intro_ready.mp4');
  const scaleFilter = `scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=decrease,pad=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:(ow-iw)/2:(oh-ih)/2,fps=${REMOTION_RENDER_FPS},format=yuv420p`;

  if (await hasAudioStream(introSource)) {
    await runFFmpeg([
      '-i', introSource,
      '-vf', scaleFilter,
      '-t', duration.toFixed(3),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      '-y', introPath,
    ]);
  } else {
    await runFFmpeg([
      '-i', introSource,
      '-f', 'lavfi', '-t', duration.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo',
      '-map', '0:v', '-map', '1:a',
      '-vf', scaleFilter,
      '-t', duration.toFixed(3),
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-shortest', '-movflags', '+faststart',
      '-y', introPath,
    ]);
  }

  return { path: introPath, duration };
}

async function copyImageToRemotionPublic(
  imagePath: string,
  publicDir: string,
  remotionRenderDir: string,
  index: number
): Promise<string> {
  const cleanImgPath = imagePath.split('?')[0];
  const imgApiMatch = cleanImgPath.match(/\/api\/studio\/image\/([^/]+)\/([^/]+)$/);
  const source = imgApiMatch
    ? path.join(publicDir, 'studio', 'images', imgApiMatch[1], imgApiMatch[2])
    : path.join(publicDir, cleanImgPath.replace(/^\//, ''));
  const ext = path.extname(source) || '.jpg';
  const filename = `image-${String(index).padStart(3, '0')}${ext}`;
  const target = path.join(remotionRenderDir, filename);
  await fs.copyFile(source, target);
  return filename;
}

async function createMixedAudioForVideo(
  tmpDir: string,
  publicDir: string,
  audioAbsPath: string,
  sectionDurations: number[],
  durPerImage: number,
  guionSections: ScriptSection[],
  canal_id: string
): Promise<string> {
  const configDoc = await StudioConfig.findOne({ key: 'last_used_tracks' }).lean();
  const lastUsedTracks: Record<string, string[]> =
    (configDoc?.data as Record<string, string[]>) ?? {};
  const selectedTracks: (string | null)[] = [];
  const newLastUsed: Record<string, string[]> = { ...lastUsedTracks };

  for (let i = 0; i < Math.min(guionSections.length, SECTION_MUSIC_MAP.length); i++) {
    const categoria = SECTION_MUSIC_MAP[i];
    const { track } = await selectTrack(categoria, lastUsedTracks, canal_id);
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

  if (!selectedTracks.some((t) => t !== null)) return audioAbsPath;

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

  const audioMixedPath = path.join(tmpDir, 'audio_final.mp3');
  await runFFmpeg([
    '-i', audioAbsPath,
    '-i', musicFullPath,
    '-filter_complex', '[1:a]volume=0.15[m];[0:a][m]amix=inputs=2:duration=first:normalize=0',
    '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', '-ac', '2',
    '-y', audioMixedPath,
  ]);

  return audioMixedPath;
}

async function buildVideoWithRemotion(
  scriptId: string,
  personaje: string,
  epoca: string,
  guionSections: ScriptSection[],
  imagePaths: string[],
  audioAbsPath: string,
  outputPath: string,
  canalNombre: string,
  canal_id: string,
  audioSectionDurations: number[] = [],
  onProgress: ProgressCallback = () => undefined
): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const tmpDir = path.join('/tmp', `studio-remotion-${scriptId}`);
  const remotionDir = path.join(process.cwd(), 'remotion-intro');
  const remotionPublicDir = path.join(remotionDir, 'public');
  const renderPublicRelDir = path.join('renders', scriptId);
  const renderPublicDir = path.join(remotionPublicDir, renderPublicRelDir);
  const remotionVisualPath = path.join(tmpDir, 'visual.mp4');
  const propsPath = path.join(tmpDir, 'props.json');

  await fs.mkdir(tmpDir, { recursive: true });
  await fs.rm(renderPublicDir, { recursive: true, force: true }).catch(() => null);
  await fs.mkdir(renderPublicDir, { recursive: true });

  try {
    await onProgress(5, 'Preparando montaje Remotion');
    const totalDuration = await getAudioDuration(audioAbsPath);
    const durPerImage = totalDuration / imagePaths.length;
    await onProgress(10, 'Calculando duraciones');
    const introClip = await prepareIntroClip(tmpDir, canal_id, remotionDir);
    const introDuration = introClip?.duration ?? 0;
    await onProgress(16, introClip ? 'Intro preparada' : 'Sin intro: preparando cuerpo del vídeo');

    let sectionDurations: number[];
    if (audioSectionDurations.length === guionSections.length) {
      sectionDurations = audioSectionDurations;
    } else {
      const sectionWordCounts = guionSections.map(
        (s) => s.content.split(/\s+/).filter(Boolean).length
      );
      const totalWords = sectionWordCounts.reduce((a, b) => a + b, 0) || 1;
      sectionDurations = sectionWordCounts.map((w) => (w / totalWords) * totalDuration);
    }

    const remotionImages: string[] = [];
    for (let i = 0; i < imagePaths.length; i++) {
      const filename = await copyImageToRemotionPublic(imagePaths[i], publicDir, renderPublicDir, i);
      remotionImages.push(path.posix.join(renderPublicRelDir, filename));
      if (i % 5 === 0 || i === imagePaths.length - 1) {
        await onProgress(18 + ((i + 1) / imagePaths.length) * 12, `Copiando assets ${i + 1}/${imagePaths.length}`);
      }
    }

    const sections: RemotionStudioProps['sections'] = [];
    let sectionStart = 0;
    for (let i = 0; i < guionSections.length; i++) {
      const duration = sectionDurations[i] ?? 0;
      sections.push({
        title: guionSections[i]?.title ?? `Sección ${i + 1}`,
        content: guionSections[i]?.content ?? '',
        start: sectionStart,
        duration,
      });
      sectionStart += duration;
    }

    const props: RemotionStudioProps = {
      canalNombre,
      personaje,
      epoca,
      images: remotionImages,
      sections,
      totalDuration,
      introDuration: 0,
    };
    await fs.writeFile(propsPath, JSON.stringify(props), 'utf-8');

    await onProgress(34, 'Renderizando vídeo visual');
    await runRemotion([
      'render',
      'StudioLongVideo',
      remotionVisualPath,
      `--props=${propsPath}`,
      '--overwrite',
      '--log=warn',
      '--concurrency=4',
      '--crf=23',
      '--x264-preset=veryfast',
    ], remotionDir);

    await onProgress(58, 'Mezclando narración y música');
    const audioFinalPath = await createMixedAudioForVideo(
      tmpDir,
      publicDir,
      audioAbsPath,
      sectionDurations,
      durPerImage,
      guionSections,
      canal_id
    );

    await onProgress(68, 'Uniendo vídeo visual con pista base');
    const bodyWithAudioPath = path.join(tmpDir, 'body_silent.mp4');
    await runFFmpeg([
      '-i', remotionVisualPath,
      '-f', 'lavfi', '-t', totalDuration.toFixed(3), '-i', 'anullsrc=r=44100:cl=stereo',
      '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-shortest',
      '-y', bodyWithAudioPath,
    ]);

    let baseVideoPath = bodyWithAudioPath;
    if (introClip) {
      await onProgress(76, 'Añadiendo intro');
      const concatListPath = path.join(tmpDir, 'remotion_concat.txt');
      baseVideoPath = path.join(tmpDir, 'with_intro.mp4');
      await fs.writeFile(concatListPath, [
        `file '${introClip.path}'`,
        `file '${bodyWithAudioPath}'`,
      ].join('\n'), 'utf-8');
      await runFFmpeg([
        '-f', 'concat', '-safe', '0', '-i', concatListPath,
        '-c', 'copy',
        '-y', baseVideoPath,
      ]);
    }

    await onProgress(86, 'Exportando vídeo final');
    const audioFadeOutStart = Math.max(0, totalDuration - 3).toFixed(3);
    const fullVideoDuration = (totalDuration + introDuration).toFixed(3);
    const audioDelayMs = Math.round(introDuration * 1000);
    await runFFmpeg([
      '-i', baseVideoPath,
      '-i', audioFinalPath,
      '-filter_complex', `[1:a]adelay=${audioDelayMs}|${audioDelayMs},afade=t=in:st=${introDuration.toFixed(3)}:d=2,afade=t=out:st=${(introDuration + parseFloat(audioFadeOutStart)).toFixed(3)}:d=3,apad=whole_dur=${fullVideoDuration}[narr];[0:a][narr]amix=inputs=2:duration=first:normalize=0[aout]`,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      '-y', outputPath,
    ]);
    await onProgress(98, 'Finalizando archivo MP4');
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
    await fs.rm(renderPublicDir, { recursive: true, force: true }).catch(() => null);
  }
}

// ── Pipeline principal ───────────────────────────────────────────────────────

async function buildVideoBackground(
  scriptId: string,
  personaje: string,
  epoca: string,
  guionSections: ScriptSection[],
  imagePaths: string[],
  audioAbsPath: string,
  outputPath: string,
  canalNombre: string,
  canal_id: string,
  canalLogoUrl: string = '',
  audioSectionDurations: number[] = [],
  onProgress: ProgressCallback = () => undefined
): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const tmpDir = path.join('/tmp', `studio-${scriptId}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const fontPath = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
  const titleText = escapeDrawtext(personaje.toUpperCase());
  const fps = 24;

  try {
    // ── 1. Duraciones ──────────────────────────────────────────────────────────
    await onProgress(8, 'Fallback FFmpeg: calculando duraciones');
    const totalDuration = await getAudioDuration(audioAbsPath);
    const durPerImage = totalDuration / imagePaths.length;

    // Duración por sección: usar duraciones exactas del TTS si están disponibles
    // Si no, estimar proporcional a palabras
    let sectionDurations: number[];
    if (audioSectionDurations.length === guionSections.length) {
      sectionDurations = audioSectionDurations;
    } else {
      const sectionWordCounts = guionSections.map(
        (s) => s.content.split(/\s+/).filter(Boolean).length
      );
      const totalWords = sectionWordCounts.reduce((a, b) => a + b, 0) || 1;
      sectionDurations = sectionWordCounts.map((w) => (w / totalWords) * totalDuration);
    }

    // Timestamps de inicio de cada sección en el vídeo principal
    const sectionStartTimes: number[] = [];
    let accum = 0;
    for (const dur of sectionDurations) {
      sectionStartTimes.push(accum);
      accum += dur;
    }

    // ── 2. Música por sección ──────────────────────────────────────────────────
    await onProgress(16, 'Seleccionando música por sección');
    const configDoc = await StudioConfig.findOne({ key: 'last_used_tracks' }).lean();
    const lastUsedTracks: Record<string, string[]> =
      (configDoc?.data as Record<string, string[]>) ?? {};
    const selectedTracks: (string | null)[] = [];
    const newLastUsed: Record<string, string[]> = { ...lastUsedTracks };

    for (let i = 0; i < Math.min(guionSections.length, SECTION_MUSIC_MAP.length); i++) {
      const categoria = SECTION_MUSIC_MAP[i];
      const { track } = await selectTrack(categoria, lastUsedTracks, canal_id);
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
      await onProgress(24, 'Mezclando música y narración');
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

    // ── MEJORA 2: Intro animada — usa Remotion si existe, si no FFmpeg fallback ──
    const introSilentPath = path.join(tmpDir, 'intro_silent.mp4');
    const remotionIntroSrc = path.join(process.cwd(), 'public', 'studio', 'canales', canal_id, 'intro.mp4');
    let INTRO_DURATION = INTRO_DURATION_DEFAULT;

    let hasRemotionIntro = false;
    try { await fs.access(remotionIntroSrc); hasRemotionIntro = true; } catch { /* no hay intro Remotion */ }

    if (hasRemotionIntro) {
      await onProgress(32, 'Preparando intro');
      // Transcodificar para garantizar compatibilidad (yuv420p, 24fps, sin audio)
      await runFFmpeg([
        '-i', remotionIntroSrc,
        '-vf', `scale=1920:1080,fps=${fps}`,
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-an', '-y', introSilentPath,
      ]);
      INTRO_DURATION = await getAudioDuration(introSilentPath);
    } else {
      await onProgress(32, 'Creando intro fallback');
      // Fallback: intro FFmpeg básica con logo o texto
      const introFilterScript = path.join(tmpDir, 'intro_filter.txt');
      let logoAbsPath: string | null = null;
      if (canalLogoUrl) {
        const candidate = path.join(process.cwd(), 'public', canalLogoUrl.replace(/^\//, ''));
        try { await fs.access(candidate); logoAbsPath = candidate; } catch { /* sin logo */ }
      }

      let introFFmpegArgs: string[];
      if (logoAbsPath) {
        const nameText = escapeDrawtext(canalNombre.toUpperCase());
        const complexFilter = [
          `[1:v]scale=-1:280,format=rgba,fade=t=in:st=0.5:d=0.5:alpha=1,fade=t=out:st=2.5:d=0.5:alpha=1[logo]`,
          `[0:v]drawtext=fontfile='${fontPath}':text='${nameText}':fontsize=90:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+170:shadowcolor=black@1.0:shadowx=4:shadowy=4:alpha='if(lt(t\\,0.5)\\,0\\,if(lt(t\\,1.0)\\,t-0.5\\,if(lt(t\\,2.5)\\,1\\,3-t)))'[base]`,
          `[base][logo]overlay=(W-w)/2:(H-280)/2-60:format=auto[out]`,
        ].join(';\n');
        await fs.writeFile(introFilterScript, complexFilter);
        introFFmpegArgs = [
          '-f', 'lavfi', '-i', `color=c=black:size=1920x1080:duration=${INTRO_DURATION}`,
          '-i', logoAbsPath,
          '-filter_complex_script', introFilterScript,
          '-map', '[out]',
          '-r', String(fps), '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
          '-an', '-y', introSilentPath,
        ];
      } else {
        const introFilter = [
          `drawtext=fontfile='${fontPath}':text='${escapeDrawtext(canalNombre.toUpperCase())}':fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:shadowcolor=black@1.0:shadowx=4:shadowy=4:alpha='if(lt(t\\,0.5)\\,0\\,if(lt(t\\,1.0)\\,t-0.5\\,if(lt(t\\,2.5)\\,1\\,3-t)))'`,
          `drawtext=fontfile='${fontPath}':text='Historia real. Sin filtros.':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+60:alpha='if(lt(t\\,1.5)\\,0\\,if(lt(t\\,2.0)\\,t-1.5\\,if(lt(t\\,2.5)\\,1\\,3-t)))'`,
        ].join(',\n');
        await fs.writeFile(introFilterScript, introFilter);
        introFFmpegArgs = [
          '-f', 'lavfi', '-i', `color=c=black:size=1920x1080:duration=${INTRO_DURATION}`,
          '-filter_script:v', introFilterScript,
          '-r', String(fps), '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
          '-an', '-y', introSilentPath,
        ];
      }
      await runFFmpeg(introFFmpegArgs);
    }

    // ── MEJORA 1+4: Chunks de imagen con subtítulos Hook y Ken Burns variable ──
    const chunkPaths: string[] = [];

    for (let i = 0; i < imagePaths.length; i++) {
      await onProgress(38 + (i / Math.max(imagePaths.length, 1)) * 32, `Renderizando imagen ${i + 1}/${imagePaths.length}`);
      const cleanImgPath = imagePaths[i].split('?')[0];
      const imgApiMatch = cleanImgPath.match(/\/api\/studio\/image\/([^/]+)\/([^/]+)$/);
      const imgAbsPath = imgApiMatch
        ? path.join(publicDir, 'studio', 'images', imgApiMatch[1], imgApiMatch[2])
        : path.join(publicDir, cleanImgPath);
      const chunkPath = path.join(tmpDir, `chunk_${i}.mp4`);
      chunkPaths.push(chunkPath);

      const dur = durPerImage.toFixed(3);
      const durFrames = Math.round(durPerImage * fps);
      const zoompanExpr = getKBPattern(i, durFrames, fps);
      const fadeOutSt = Math.max(0, durPerImage - 0.25).toFixed(3);

      if (i === 0) {
        // Hook: zoompan + título del personaje (subtítulos ahora en el pase global)
        const titleFilter = `drawtext=fontfile='${fontPath}':text='${titleText}':fontcolor=white:fontsize=90:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black@1.0:shadowx=5:shadowy=5:alpha='if(lt(t\\,2)\\,1\\,max(0\\,1-(t-2)/1))'`;

        const allFilters = [zoompanExpr, titleFilter, `fade=t=in:st=0:d=0.5`, `fade=t=out:st=${fadeOutSt}:d=0.25`].join(',\n');
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
        // Resto de imágenes: Ken Burns alternante + fade in/out
        await runFFmpeg([
          '-loop', '1', '-i', imgAbsPath,
          '-vf', `${zoompanExpr},fade=t=in:st=0:d=0.25,fade=t=out:st=${fadeOutSt}:d=0.25`,
          '-t', dur, '-r', String(fps),
          '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
          '-an', '-y', chunkPath,
        ]);
      }
    }

    // ── Concatenar chunks de imagen ────────────────────────────────────────────
    await onProgress(72, 'Uniendo clips de imagen');
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
      `eq=saturation=0.85:contrast=1.08`,
      `noise=alls=8:allf=t+u`,
      `vignette=PI/5`,
    ];

    for (let i = 1; i < guionSections.length; i++) {
      let label: string | null = guionSections[i]?.title
        ? `— ${escapeDrawtext(guionSections[i].title.toUpperCase().slice(0, 40))} —`
        : null;
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

    // Subtítulos para todas las secciones, sincronizados con las duraciones reales del TTS
    for (let secI = 0; secI < guionSections.length; secI++) {
      const sectionText = cleanSectionText(guionSections[secI]?.content ?? '');
      const blocks = chunkByWords(sectionText, 6);
      if (blocks.length === 0) continue;
      const secDur = sectionDurations[secI] ?? (totalDuration / Math.max(guionSections.length, 1));
      const blockDur = secDur / blocks.length;
      const secStart = sectionStartTimes[secI] ?? 0;
      for (let bi = 0; bi < blocks.length; bi++) {
        const tStart = (secStart + bi * blockDur).toFixed(3);
        const tEnd = (secStart + (bi + 1) * blockDur - 0.05).toFixed(3);
        videoFilters.push(
          `drawtext=fontfile='${fontPath}':text='${escapeDrawtext(blocks[bi])}':fontsize=72:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.82:enable='between(t\\,${tStart}\\,${tEnd})'`
        );
      }
    }

    const videoFilterScript = path.join(tmpDir, 'video_filter.txt');
    await fs.writeFile(videoFilterScript, videoFilters.join(',\n'));

    await onProgress(80, 'Aplicando subtítulos y estilo');
    const styledVideoPath = path.join(tmpDir, 'styled.mp4');
    await runFFmpeg([
      '-i', concatPath,
      '-filter_script:v', videoFilterScript,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-an', '-y', styledVideoPath,
    ]);

    // ── Concatenar intro + vídeo principal (solo vídeo) ──────────────────────
    await onProgress(88, 'Añadiendo intro al vídeo');
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
    await onProgress(94, 'Exportando MP4 final');
    // audio_final dura totalDuration; full_video dura totalDuration+INTRO_DURATION.
    // apad extiende el audio con silencio hasta cubrir los últimos segundos del vídeo.
    const fullVideoDuration = (totalDuration + INTRO_DURATION).toFixed(3);
    await runFFmpeg([
      '-i', fullVideoPath,
      '-i', audioFinalPath,
      '-filter_complex', `[1:a]adelay=${INTRO_DURATION * 1000}|${INTRO_DURATION * 1000},afade=t=in:st=${INTRO_DURATION}:d=2,afade=t=out:st=${(INTRO_DURATION + parseFloat(audioFadeOutStart)).toFixed(3)}:d=3,apad=whole_dur=${fullVideoDuration}[aout]`,
      '-map', '0:v',
      '-map', '[aout]',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-ac', '2',
      '-movflags', '+faststart',
      '-y', outputPath,
    ]);
    await onProgress(98, 'Finalizando archivo MP4');

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
    const canalId = session.canal_id;
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
    script.video_progress = 1;
    script.video_stage = 'Iniciando montaje';
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
    const canalDoc = await StudioCanal.findById(canalId).select('nombre logo_url').lean() as { nombre?: string; logo_url?: string } | null;
    const canalNombre = canalDoc?.nombre ?? pje ?? 'STUDIO';
    const canalLogoUrl = canalDoc?.logo_url ?? '';

    // ── Proceso en background (no await) ──
    const audioSectionDurations = (script.audio_section_durations as number[] | undefined) ?? [];
    const reportProgress = (progress: number, stage: string) => updateVideoProgress(sid, progress, stage);
    buildVideoWithRemotion(sid, pje, ep, guionSections, imagesPaths, audioAbsPath, outputPath, canalNombre, canalId, audioSectionDurations, reportProgress)
      .catch(async (remotionErr: unknown) => {
        const msg = remotionErr instanceof Error ? remotionErr.message : 'Error desconocido';
        console.warn('[generate-video] Remotion falló, usando FFmpeg fallback:', msg);
        await reportProgress(6, 'Remotion falló, usando FFmpeg fallback');
        await buildVideoBackground(sid, pje, ep, guionSections, imagesPaths, audioAbsPath, outputPath, canalNombre, canalId, canalLogoUrl, audioSectionDurations, reportProgress);
      })
      .then(async () => {
        await connectDB();
        const s = await StudioScript.findById(sid);
        if (s) {
          s.video_path = videoPath;
          s.video_status = 'ready';
          s.video_progress = 100;
          s.video_stage = 'Vídeo listo';
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
          s.video_stage = 'Error durante el montaje';
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
