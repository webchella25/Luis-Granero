import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import connectDB from '@/lib/mongodb';
import StudioAmbientTrack from '@/models/StudioAmbientTrack';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ id: string }> }

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { id } = await params;
  await connectDB();

  const track = await StudioAmbientTrack.findOneAndDelete({
    _id: id,
    canal_id: session.canal_id,
  }).lean();

  if (!track) return NextResponse.json({ error: 'Track no encontrado' }, { status: 404 });

  try {
    await fs.unlink(track.archivo_path);
  } catch { /* archivo ya eliminado */ }

  return NextResponse.json({ success: true });
}
