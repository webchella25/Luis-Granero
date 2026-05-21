import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getStudioSession } from '@/lib/studio/session';

interface Params { params: Promise<{ canal_id: string; filename: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { canal_id, filename } = await params;
  if (session.canal_id !== canal_id) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const filePath = path.join(process.cwd(), 'studio', 'musica-ambiental', 'tracks', canal_id, filename);

  try {
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.flac' ? 'audio/flac' : 'audio/mpeg';
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }
}
