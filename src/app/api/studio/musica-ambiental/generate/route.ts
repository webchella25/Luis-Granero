import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { mkdirSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { generateBackground } from '@/lib/studio/musica-ambiental-generate';
import type { TextoOverlay } from '@/models/StudioMusicaAmbiental';

interface GenerateBody {
  mood: string;
  prompt_flux: string;
  imagen_path: string;
  musica_base64?: string;
  musica_nombre?: string;
  musica_track_path?: string;
  musica_url?: string;
  duracion_horas: number;
  efectos: string[];
  titulo: string;
  descripcion: string;
  texto_overlay: TextoOverlay | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id)
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const body = (await request.json()) as GenerateBody;

    if (!body.imagen_path)
      return NextResponse.json({ error: 'imagen_path es obligatorio' }, { status: 400 });
    if (!body.musica_base64 && !body.musica_track_path && !body.musica_url) {
      return NextResponse.json(
        { error: 'Se requiere archivo de música, track de biblioteca o URL de audio' },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await StudioMusicaAmbiental.create({
      canal_id: session.canal_id,
      workspace_id: session.workspace_id,
      mood: body.mood,
      prompt_flux: body.prompt_flux,
      imagen_path: body.imagen_path,
      musica_nombre: body.musica_nombre ?? 'track',
      duracion_horas: body.duracion_horas,
      efectos: body.efectos,
      titulo: body.titulo,
      descripcion: body.descripcion,
      texto_overlay: body.texto_overlay,
      estado: 'generando_video',
    });

    const videoId = doc._id.toString();
    const imagenAbsPath = path.join(process.cwd(), 'public', body.imagen_path);

    let musicaAbsPath: string;
    if (body.musica_track_path) {
      musicaAbsPath = body.musica_track_path;
    } else {
      const musicaDir = path.join(
        process.cwd(),
        'public',
        'studio',
        'musica-ambiental',
        'musica'
      );
      mkdirSync(musicaDir, { recursive: true });
      const ext = body.musica_nombre?.split('.').pop() ?? 'mp3';
      const musicaFilename = `${videoId}-musica.${ext}`;
      musicaAbsPath = path.join(musicaDir, musicaFilename);
      let buffer: Buffer;
      if (body.musica_url) {
        const audioRes = await fetch(body.musica_url);
        if (!audioRes.ok) throw new Error('No se pudo descargar el audio generado');
        buffer = Buffer.from(await audioRes.arrayBuffer());
      } else {
        buffer = Buffer.from(body.musica_base64!, 'base64');
      }
      await fs.writeFile(musicaAbsPath, buffer);
    }

    await StudioMusicaAmbiental.findByIdAndUpdate(videoId, {
      $set: { musica_path: musicaAbsPath },
    });

    generateBackground(
      videoId,
      imagenAbsPath,
      musicaAbsPath,
      body.duracion_horas,
      body.efectos,
      body.texto_overlay
    ).catch(console.error);

    return NextResponse.json({ status: 'processing', video_id: videoId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[musica-ambiental/generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
