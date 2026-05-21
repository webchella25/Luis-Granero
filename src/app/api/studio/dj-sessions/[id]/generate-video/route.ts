import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { generateDjSessionVideo } from '@/lib/studio/dj-session-video';
import StudioCanal from '@/models/StudioCanal';
import StudioDjSession from '@/models/StudioDjSession';

interface Params { params: Promise<{ id: string }> }

const RENDER_LOCK_HOURS = Number.parseInt(process.env.DJ_SESSION_RENDER_LOCK_HOURS ?? '', 10) || 6;

async function generateInBackground(id: string, jobId: string, canalNombre?: string): Promise<void> {
  let lastPersistedProgress = 20;
  let lastProgressWrite = 0;

  try {
    await connectDB();
    const djSession = await StudioDjSession.findById(id);
    if (!djSession) throw new Error('Sesión no encontrada');
    if (!djSession.audio_path) throw new Error('La sesión no tiene audio');

    const generated = await generateDjSessionVideo({
      session: djSession,
      canalNombre,
      jobId,
      onPid: async (pid) => {
        await connectDB();
        await StudioDjSession.findOneAndUpdate(
          { _id: id, render_job_id: jobId },
          { $set: { render_pid: pid } }
        );
      },
      onProgress: async (seconds) => {
        const duration = djSession.audio_duration || 0;
        if (!duration) return;
        const progress = Math.min(95, Math.max(20, Math.round((seconds / duration) * 75) + 20));
        const now = Date.now();
        if (progress < lastPersistedProgress + 2 && now - lastProgressWrite < 3000) return;
        lastPersistedProgress = progress;
        lastProgressWrite = now;
        await connectDB();
        await StudioDjSession.findOneAndUpdate(
          { _id: id, render_job_id: jobId },
          { $set: { progreso: progress } }
        );
      },
    });

    await connectDB();
    const finishedAt = new Date();
    await StudioDjSession.findOneAndUpdate({ _id: id, render_job_id: jobId }, {
      $set: {
        video_path: generated.videoPath,
        video_file_path: generated.videoFilePath,
        video_size: generated.videoSize,
        video_duration: generated.videoDuration,
        video_generated_at: finishedAt,
        estado: 'video_ready',
        progreso: 100,
        error: null,
        render_error: null,
        render_finished_at: finishedAt,
        render_locked_until: null,
        render_pid: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generando vídeo';
    console.error('[dj-sessions/generate-video] Error:', message);
    await connectDB();
    const failedAt = new Date();
    await StudioDjSession.findOneAndUpdate({ _id: id, render_job_id: jobId }, {
      $set: {
        estado: 'render_failed',
        progreso: 0,
        error: message.slice(0, 1000),
        render_error: message.slice(0, 1000),
        render_finished_at: failedAt,
        render_locked_until: null,
        render_pid: null,
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

    const body = request.headers.get('content-type')?.includes('application/json')
      ? ((await request.json().catch(() => ({}))) as { regenerate?: boolean })
      : {};
    const djSession = await StudioDjSession.findOne({
      _id: id,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    if (!djSession.audio_path) return NextResponse.json({ error: 'La sesión no tiene audio' }, { status: 400 });
    if (djSession.video_file_path && body.regenerate !== true) {
      return NextResponse.json({ error: 'La sesión ya tiene vídeo generado. Usa regenerar vídeo para reemplazarlo.' }, { status: 409 });
    }
    if (djSession.render_locked_until && djSession.render_locked_until.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Ya hay una generación de vídeo en curso para esta sesión' }, { status: 409 });
    }

    const canal = await StudioCanal.findOne({
      _id: session.canal_id,
      workspace_id: session.workspace_id,
    }).select('nombre').lean();

    const jobId = randomUUID();
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + RENDER_LOCK_HOURS * 60 * 60 * 1000);
    const locked = await StudioDjSession.findOneAndUpdate(
      {
        _id: id,
        workspace_id: session.workspace_id,
        canal_id: session.canal_id,
        $or: [
          { render_locked_until: null },
          { render_locked_until: { $exists: false } },
          { render_locked_until: { $lte: now } },
        ],
      },
      {
        $set: {
          estado: 'generating_video',
          progreso: 20,
          error: null,
          render_error: null,
          render_job_id: jobId,
          render_pid: null,
          render_started_at: now,
          render_finished_at: null,
          render_locked_until: lockedUntil,
        },
      },
      { new: true }
    );

    if (!locked) {
      return NextResponse.json({ error: 'Ya hay una generación de vídeo en curso para esta sesión' }, { status: 409 });
    }

    generateInBackground(id, jobId, canal?.nombre).catch(console.error);

    return NextResponse.json({ status: 'processing', render_job_id: jobId, render_locked_until: lockedUntil });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[dj-sessions/generate-video] Error iniciando:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
