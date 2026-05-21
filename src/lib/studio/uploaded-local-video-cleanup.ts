import fs from 'fs/promises';
import path from 'path';
import StudioScript, { type IStudioScript, type ShortEntry } from '@/models/StudioScript';

export type StudioLocalVideoKind = 'video' | 'short';

const UPLOADED_YOUTUBE_STATUSES = new Set(['ready', 'uploaded', 'completed']);

export function isUploadedYoutubeStatus(status?: string | null): boolean {
  return !!status && UPLOADED_YOUTUBE_STATUSES.has(status);
}

export function hasConfirmedYoutubeUpload(record: {
  youtube_id?: string | null;
  youtube_url?: string | null;
  youtube_status?: string | null;
}): boolean {
  return !!(record.youtube_id || record.youtube_url) && isUploadedYoutubeStatus(record.youtube_status);
}

export function getStudioLocalVideoPath(kind: StudioLocalVideoKind, apiPath?: string | null): string | null {
  if (!apiPath) return null;
  const filename = path.basename(apiPath.split('?')[0] ?? '');
  if (!filename || filename === '.' || filename === '..') return null;
  const dir = kind === 'video' ? 'videos' : 'shorts';
  return path.join(process.cwd(), 'public', 'studio', dir, filename);
}

export async function localVideoExists(kind: StudioLocalVideoKind, apiPath?: string | null): Promise<boolean> {
  const absPath = getStudioLocalVideoPath(kind, apiPath);
  if (!absPath) return false;
  try {
    const stat = await fs.stat(absPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function deleteLocalVideoFile(kind: StudioLocalVideoKind, apiPath?: string | null): Promise<boolean> {
  const absPath = getStudioLocalVideoPath(kind, apiPath);
  if (!absPath) return false;
  try {
    await fs.unlink(absPath);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return false;
    throw error;
  }
}

export async function cleanupUploadedLocalVideos(): Promise<{
  videosDeleted: number;
  shortsDeleted: number;
  missingAlready: number;
}> {
  const scripts = await StudioScript.find({
    $or: [
      { youtube_url: { $exists: true, $ne: '' } },
      { youtube_id: { $exists: true, $ne: '' } },
      { 'shorts.youtube_url': { $exists: true, $ne: '' } },
      { 'shorts.youtube_id': { $exists: true, $ne: '' } },
    ],
  });

  let videosDeleted = 0;
  let shortsDeleted = 0;
  let missingAlready = 0;

  for (const script of scripts) {
    let changed = false;

    if (
      script.video_path &&
      !script.video_local_deleted_at &&
      hasConfirmedYoutubeUpload(script as IStudioScript)
    ) {
      const deleted = await deleteLocalVideoFile('video', script.video_path);
      if (deleted) videosDeleted += 1;
      else missingAlready += 1;
      script.video_local_deleted_at = new Date();
      changed = true;
    }

    for (const short of script.shorts ?? []) {
      const shortRecord = short as ShortEntry;
      if (
        shortRecord.path &&
        !shortRecord.local_deleted_at &&
        hasConfirmedYoutubeUpload(shortRecord)
      ) {
        const deleted = await deleteLocalVideoFile('short', shortRecord.path);
        if (deleted) shortsDeleted += 1;
        else missingAlready += 1;
        shortRecord.local_deleted_at = new Date();
        changed = true;
      }
    }

    if (changed) await script.save();
  }

  return { videosDeleted, shortsDeleted, missingAlready };
}
