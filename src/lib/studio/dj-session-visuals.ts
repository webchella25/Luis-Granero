import { fileExists, resolvePossiblePublicPath } from '@/lib/studio/dj-session-files';
import type { IStudioDjSession } from '@/models/StudioDjSession';

export type DjSessionVisualMode = 'static_cover' | 'video_loop' | 'generated_visual';

export interface ResolvedVisualSource {
  mode: DjSessionVisualMode;
  path: string | null;
  kind: 'video' | 'image' | 'color';
}

const ALLOWED_VISUAL_MODES = new Set<DjSessionVisualMode>(['static_cover', 'video_loop', 'generated_visual']);

export function sanitizeVisualMode(value: unknown): DjSessionVisualMode {
  return typeof value === 'string' && ALLOWED_VISUAL_MODES.has(value as DjSessionVisualMode)
    ? (value as DjSessionVisualMode)
    : 'static_cover';
}

export async function validateVisualVideo(file: File): Promise<boolean> {
  const ext = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
  const mimeType = file.type || '';
  const allowedExt = new Set(['.mp4', '.mov', '.webm']);
  const allowedMime = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
  return allowedExt.has(ext) || allowedMime.has(mimeType);
}

export async function resolveVisualSource(
  session: Pick<IStudioDjSession, 'visual_mode' | 'visual_video_path' | 'visual_image_path' | 'cover_image_path'>
): Promise<ResolvedVisualSource> {
  const mode = sanitizeVisualMode(session.visual_mode);

  const coverPath = resolvePossiblePublicPath(session.cover_image_path);
  if (coverPath && (await fileExists(coverPath))) {
    return { mode, path: coverPath, kind: 'image' };
  }

  if (session.visual_image_path && (await fileExists(session.visual_image_path))) {
    return { mode, path: session.visual_image_path, kind: 'image' };
  }

  if ((mode === 'video_loop' || mode === 'generated_visual') && session.visual_video_path && (await fileExists(session.visual_video_path))) {
    return { mode, path: session.visual_video_path, kind: 'video' };
  }

  return { mode, path: null, kind: 'color' };
}

export async function createFallbackVisualIfNeeded(
  session: Pick<IStudioDjSession, 'visual_mode' | 'visual_video_path' | 'visual_image_path' | 'cover_image_path'>
): Promise<ResolvedVisualSource> {
  return resolveVisualSource(session);
}
