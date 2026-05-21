import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { djVideoDir, ensureDir, fileExists, getAudioDurationSeconds, resolvePossiblePublicPath, sanitizeFilename } from '@/lib/studio/dj-session-files';
import { createAnimatedDjVisualLoopFromImage } from '@/lib/studio/dj-session-visual-generation';
import { createFallbackVisualIfNeeded } from '@/lib/studio/dj-session-visuals';
import { type IStudioDjSession } from '@/models/StudioDjSession';

interface GenerateDjSessionVideoOptions {
  session: IStudioDjSession;
  canalNombre?: string;
  jobId: string;
  onPid?: (pid: number) => void | Promise<void>;
  onProgress?: (seconds: number) => void | Promise<void>;
}

function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function getOutputDimensions(format: IStudioDjSession['output_format'] | undefined): { width: number; height: number } {
  if (format === '9:16') return { width: 1080, height: 1920 };
  if (format === '1:1') return { width: 1080, height: 1080 };
  return { width: 1920, height: 1080 };
}

function parseProgressSeconds(text: string): number | null {
  const micros = text.match(/out_time_(?:ms|us)=(\d+)/);
  if (micros) {
    const value = Number(micros[1]);
    return Number.isFinite(value) ? value / 1_000_000 : null;
  }

  const outTime = text.match(/out_time=(\d{2}):(\d{2}):(\d{2})\.(\d+)/);
  if (outTime) {
    return Number(outTime[1]) * 3600 + Number(outTime[2]) * 60 + Number(outTime[3]);
  }

  const stderrTime = text.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d+)/);
  if (stderrTime) {
    return Number(stderrTime[1]) * 3600 + Number(stderrTime[2]) * 60 + Number(stderrTime[3]);
  }

  return null;
}

function runFFmpeg(
  args: string[],
  handlers?: {
    onPid?: (pid: number) => void | Promise<void>;
    onProgress?: (seconds: number) => void | Promise<void>;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.env.FFMPEG_PATH || 'ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    if (proc.pid && handlers?.onPid) void handlers.onPid(proc.pid);

    proc.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr.push(text);
      const seconds = parseProgressSeconds(text);
      if (seconds !== null && handlers?.onProgress) void handlers.onProgress(seconds);
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg código ${code}: ${stderr.slice(-8).join('').slice(-1600)}`));
    });
    proc.on('error', reject);
  });
}

function buildTextFilters(session: IStudioDjSession, dimensions: { width: number; height: number }, canalNombre?: string): string[] {
  const title = escapeDrawtext(session.titulo || 'DJ Session');
  const metaParts = [
    session.genre,
    session.bpm ? `${session.bpm} BPM` : '',
    canalNombre || session.dj_id || '',
  ].filter(Boolean);
  const meta = escapeDrawtext(metaParts.join('  |  '));
  const isVertical = dimensions.height > dimensions.width;
  const isSquare = dimensions.height === dimensions.width;
  const titleSize = isVertical ? 58 : isSquare ? 58 : 78;
  const metaSize = isVertical ? 28 : isSquare ? 28 : 34;
  const x = isVertical ? 48 : isSquare ? 56 : 80;
  const titleY = isVertical ? 'h-300' : isSquare ? 'h-220' : 'h-220';
  const metaY = isVertical ? 'h-190' : isSquare ? 'h-128' : 'h-128';

  return [
    "drawbox=x=0:y=0:w=iw:h=ih:color=black@0.28:t=fill",
    `drawtext=text='${title}':fontsize=${titleSize}:fontcolor=white:borderw=3:bordercolor=black@0.65:x=${x}:y=${titleY}`,
    meta
      ? `drawtext=text='${meta}':fontsize=${metaSize}:fontcolor=0xFBBF24:borderw=2:bordercolor=black@0.6:x=${x + 4}:y=${metaY}`
      : '',
  ].filter(Boolean);
}

export interface GeneratedDjSessionVideo {
  videoPath: string;
  videoFilePath: string;
  videoSize: number;
  videoDuration: number;
}

export async function generateDjSessionVideo({
  session,
  canalNombre,
  jobId,
  onPid,
  onProgress,
}: GenerateDjSessionVideoOptions): Promise<GeneratedDjSessionVideo> {
  if (!session.audio_path || !(await fileExists(session.audio_path))) {
    throw new Error('La sesión no tiene audio válido en disco');
  }

  const videoDir = djVideoDir(session.canal_id);
  await ensureDir(videoDir);

  const visualSource = await createFallbackVisualIfNeeded(session);

  const safeBase = sanitizeFilename(`${session._id.toString()}-${session.titulo || 'dj-session'}`).replace(/\.[^.]+$/, '');
  const filename = `${safeBase}.mp4`;
  const outputPath = path.join(videoDir, filename);
  const tempOutputPath = path.join(videoDir, `${safeBase}.rendering-${jobId}.mp4`);
  const tempImageLoopPath = path.join(videoDir, `${safeBase}.visual-loop-${jobId}.mp4`);
  const videoPath = `/api/studio/dj-sessions/${session._id.toString()}/video`;
  const { width, height } = getOutputDimensions(session.output_format);
  const renderOverlays = session.render_overlays === true;

  const logoPath = renderOverlays ? resolvePossiblePublicPath(session.logo_path) : null;
  const hasLogo = renderOverlays && await fileExists(logoPath);
  const visualPath = visualSource.path && (await fileExists(visualSource.path)) ? visualSource.path : null;
  let loopVisualPath: string | null = visualSource.kind === 'video' && visualPath ? visualPath : null;
  const imageVisualPath = visualSource.kind === 'image' && visualPath ? visualPath : null;

  if (imageVisualPath) {
    await createAnimatedDjVisualLoopFromImage(imageVisualPath, tempImageLoopPath, session.output_format);
    loopVisualPath = tempImageLoopPath;
  }

  const args: string[] = loopVisualPath
    ? ['-stream_loop', '-1', '-i', loopVisualPath, '-i', session.audio_path]
    : ['-f', 'lavfi', '-i', `color=c=#070707:s=${width}x${height}:r=30`, '-i', session.audio_path];

  if (hasLogo && logoPath) args.push('-i', logoPath);

  const filterParts: string[] = [
    `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,format=${renderOverlays ? 'rgba' : 'yuv420p'}[base]`,
  ];

  if (renderOverlays) {
    let videoTag = '[base]';
    if (hasLogo) {
      const logoWidth = Math.round(Math.min(width, height) * 0.12);
      const logoMargin = Math.round(Math.min(width, height) * 0.045);
      filterParts.push(`[2:v]scale=${logoWidth}:-1[logo]`);
      filterParts.push(`${videoTag}[logo]overlay=W-w-${logoMargin}:${logoMargin}[vlogo]`);
      videoTag = '[vlogo]';
    }

    const textFilters = buildTextFilters(session, { width, height }, canalNombre);
    filterParts.push(`${videoTag}${textFilters.join(',')}[vout]`);
  } else {
    filterParts.push('[base]copy[vout]');
  }

  args.push(
    '-nostats',
    '-progress',
    'pipe:2',
    '-filter_complex',
    filterParts.join(';'),
    '-map',
    '[vout]',
    '-map',
    '1:a:0',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-r',
    '30',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-pix_fmt',
    'yuv420p',
    '-shortest',
    '-movflags',
    '+faststart',
    '-y',
    tempOutputPath
  );

  try {
    await runFFmpeg(args, { onPid, onProgress });
    await fs.rename(tempOutputPath, outputPath);
  } catch (error) {
    await fs.unlink(tempOutputPath).catch(() => null);
    throw error;
  } finally {
    await fs.unlink(tempImageLoopPath).catch(() => null);
  }

  const stat = await fs.stat(outputPath);
  const videoDuration = await getAudioDurationSeconds(outputPath);

  return {
    videoPath,
    videoFilePath: outputPath,
    videoSize: stat.size,
    videoDuration,
  };
}
