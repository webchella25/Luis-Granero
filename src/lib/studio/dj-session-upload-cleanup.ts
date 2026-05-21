import fs from 'fs/promises';
import path from 'path';
import {
  DJ_SESSION_PUBLIC_ROOT,
  DJ_SESSION_ROOT,
  djUploadDir,
  isPathInside,
  isSafeDjDeletePath,
  removeDirIfExists,
} from '@/lib/studio/dj-session-files';
import StudioDjSession from '@/models/StudioDjSession';
import StudioDjUploadSession from '@/models/StudioDjUploadSession';

const DEFAULT_FAILED_RETENTION_HOURS = 24;
const DEFAULT_ORPHAN_RETENTION_HOURS = 24;

export interface DjUploadCleanupResult {
  uploads_expired: number;
  chunks_deleted: number;
  orphan_audios_deleted: number;
  orphan_videos_deleted: number;
  temp_renders_deleted: number;
  errors: string[];
}

function olderThan(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) return [];
  const files: string[] = [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function listUploadDirs(): Promise<string[]> {
  const root = path.join(DJ_SESSION_ROOT, 'chunks');
  if (!(await pathExists(root))) return [];
  const dirs: string[] = [];
  const workspaceEntries = await fs.readdir(root, { withFileTypes: true });
  for (const workspace of workspaceEntries) {
    if (!workspace.isDirectory()) continue;
    const workspacePath = path.join(root, workspace.name);
    const uploadEntries = await fs.readdir(workspacePath, { withFileTypes: true }).catch(() => []);
    for (const upload of uploadEntries) {
      if (upload.isDirectory()) dirs.push(path.join(workspacePath, upload.name));
    }
  }
  return dirs;
}

async function safeRemoveFile(filePath: string): Promise<boolean> {
  if (!isSafeDjDeletePath(filePath)) throw new Error(`Ruta no permitida para borrar: ${filePath}`);
  await fs.unlink(filePath);
  return true;
}

export async function cleanupDjUploadSessions(options?: {
  failedRetentionHours?: number;
  orphanRetentionHours?: number;
  now?: Date;
}): Promise<DjUploadCleanupResult> {
  const now = options?.now ?? new Date();
  const failedCutoff = olderThan(options?.failedRetentionHours ?? DEFAULT_FAILED_RETENTION_HOURS);
  const orphanCutoff = olderThan(options?.orphanRetentionHours ?? DEFAULT_ORPHAN_RETENTION_HOURS);
  const result: DjUploadCleanupResult = {
    uploads_expired: 0,
    chunks_deleted: 0,
    orphan_audios_deleted: 0,
    orphan_videos_deleted: 0,
    temp_renders_deleted: 0,
    errors: [],
  };

  const expired = await StudioDjUploadSession.find({
    status: { $in: ['initiated', 'uploading'] },
    expires_at: { $lt: now },
  });

  for (const upload of expired) {
    upload.status = 'expired';
    upload.expired_at = upload.expired_at ?? now;
    upload.last_activity_at = now;
    await upload.save();
    result.uploads_expired += 1;
  }

  const staleUploads = await StudioDjUploadSession.find({
    status: { $in: ['cancelled', 'failed', 'error', 'expired'] },
    updated_at: { $lt: failedCutoff },
  }).select('workspace_id upload_id');

  for (const upload of staleUploads) {
    try {
      await removeDirIfExists(djUploadDir(upload.workspace_id, upload.upload_id));
      result.chunks_deleted += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Error limpiando ${upload.upload_id}`);
    }
  }

  const activeUploadIds = new Set(
    (await StudioDjUploadSession.find({
      status: { $in: ['initiated', 'uploading'] },
      expires_at: { $gte: now },
    }).select('upload_id').lean()).map((upload) => String(upload.upload_id))
  );

  for (const dir of await listUploadDirs()) {
    try {
      const uploadId = path.basename(dir);
      const stat = await fs.stat(dir);
      if (activeUploadIds.has(uploadId) || stat.mtime >= failedCutoff) continue;
      await removeDirIfExists(dir);
      result.chunks_deleted += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Error limpiando chunks ${dir}`);
    }
  }

  const sessions = await StudioDjSession.find({})
    .select('audio_path cover_image_path visual_video_path visual_image_path video_file_path youtube_id estado')
    .lean();
  const referencedAudio = new Set(sessions.map((session) => session.audio_path).filter(Boolean).map((p) => path.resolve(String(p))));
  const referencedVisual = new Set(sessions.map((session) => session.visual_video_path).filter(Boolean).map((p) => path.resolve(String(p))));
  const referencedVisualImages = new Set([
    ...sessions.map((session) => session.cover_image_path).filter(Boolean).map((p) => path.resolve(String(p))),
    ...sessions.map((session) => session.visual_image_path).filter(Boolean).map((p) => path.resolve(String(p))),
  ]);
  const referencedVideo = new Set(sessions.map((session) => session.video_file_path).filter(Boolean).map((p) => path.resolve(String(p))));

  const audioRoot = path.join(DJ_SESSION_ROOT, 'audio');
  for (const filePath of await walkFiles(audioRoot)) {
    try {
      if (!isPathInside(filePath, audioRoot)) continue;
      if (referencedAudio.has(path.resolve(filePath))) continue;
      const stat = await fs.stat(filePath);
      if (stat.mtime >= orphanCutoff) continue;
      await safeRemoveFile(filePath);
      result.orphan_audios_deleted += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Error borrando audio ${filePath}`);
    }
  }

  const videoRoot = path.join(DJ_SESSION_PUBLIC_ROOT, 'videos');
  for (const filePath of await walkFiles(videoRoot)) {
    try {
      if (!isPathInside(filePath, videoRoot)) continue;
      const stat = await fs.stat(filePath);
      if (stat.mtime >= orphanCutoff) continue;
      const isTempRender = /\.rendering-[^.]+\.mp4$/i.test(path.basename(filePath));
      if (isTempRender) {
        await safeRemoveFile(filePath);
        result.temp_renders_deleted += 1;
        continue;
      }
      if (referencedVideo.has(path.resolve(filePath))) continue;
      await safeRemoveFile(filePath);
      result.orphan_videos_deleted += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Error borrando video ${filePath}`);
    }
  }

  const visualRoot = path.join(DJ_SESSION_ROOT, 'visuals');
  for (const filePath of await walkFiles(visualRoot)) {
    try {
      if (!isPathInside(filePath, visualRoot)) continue;
      const stat = await fs.stat(filePath);
      if (stat.mtime >= orphanCutoff) continue;
      if (referencedVisual.has(path.resolve(filePath)) || referencedVisualImages.has(path.resolve(filePath))) continue;
      await safeRemoveFile(filePath);
      result.orphan_videos_deleted += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Error borrando visual ${filePath}`);
    }
  }

  return result;
}
