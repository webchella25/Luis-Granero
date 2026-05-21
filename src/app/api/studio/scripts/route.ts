import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getStudioSession } from '@/lib/studio/session';
import { localVideoExists } from '@/lib/studio/uploaded-local-video-cleanup';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
  const { canal_id } = session;
  try {
    await connectDB();
    const scripts = await StudioScript.find({ canal_id })
      .select(
        'personaje epoca tono duracion audio_path audio_engine audio_versions audio_status audio_error audio_section_durations images_paths images_status images_error video_path video_status video_progress video_stage video_error youtube_id youtube_url youtube_status youtube_scheduled_at shorts short_path thumbnail_path thumbnail_status thumbnail_error creado_en'
      )
      .sort({ creado_en: -1 })
      .limit(100)
      .lean();

    const scriptsWithLocalState = await Promise.all(
      scripts.map(async (script) => ({
        ...script,
        video_file_exists: await localVideoExists('video', script.video_path),
        shorts: await Promise.all(
          (script.shorts ?? []).map(async (short) => ({
            ...short,
            local_file_exists: await localVideoExists('short', short.path),
          }))
        ),
      }))
    );

    return NextResponse.json({ scripts: scriptsWithLocalState });
  } catch (error) {
    console.error('Error listando guiones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
