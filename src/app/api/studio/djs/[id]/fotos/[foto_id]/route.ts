import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioDj from '@/models/StudioDj';
import { getStudioSession } from '@/lib/studio/session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; foto_id: string }> }
): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, foto_id } = await params;
    const fotoPath = decodeURIComponent(foto_id);

    await connectDB();
    const dj = await StudioDj.findById(id);
    if (!dj) return NextResponse.json({ error: 'DJ no encontrado' }, { status: 404 });

    dj.fotos = dj.fotos.filter((f: string) => f !== fotoPath);
    await dj.save();

    // Borrar archivo del disco
    const diskPath = path.join(process.cwd(), 'public', fotoPath);
    await fs.unlink(diskPath).catch(() => {});

    return NextResponse.json({ success: true, dj });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
