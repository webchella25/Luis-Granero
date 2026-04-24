import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const canales = await StudioCanal.find({ workspace_id: session.workspace_id })
    .select('_id nombre nicho descripcion pipeline_tipo youtube_tokens creado_en')
    .lean();

  const result = canales.map((c) => ({
    _id: c._id.toString(),
    nombre: c.nombre,
    nicho: c.nicho,
    descripcion: c.descripcion,
    pipeline_tipo: c.pipeline_tipo ?? 'narrativo',
    youtube_conectado: !!c.youtube_tokens,
    creado_en: c.creado_en,
  }));

  return NextResponse.json({ canales: result });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = (await request.json()) as {
    nombre?: string;
    nicho?: string;
    descripcion?: string;
    tono?: string;
    system_prompt_guion?: string;
    idioma?: string;
    pipeline_tipo?: 'narrativo' | 'musica_ambiental';
  };

  if (!body.nombre?.trim()) {
    return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
  }

  await connectDB();
  const canal = await StudioCanal.create({
    workspace_id: session.workspace_id,
    nombre: body.nombre.trim(),
    nicho: body.nicho?.trim() ?? '',
    descripcion: body.descripcion?.trim() ?? '',
    pipeline_tipo: body.pipeline_tipo ?? 'narrativo',
    youtube_tokens: null,
    config: {
      voz_motor: 'elevenlabs',
      voz_id: '',
      imagen_motor: 'freepik',
      system_prompt_guion: body.system_prompt_guion?.trim() ?? '',
      tono: body.tono?.trim() ?? '',
      idioma: body.idioma?.trim() ?? 'es-ES',
    },
  });

  return NextResponse.json({ success: true, canal_id: canal._id.toString() }, { status: 201 });
}
