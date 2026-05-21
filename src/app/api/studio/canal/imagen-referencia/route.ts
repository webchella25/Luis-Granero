import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioCanal from '@/models/StudioCanal';
import { getStudioSession } from '@/lib/studio/session';

const ALLOWED_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const canal = await StudioCanal.findOne({ _id: session.canal_id, workspace_id: session.workspace_id });
  if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get('imagen') as File | null;
  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 });

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato no válido. Usa PNG, JPG o WebP.' }, { status: 400 });

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'El archivo no puede superar 10MB.' }, { status: 400 });
  }

  const dir = path.join(process.cwd(), 'public', 'studio', 'canales', session.canal_id);
  await mkdir(dir, { recursive: true });

  const filename = `referencia.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  const imagen_referencia_url = `/studio/canales/${session.canal_id}/${filename}`;
  canal.config.imagen_referencia_url = imagen_referencia_url;
  await canal.save();

  return NextResponse.json({ success: true, imagen_referencia_url });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  await StudioCanal.findOneAndUpdate(
    { _id: session.canal_id, workspace_id: session.workspace_id },
    { $set: { 'config.imagen_referencia_url': '' } }
  );

  return NextResponse.json({ success: true });
}
