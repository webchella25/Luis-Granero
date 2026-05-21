import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import {
  DJ_DEFAULT_CHUNK_SIZE,
  DJ_MAX_AUDIO_BYTES,
  djUploadDir,
  ensureDir,
  isAllowedDjAudioMetadata,
  sanitizeFilename,
} from '@/lib/studio/dj-session-files';
import StudioDjUploadSession from '@/models/StudioDjUploadSession';
import type { DjSessionOutputFormat, DjSessionVisibility } from '@/models/StudioDjSession';

export const runtime = 'nodejs';

const UPLOAD_TTL_HOURS =
  Number.parseInt(process.env.DJ_UPLOAD_EXPIRES_HOURS ?? process.env.DJ_SESSION_UPLOAD_TTL_HOURS ?? '', 10) ||
  24;

function parseTags(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 30);
}

function parseVisibility(value: unknown): DjSessionVisibility {
  return value === 'public' || value === 'private' || value === 'unlisted' ? value : 'unlisted';
}

function parseOutputFormat(value: unknown): DjSessionOutputFormat {
  return value === '9:16' || value === '1:1' || value === '16:9' ? value : '16:9';
}

function parseBpm(value: unknown): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const bpm = Number(raw);
  return Number.isFinite(bpm) && bpm > 0 ? bpm : null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const filename = String(body.filename ?? '').trim();
    const mimeType = String(body.mimeType ?? '').trim() || 'application/octet-stream';
    const fileSize = Number(body.fileSize);
    const chunkSize = Number(body.chunkSize) || DJ_DEFAULT_CHUNK_SIZE;
    const titulo = String(body.titulo ?? '').trim();

    if (!titulo) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
    if (!filename) return NextResponse.json({ error: 'filename es obligatorio' }, { status: 400 });
    if (!Number.isFinite(fileSize) || fileSize <= 0) return NextResponse.json({ error: 'fileSize inválido' }, { status: 400 });
    if (fileSize > DJ_MAX_AUDIO_BYTES) return NextResponse.json({ error: 'El archivo supera el tamaño máximo permitido' }, { status: 413 });
    if (!Number.isFinite(chunkSize) || chunkSize <= 0 || chunkSize > 32 * 1024 * 1024) {
      return NextResponse.json({ error: 'chunkSize inválido' }, { status: 400 });
    }
    if (!isAllowedDjAudioMetadata(filename, mimeType)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa MP3, WAV, FLAC o M4A.' }, { status: 400 });
    }

    const uploadId = randomUUID();
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + UPLOAD_TTL_HOURS * 60 * 60 * 1000);
    await ensureDir(djUploadDir(session.workspace_id, uploadId));

    await connectDB();
    const upload = await StudioDjUploadSession.create({
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
      upload_id: uploadId,
      filename: sanitizeFilename(filename),
      mime_type: mimeType,
      file_size: fileSize,
      chunk_size: chunkSize,
      total_chunks: totalChunks,
      expires_at: expiresAt,
      last_activity_at: now,
      titulo,
      descripcion: String(body.descripcion ?? '').trim(),
      genre: String(body.genre ?? '').trim(),
      output_format: parseOutputFormat(body.output_format),
      bpm: parseBpm(body.bpm),
      tags: parseTags(body.tags),
      tracklist: String(body.tracklist ?? '').trim(),
      visibility: parseVisibility(body.visibility),
      scheduled_at: body.scheduled_at ? new Date(String(body.scheduled_at)) : null,
    });

    return NextResponse.json({
      upload_id: upload.upload_id,
      total_chunks: upload.total_chunks,
      chunk_size: upload.chunk_size,
      received_chunks: upload.received_chunks,
      status: upload.status,
      expires_at: upload.expires_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error iniciando upload';
    console.error('[dj-upload/start] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
