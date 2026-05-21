import fs from 'fs/promises';
import { statSync } from 'fs';
import { getValidAccessTokenForCanal } from '@/lib/studio/youtube-auth';
import type { IStudioDjSession } from '@/models/StudioDjSession';

export interface PublishedDjSession {
  youtube_id: string;
  youtube_url: string;
  bytes_sent: number;
  total_bytes: number;
}

export interface PublishDjSessionOptions {
  uploadUrl?: string | null;
  chunkSize?: number;
  onUploadUrl?: (uploadUrl: string) => void | Promise<void>;
  onProgress?: (bytesSent: number, totalBytes: number) => void | Promise<void>;
}

class YoutubeUploadUrlExpiredError extends Error {
  constructor(message = 'La URL de upload resumable de YouTube ha caducado') {
    super(message);
    this.name = 'YoutubeUploadUrlExpiredError';
  }
}

const DEFAULT_YOUTUBE_CHUNK_SIZE =
  Number.parseInt(process.env.DJ_YOUTUBE_UPLOAD_CHUNK_BYTES ?? '', 10) || 16 * 1024 * 1024;

function removeProblematicUnicode(text: string): string {
  return text.replace(/[\uD800-\uDFFF]/g, '').replace(/[\u2600-\u27BF]/g, '');
}

function sanitizeTitle(title: string): string {
  return title
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\uFEFF/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function sanitizeTags(tags: string[]): string[] {
  const cleaned: string[] = [];
  let totalChars = 0;
  for (const raw of tags) {
    const tag = raw
      .normalize('NFC')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2018\u2019\u201A\u201B]/g, '')
      .replace(/[\u201C\u201D\u201E\u201F]/g, '')
      .replace(/[\u2013-\u2015]/g, '-')
      .replace(/[^\x00-\xFF]/g, '')
      .replace(/[<>#"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
    if (!tag) continue;
    if (totalChars + tag.length + (cleaned.length > 0 ? 1 : 0) > 500) break;
    totalChars += tag.length + (cleaned.length > 0 ? 1 : 0);
    cleaned.push(tag);
  }
  return cleaned;
}

function buildDescription(session: IStudioDjSession): string {
  const parts = [
    session.descripcion?.trim(),
    session.genre ? `Genero: ${session.genre}` : '',
    session.bpm ? `BPM: ${session.bpm}` : '',
    session.tracklist ? `Tracklist:\n${session.tracklist}` : '',
    'Sesion publicada automaticamente desde Studio.',
  ].filter(Boolean);

  return removeProblematicUnicode(parts.join('\n\n')).slice(0, 5000);
}

function buildTags(session: IStudioDjSession): string[] {
  return sanitizeTags([
    ...(session.tags ?? []),
    'DJ',
    'DJ Set',
    'Live Session',
    'Mix',
    'Music',
  ]);
}

async function initiateResumableUpload(
  accessToken: string,
  session: IStudioDjSession,
  fileSize: number,
  tags: string[]
): Promise<string> {
  const status: Record<string, unknown> = { selfDeclaredMadeForKids: false };
  if (session.scheduled_at) {
    status.privacyStatus = 'private';
    status.publishAt = session.scheduled_at.toISOString();
  } else {
    status.privacyStatus = session.visibility || 'unlisted';
  }

  const requestBody = {
    snippet: {
      title: sanitizeTitle(session.titulo),
      description: buildDescription(session),
      tags,
      categoryId: '10',
      defaultLanguage: 'es',
      defaultAudioLanguage: 'es',
    },
    status,
  };

  const res = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(fileSize),
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error iniciando upload YouTube: ${res.status} ${errorText.slice(0, 800)}`);
  }

  const uploadUri = res.headers.get('location');
  if (!uploadUri) throw new Error('YouTube no devolvio URI de upload resumable');
  return uploadUri;
}

function parseConfirmedOffset(rangeHeader: string | null): number {
  if (!rangeHeader) return 0;
  const match = rangeHeader.match(/bytes=0-(\d+)/);
  if (!match) return 0;
  const end = Number(match[1]);
  return Number.isFinite(end) ? end + 1 : 0;
}

async function queryYoutubeUploadOffset(
  uploadUri: string,
  accessToken: string,
  fileSize: number
): Promise<{ offset: number; youtubeId?: string }> {
  const res = await fetch(uploadUri, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Length': '0',
      'Content-Range': `bytes */${fileSize}`,
    },
  });

  if (res.status === 308) {
    return { offset: parseConfirmedOffset(res.headers.get('range')) };
  }
  if (res.status === 200 || res.status === 201) {
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    if (!data.id) throw new Error('YouTube completó el upload pero no devolvió ID de vídeo');
    return { offset: fileSize, youtubeId: data.id };
  }
  if (res.status === 404 || res.status === 410) {
    throw new YoutubeUploadUrlExpiredError();
  }
  if (res.status === 401 || res.status === 403) {
    const text = await res.text();
    throw new Error(`Error de permisos OAuth en YouTube: ${res.status} ${text.slice(0, 500)}`);
  }

  const errorText = await res.text();
  throw new Error(`Error consultando progreso YouTube: ${res.status} ${errorText.slice(0, 800)}`);
}

async function uploadYoutubeChunk(
  uploadUri: string,
  accessToken: string,
  chunk: Buffer,
  start: number,
  end: number,
  fileSize: number
): Promise<{ offset: number; youtubeId?: string }> {
  const body = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer;
  const res = await fetch(uploadUri, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'video/mp4',
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    },
    body,
  });

  if (res.status === 308) {
    return { offset: parseConfirmedOffset(res.headers.get('range')) || end + 1 };
  }
  if (res.status === 200 || res.status === 201) {
    const data = (await res.json()) as { id?: string };
    if (!data.id) throw new Error('YouTube no devolvio el ID del video');
    return { offset: fileSize, youtubeId: data.id };
  }
  if (res.status === 404 || res.status === 410) {
    throw new YoutubeUploadUrlExpiredError();
  }
  if (res.status === 401 || res.status === 403) {
    const errorText = await res.text();
    throw new Error(`Error de permisos OAuth en YouTube: ${res.status} ${errorText.slice(0, 500)}`);
  }

  const errorText = await res.text();
  throw new Error(`Error subiendo chunk a YouTube: ${res.status} ${errorText.slice(0, 800)}`);
}

async function uploadVideoInChunks(
  uploadUri: string,
  accessToken: string,
  videoPath: string,
  fileSize: number,
  options: Required<Pick<PublishDjSessionOptions, 'chunkSize'>> & Pick<PublishDjSessionOptions, 'onProgress'>
): Promise<string> {
  let offset = 0;
  const existing = await queryYoutubeUploadOffset(uploadUri, accessToken, fileSize);
  if (existing.youtubeId) return existing.youtubeId;
  offset = existing.offset;
  if (options.onProgress) await options.onProgress(offset, fileSize);

  const handle = await fs.open(videoPath, 'r');
  try {
    while (offset < fileSize) {
      const end = Math.min(offset + options.chunkSize, fileSize) - 1;
      const length = end - offset + 1;
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, offset);
      const result = await uploadYoutubeChunk(uploadUri, accessToken, buffer, offset, end, fileSize);
      offset = Math.max(result.offset, end + 1);
      if (options.onProgress) await options.onProgress(offset, fileSize);
      if (result.youtubeId) return result.youtubeId;
    }
  } finally {
    await handle.close();
  }

  const completed = await queryYoutubeUploadOffset(uploadUri, accessToken, fileSize);
  if (!completed.youtubeId) throw new Error('YouTube no devolvio el ID del video al finalizar');
  return completed.youtubeId;
}

export async function publishDjSessionToYouTube(
  session: IStudioDjSession,
  options: PublishDjSessionOptions = {}
): Promise<PublishedDjSession> {
  if (!session.video_file_path) throw new Error('La sesion no tiene video generado');

  let fileSize: number;
  try {
    fileSize = statSync(session.video_file_path).size;
  } catch {
    throw new Error('Archivo MP4 no encontrado en disco');
  }

  let accessToken: string;
  try {
    accessToken = await getValidAccessTokenForCanal(session.canal_id);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('YouTube no está conectado')) {
      throw new Error('Este canal no tiene YouTube conectado');
    }
    throw error;
  }

  const tags = buildTags(session);
  let uploadUri = options.uploadUrl ?? '';

  async function createUploadUri() {
    try {
      return await initiateResumableUpload(accessToken, session, fileSize, tags);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('invalidTags')) {
        return await initiateResumableUpload(accessToken, session, fileSize, []);
      }
      throw error;
    }
  }

  if (!uploadUri) {
    uploadUri = await createUploadUri();
    if (options.onUploadUrl) await options.onUploadUrl(uploadUri);
  }

  let youtubeId: string;
  try {
    youtubeId = await uploadVideoInChunks(uploadUri, accessToken, session.video_file_path, fileSize, {
      chunkSize: options.chunkSize ?? DEFAULT_YOUTUBE_CHUNK_SIZE,
      onProgress: options.onProgress,
    });
  } catch (error) {
    if (!(error instanceof YoutubeUploadUrlExpiredError)) throw error;
    uploadUri = await createUploadUri();
    if (options.onUploadUrl) await options.onUploadUrl(uploadUri);
    if (options.onProgress) await options.onProgress(0, fileSize);
    youtubeId = await uploadVideoInChunks(uploadUri, accessToken, session.video_file_path, fileSize, {
      chunkSize: options.chunkSize ?? DEFAULT_YOUTUBE_CHUNK_SIZE,
      onProgress: options.onProgress,
    });
  }

  return {
    youtube_id: youtubeId,
    youtube_url: `https://www.youtube.com/watch?v=${youtubeId}`,
    bytes_sent: fileSize,
    total_bytes: fileSize,
  };
}
