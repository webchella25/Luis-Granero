import { randomUUID } from 'crypto';
import { statSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { publishDjSessionToYouTube } from '@/lib/studio/dj-session-youtube';
import StudioDjSession from '@/models/StudioDjSession';

interface Params { params: Promise<{ id: string }> }

const YOUTUBE_UPLOAD_LOCK_HOURS = Number.parseInt(process.env.DJ_YOUTUBE_UPLOAD_LOCK_HOURS ?? '', 10) || 12;

async function publishInBackground(id: string, jobId: string): Promise<void> {
  let lastPersistedProgress = 25;
  let lastProgressWrite = 0;

  try {
    await connectDB();
    const djSession = await StudioDjSession.findById(id);
    if (!djSession) throw new Error('Sesión no encontrada');

    const result = await publishDjSessionToYouTube(djSession, {
      uploadUrl: djSession.youtube_upload_url,
      onUploadUrl: async (uploadUrl) => {
        await connectDB();
        await StudioDjSession.findOneAndUpdate(
          { _id: id, youtube_upload_job_id: jobId },
          { $set: { youtube_upload_url: uploadUrl } }
        );
      },
      onProgress: async (bytesSent, totalBytes) => {
        const progress = totalBytes > 0
          ? Math.min(95, Math.max(25, Math.round((bytesSent / totalBytes) * 70) + 25))
          : 25;
        const now = Date.now();
        if (progress < lastPersistedProgress + 2 && now - lastProgressWrite < 3000) return;
        lastPersistedProgress = progress;
        lastProgressWrite = now;
        await connectDB();
        await StudioDjSession.findOneAndUpdate(
          { _id: id, youtube_upload_job_id: jobId },
          {
            $set: {
              progreso: progress,
              youtube_upload_bytes_sent: bytesSent,
              youtube_upload_total_bytes: totalBytes,
            },
          }
        );
      },
    });

    await connectDB();
    const finishedAt = new Date();
    await StudioDjSession.findOneAndUpdate({ _id: id, youtube_upload_job_id: jobId }, {
      $set: {
        youtube_id: result.youtube_id,
        youtube_url: result.youtube_url,
        estado: 'published',
        progreso: 100,
        error: null,
        youtube_upload_error: null,
        youtube_upload_bytes_sent: result.bytes_sent,
        youtube_upload_total_bytes: result.total_bytes,
        youtube_upload_finished_at: finishedAt,
        youtube_uploaded_at: finishedAt,
        youtube_upload_locked_until: null,
        youtube_upload_url: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error publicando en YouTube';
    console.error('[dj-sessions/publish-youtube] Error:', message);
    await connectDB();
    const finishedAt = new Date();
    await StudioDjSession.findOneAndUpdate({ _id: id, youtube_upload_job_id: jobId }, {
      $set: {
        estado: 'youtube_failed',
        error: message.slice(0, 1000),
        youtube_upload_error: message.slice(0, 1000),
        youtube_upload_finished_at: finishedAt,
        youtube_upload_locked_until: null,
      },
    });
  }
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { id } = await params;
    await connectDB();

    const djSession = await StudioDjSession.findOne({
      _id: id,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });

    if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    if (djSession.youtube_id) {
      return NextResponse.json({ status: 'already_published', youtube_url: djSession.youtube_url });
    }
    if (!['video_ready', 'listo', 'youtube_failed'].includes(djSession.estado)) {
      return NextResponse.json({ error: 'La sesión debe tener el vídeo generado antes de publicar' }, { status: 400 });
    }
    if (!djSession.video_file_path) {
      return NextResponse.json({ error: 'La sesión no tiene archivo MP4 generado' }, { status: 400 });
    }
    let videoSize = 0;
    try {
      videoSize = statSync(djSession.video_file_path).size;
    } catch {
      return NextResponse.json({ error: 'Archivo MP4 no encontrado en disco' }, { status: 400 });
    }
    if (djSession.youtube_upload_locked_until && djSession.youtube_upload_locked_until.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Ya hay una publicación en YouTube en curso para esta sesión' }, { status: 409 });
    }

    const jobId = randomUUID();
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + YOUTUBE_UPLOAD_LOCK_HOURS * 60 * 60 * 1000);
    const locked = await StudioDjSession.findOneAndUpdate(
      {
        _id: id,
        workspace_id: session.workspace_id,
        canal_id: session.canal_id,
        youtube_id: null,
        $or: [
          { youtube_upload_locked_until: null },
          { youtube_upload_locked_until: { $exists: false } },
          { youtube_upload_locked_until: { $lte: now } },
        ],
      },
      {
        $set: {
          estado: 'publishing_youtube',
          progreso: 25,
          error: null,
          youtube_upload_error: null,
          youtube_upload_job_id: jobId,
          youtube_upload_started_at: now,
          youtube_upload_finished_at: null,
          youtube_upload_locked_until: lockedUntil,
          youtube_upload_total_bytes: videoSize,
        },
        $inc: { youtube_upload_attempts: 1 },
      },
      { new: true }
    );

    if (!locked) {
      return NextResponse.json({ error: 'Ya hay una publicación en YouTube en curso para esta sesión' }, { status: 409 });
    }

    publishInBackground(id, jobId).catch(console.error);

    return NextResponse.json({ status: 'processing', youtube_upload_job_id: jobId, youtube_upload_locked_until: lockedUntil });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[dj-sessions/publish-youtube] Error iniciando:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
