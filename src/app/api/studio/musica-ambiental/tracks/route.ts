import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioAmbientTrack from '@/models/StudioAmbientTrack';
import { getStudioSession } from '@/lib/studio/session';

const execAsync = promisify(exec);

function tracksDir(canal_id: string) {
  return path.join(process.cwd(), 'studio', 'musica-ambiental', 'tracks', canal_id);
}

async function getMp3Duration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    return parseFloat(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  await connectDB();
  const tracks = await StudioAmbientTrack.find({ canal_id: session.canal_id })
    .sort({ creado_en: -1 })
    .lean();

  return NextResponse.json({
    tracks: tracks.map((t) => ({ ...t, _id: t._id.toString() })),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { canal_id, workspace_id } = session;
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Se requiere un archivo MP3' }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (ext !== '.mp3') return NextResponse.json({ error: 'Solo se aceptan archivos MP3' }, { status: 400 });

  const dir = tracksDir(canal_id);
  await fs.mkdir(dir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}_${safeName}`;
  const filePath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const duracion = await getMp3Duration(filePath);

  await connectDB();
  const track = await StudioAmbientTrack.create({
    canal_id,
    workspace_id,
    nombre: safeName.replace(/_/g, ' ').replace(/\.mp3$/i, ''),
    archivo_path: filePath,
    duracion_segundos: duracion,
  });

  return NextResponse.json({ success: true, track: { ...track.toObject(), _id: track._id.toString() } });
}
