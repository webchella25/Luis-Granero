import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import {
  djAudioDir,
  djChunkPath,
  djUploadDir,
  ensureDir,
  getAudioDurationSeconds,
  removeDirIfExists,
} from '@/lib/studio/dj-session-files';
import StudioDjSession from '@/models/StudioDjSession';
import StudioDjUploadSession from '@/models/StudioDjUploadSession';

export const runtime = 'nodejs';

interface Params { params: Promise<{ uploadId: string }> }

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { uploadId } = await params;
    await connectDB();
    const upload = await StudioDjUploadSession.findOne({
      upload_id: uploadId,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!upload) return NextResponse.json({ error: 'Upload no encontrado' }, { status: 404 });
    if (upload.status === 'completed' && upload.final_session_id) {
      return NextResponse.json({ status: 'completed', session_id: upload.final_session_id });
    }
    if (upload.status === 'cancelled') return NextResponse.json({ error: 'Upload cancelado' }, { status: 409 });
    if (upload.status === 'failed' || upload.status === 'error') return NextResponse.json({ error: upload.error ?? 'Upload fallido' }, { status: 409 });
    if (upload.status === 'expired' || upload.expires_at.getTime() < Date.now()) {
      upload.status = 'expired';
      upload.expired_at = upload.expired_at ?? new Date();
      upload.last_activity_at = upload.expired_at;
      await upload.save();
      return NextResponse.json({ error: 'Upload expirado' }, { status: 410 });
    }

    const missing: number[] = [];
    let totalBytes = 0;
    for (let index = 0; index < upload.total_chunks; index++) {
      try {
        const stat = await fs.stat(djChunkPath(session.workspace_id, upload.upload_id, index));
        totalBytes += stat.size;
      } catch {
        missing.push(index);
      }
    }
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Faltan chunks', missing_chunks: missing }, { status: 409 });
    }
    if (totalBytes !== upload.file_size) {
      upload.status = 'failed';
      upload.error = `Tamaño final inválido: ${totalBytes} != ${upload.file_size}`;
      upload.failed_at = new Date();
      upload.last_activity_at = upload.failed_at;
      await upload.save();
      return NextResponse.json({ error: upload.error }, { status: 400 });
    }

    const audioDir = djAudioDir(session.canal_id);
    await ensureDir(audioDir);
    const audioPath = path.join(audioDir, `${Date.now()}_${upload.filename}`);
    await fs.writeFile(audioPath, Buffer.alloc(0));
    for (let index = 0; index < upload.total_chunks; index++) {
      const chunkBuffer = await fs.readFile(djChunkPath(session.workspace_id, upload.upload_id, index));
      await fs.appendFile(audioPath, chunkBuffer);
    }

    const duration = await getAudioDurationSeconds(audioPath);
    const doc = await StudioDjSession.create({
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
      titulo: upload.titulo,
      descripcion: upload.descripcion,
      audio_path: audioPath,
      audio_original_name: upload.filename,
      audio_mime_type: upload.mime_type,
      audio_size: upload.file_size,
      audio_duration: duration,
      estado: 'audio_subido',
      progreso: 10,
      tracklist: upload.tracklist,
      bpm: upload.bpm,
      genre: upload.genre,
      output_format: upload.output_format,
      tags: upload.tags,
      visibility: upload.visibility,
      scheduled_at: upload.scheduled_at,
    });

    upload.status = 'completed';
    upload.received_chunks = Array.from({ length: upload.total_chunks }, (_, index) => index);
    upload.received_bytes = upload.file_size;
    upload.final_session_id = doc._id.toString();
    upload.error = null;
    upload.completed_at = new Date();
    upload.last_activity_at = upload.completed_at;
    await upload.save();

    await removeDirIfExists(djUploadDir(session.workspace_id, upload.upload_id));

    return NextResponse.json({
      success: true,
      session: { ...doc.toObject(), _id: doc._id.toString() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error completando upload';
    console.error('[dj-upload/complete] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
