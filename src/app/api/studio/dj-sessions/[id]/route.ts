import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { removeFileIfExists } from '@/lib/studio/dj-session-files';
import { sanitizeVisualMode } from '@/lib/studio/dj-session-visuals';
import StudioDjSession from '@/models/StudioDjSession';
import type { DjSessionOutputFormat } from '@/models/StudioDjSession';

interface Params { params: Promise<{ id: string }> }

function publicDjSession(item: Record<string, unknown>) {
  const {
    video_file_path: _videoFilePath,
    youtube_upload_url: _youtubeUploadUrl,
    cover_image_path: _coverImagePath,
    visual_video_path: _visualVideoPath,
    visual_image_path: _visualImagePath,
    ...safe
  } = item;
  void _videoFilePath;
  void _youtubeUploadUrl;
  void _coverImagePath;
  void _visualVideoPath;
  void _visualImagePath;
  return { ...safe, cover_image_uploaded: Boolean(item.cover_image_path) };
}

function sanitizeOutputFormat(value: unknown): DjSessionOutputFormat {
  return value === '9:16' || value === '1:1' || value === '16:9' ? value : '16:9';
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { id } = await params;
  await connectDB();
  const djSession = await StudioDjSession.findOne({
    _id: id,
    workspace_id: session.workspace_id,
    canal_id: session.canal_id,
  }).lean();

  if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
  return NextResponse.json({ session: publicDjSession({ ...djSession, _id: djSession._id.toString() }) });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if (body.titulo !== undefined) update.titulo = body.titulo;
  if (body.descripcion !== undefined) update.descripcion = body.descripcion;
  if (body.tracklist !== undefined) update.tracklist = body.tracklist;
  if (body.bpm !== undefined) update.bpm = body.bpm;
  if (body.genre !== undefined) update.genre = body.genre;
  if (body.output_format !== undefined) update.output_format = sanitizeOutputFormat(body.output_format);
  if (body.render_overlays !== undefined) update.render_overlays = body.render_overlays === true;
  if (body.tags !== undefined) update.tags = body.tags;
  if (body.visibility !== undefined) update.visibility = body.visibility;
  if (body.scheduled_at !== undefined) update.scheduled_at = body.scheduled_at;
  if (body.visual_mode !== undefined) update.visual_mode = sanitizeVisualMode(body.visual_mode);

  await connectDB();
  const djSession = await StudioDjSession.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id, canal_id: session.canal_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
  return NextResponse.json({ success: true, session: publicDjSession({ ...djSession, _id: djSession._id.toString() }) });
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { id } = await params;
  await connectDB();
  const djSession = await StudioDjSession.findOne({
    _id: id,
    workspace_id: session.workspace_id,
    canal_id: session.canal_id,
  });

  if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });

  await removeFileIfExists(djSession.audio_path);
  await removeFileIfExists(djSession.cover_image_path);
  await removeFileIfExists(djSession.logo_path);
  await removeFileIfExists(djSession.visual_video_path);
  await removeFileIfExists(djSession.visual_image_path);
  await removeFileIfExists(djSession.video_file_path);
  await djSession.deleteOne();

  return NextResponse.json({ success: true });
}
