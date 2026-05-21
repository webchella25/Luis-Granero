import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioMusicTrack from '@/models/StudioMusicTrack';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/studio/music/[id] — elimina una pista
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    await connectDB();
    const track = await StudioMusicTrack.findById(id);
    if (!track) {
      return NextResponse.json({ error: 'Pista no encontrada' }, { status: 404 });
    }

    // Borrar archivo físico
    const absPath = path.join(process.cwd(), 'public', track.archivo_path);
    await fs.rm(absPath, { force: true }).catch(() => null);

    await StudioMusicTrack.deleteOne({ _id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
