import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const video = await StudioMusicaAmbiental.findOne({
    _id: id,
    workspace_id: session.workspace_id,
  }).lean();

  if (!video) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ video: { ...video, _id: video._id.toString() } });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;

  const update: Record<string, unknown> = {};
  if (body.youtube_id !== undefined) update['youtube_id'] = body.youtube_id;
  if (body.youtube_url !== undefined) update['youtube_url'] = body.youtube_url;
  if (body.estado !== undefined) update['estado'] = body.estado;
  if (body.error_msg !== undefined) update['error_msg'] = body.error_msg;
  if (body.scheduled_at !== undefined) update['scheduled_at'] = body.scheduled_at;

  await connectDB();
  const video = await StudioMusicaAmbiental.findOneAndUpdate(
    { _id: id, workspace_id: session.workspace_id },
    { $set: update },
    { new: true }
  ).lean();

  if (!video) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ success: true, video: { ...video, _id: video._id.toString() } });
}
