import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import StudioDjSession from '@/models/StudioDjSession';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { id } = await params;
  await connectDB();
  const djSession = await StudioDjSession.findOne({
    _id: id,
    workspace_id: session.workspace_id,
    canal_id: session.canal_id,
  }).lean();

  if (!djSession?.video_file_path) return NextResponse.json({ error: 'Vídeo no encontrado' }, { status: 404 });

  try {
    const stat = statSync(djSession.video_file_path);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const [startRaw, endRaw] = rangeHeader.replace(/bytes=/, '').split('-');
      const start = Number.parseInt(startRaw, 10);
      const end = endRaw ? Number.parseInt(endRaw, 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const stream = createReadStream(djSession.video_file_path, { start, end });
      return new NextResponse(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'private, max-age=0',
        },
      });
    }

    const stream = createReadStream(djSession.video_file_path);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Archivo de vídeo no encontrado en disco' }, { status: 404 });
  }
}
