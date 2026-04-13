import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
  const { canal_id } = session;
  try {
    await connectDB();
    const scripts = await StudioScript.find({ canal_id })
      .select('personaje epoca tono duracion audio_path audio_engine images_paths video_path video_status youtube_id youtube_url youtube_status creado_en')
      .sort({ creado_en: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error('Error listando guiones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
