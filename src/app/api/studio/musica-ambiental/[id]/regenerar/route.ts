import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { generateBackground } from '@/lib/studio/musica-ambiental-generate';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.workspace_id)
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const video = await StudioMusicaAmbiental.findOne({
      _id: id,
      workspace_id: session.workspace_id,
    });

    if (!video)
      return NextResponse.json({ error: 'Vídeo no encontrado' }, { status: 404 });

    if (!video.musica_path || !video.imagen_path)
      return NextResponse.json({ error: 'Faltan datos para regenerar (imagen o música)' }, { status: 400 });

    await StudioMusicaAmbiental.findByIdAndUpdate(id, {
      $set: { estado: 'generando_video', error_msg: null, video_path: null },
    });

    const imagenAbsPath = path.join(process.cwd(), 'public', video.imagen_path);

    generateBackground(
      id,
      imagenAbsPath,
      video.musica_path,
      video.duracion_horas,
      video.efectos,
      video.texto_overlay
    ).catch(console.error);

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[musica-ambiental/regenerar] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
