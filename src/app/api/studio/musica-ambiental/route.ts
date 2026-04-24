import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  await connectDB();
  const videos = await StudioMusicaAmbiental.find({
    canal_id: session.canal_id,
    workspace_id: session.workspace_id,
  })
    .sort({ creado_en: -1 })
    .lean();

  return NextResponse.json({
    videos: videos.map((v) => ({ ...v, _id: v._id.toString() })),
  });
}
