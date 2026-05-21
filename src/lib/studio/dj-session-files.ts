import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export const DJ_STORAGE_ROOT = process.env.STORAGE_DIR || path.join(process.cwd(), 'studio');
export const DJ_SESSION_ROOT = process.env.DJ_SESSION_STORAGE_DIR || path.join(DJ_STORAGE_ROOT, 'dj-sessions');
export const DJ_SESSION_PUBLIC_ROOT = path.join(process.cwd(), 'public', 'studio', 'dj-sessions');
export const DJ_DEFAULT_CHUNK_SIZE =
  Number.parseInt(process.env.DJ_UPLOAD_CHUNK_BYTES ?? process.env.DJ_SESSION_UPLOAD_CHUNK_BYTES ?? '', 10) ||
  8 * 1024 * 1024;
export const DJ_MAX_AUDIO_BYTES =
  Number.parseInt(process.env.DJ_MAX_AUDIO_BYTES ?? process.env.DJ_SESSION_MAX_AUDIO_BYTES ?? '', 10) ||
  5 * 1024 * 1024 * 1024;
export const DJ_MAX_VISUAL_VIDEO_BYTES =
  Number.parseInt(process.env.DJ_VISUAL_VIDEO_MAX_BYTES ?? process.env.DJ_SESSION_VISUAL_MAX_BYTES ?? '', 10) ||
  500 * 1024 * 1024;
export const DJ_MAX_VISUAL_IMAGE_BYTES =
  Number.parseInt(process.env.DJ_VISUAL_IMAGE_MAX_BYTES ?? process.env.DJ_SESSION_VISUAL_IMAGE_MAX_BYTES ?? '', 10) ||
  20 * 1024 * 1024;
export const FFPROBE_BIN = process.env.FFPROBE_PATH || 'ffprobe';
export const DJ_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/x-m4a',
]);

const DJ_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.m4a']);
const DJ_VISUAL_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);
const DJ_VISUAL_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const DJ_VISUAL_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const DJ_VISUAL_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedDjAudio(file: File): boolean {
  const ext = path.extname(file.name).toLowerCase();
  return DJ_AUDIO_EXTENSIONS.has(ext) || DJ_AUDIO_MIME_TYPES.has(file.type);
}

export function isAllowedDjAudioMetadata(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return DJ_AUDIO_EXTENSIONS.has(ext) || DJ_AUDIO_MIME_TYPES.has(mimeType);
}

export function isAllowedDjVisualVideo(file: File): boolean {
  const ext = path.extname(file.name).toLowerCase();
  return DJ_VISUAL_EXTENSIONS.has(ext) || DJ_VISUAL_MIME_TYPES.has(file.type);
}

export function isAllowedDjVisualVideoMetadata(filename: string, mimeType: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return DJ_VISUAL_EXTENSIONS.has(ext) || DJ_VISUAL_MIME_TYPES.has(mimeType);
}

export function isAllowedDjVisualImage(file: File): boolean {
  const ext = path.extname(file.name).toLowerCase();
  return DJ_VISUAL_IMAGE_EXTENSIONS.has(ext) || DJ_VISUAL_IMAGE_MIME_TYPES.has(file.type);
}

export function getDjVisualImageMimeType(filename: string, fallback = 'image/jpeg'): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return fallback;
}

export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const base = path
    .basename(filename, ext)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  return `${base || 'audio'}${ext || '.mp3'}`;
}

export function djAudioDir(canalId: string): string {
  return path.join(DJ_SESSION_ROOT, 'audio', canalId);
}

export function djUploadRoot(workspaceId: string): string {
  return path.join(DJ_SESSION_ROOT, 'chunks', workspaceId);
}

export function djUploadDir(workspaceId: string, uploadId: string): string {
  return path.join(djUploadRoot(workspaceId), uploadId);
}

export function djChunkPath(workspaceId: string, uploadId: string, chunkIndex: number): string {
  return path.join(djUploadDir(workspaceId, uploadId), `chunk-${String(chunkIndex).padStart(6, '0')}.part`);
}

export function djVideoDir(canalId: string): string {
  return path.join(DJ_SESSION_PUBLIC_ROOT, 'videos', canalId);
}

export function djVisualDir(canalId: string): string {
  return path.join(DJ_SESSION_ROOT, 'visuals', canalId);
}

export function publicDjVideoPath(canalId: string, filename: string): string {
  return `/api/studio/dj-sessions/video/${canalId}/${filename}`;
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function removeDirIfExists(dir: string | null | undefined): Promise<void> {
  if (!dir) return;
  if (!isSafeDjDeletePath(dir)) throw new Error(`Ruta no permitida para borrar: ${dir}`);
  await fs.rm(dir, { recursive: true, force: true }).catch(() => null);
}

export async function fileExists(filePath: string | null | undefined): Promise<boolean> {
  if (!filePath) return false;
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function resolvePossiblePublicPath(filePath: string | null | undefined): string | null {
  if (!filePath) return null;
  if (path.isAbsolute(filePath)) return filePath;
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  return path.join(process.cwd(), 'public', cleanPath.replace(/^public\//, ''));
}

export function isPathInside(childPath: string, parentPath: string): boolean {
  const relative = path.relative(path.resolve(parentPath), path.resolve(childPath));
  return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

export function isSafeDjDeletePath(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return (
    isPathInside(resolved, DJ_SESSION_ROOT) ||
    isPathInside(resolved, DJ_SESSION_PUBLIC_ROOT)
  );
}

export async function getAudioDurationSeconds(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn(FFPROBE_BIN, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ]);
    let stdout = '';
    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.on('close', () => {
      const duration = Number.parseFloat(stdout.trim());
      resolve(Number.isFinite(duration) ? duration : 0);
    });
    proc.on('error', () => resolve(0));
  });
}

export async function removeFileIfExists(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;
  const resolved = resolvePossiblePublicPath(filePath);
  if (!resolved) return;
  if (!isSafeDjDeletePath(resolved)) {
    console.warn(`[dj-session-files] Borrado omitido fuera de storage permitido: ${resolved}`);
    return;
  }
  await fs.unlink(resolved).catch(() => null);
}
