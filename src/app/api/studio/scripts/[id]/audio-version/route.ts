import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getStudioSession } from '@/lib/studio/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }

  const { audioVersionId } = (await request.json()) as { audioVersionId?: string };
  if (!audioVersionId) {
    return NextResponse.json({ error: 'audioVersionId es obligatorio' }, { status: 400 });
  }

  await connectDB();
  const { id } = await params;
  const script = await StudioScript.findById(id);
  if (!script || (script.canal_id && script.canal_id !== session.canal_id)) {
    return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
  }

  const versions = script.audio_versions ?? [];
  const selected = versions.find((version) => version.id === audioVersionId);
  if (!selected) {
    return NextResponse.json({ error: 'Versión de audio no encontrada' }, { status: 404 });
  }

  for (const version of versions) version.is_active = version.id === audioVersionId;
  script.audio_versions = versions;
  script.audio_path = selected.path;
  script.audio_engine = selected.engine;
  script.audio_section_durations = selected.section_durations;
  script.audio_status = 'ready';
  script.audio_error = undefined;
  await script.save();

  return NextResponse.json({
    success: true,
    audioPath: selected.path,
    engine: selected.engine,
    audioVersion: selected,
  });
}
