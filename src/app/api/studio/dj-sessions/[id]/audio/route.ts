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

  if (!djSession?.audio_path) return NextResponse.json({ error: 'Audio no encontrado' }, { status: 404 });

  try {
    const stat = statSync(djSession.audio_path);
    const stream = createReadStream(djSession.audio_path);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': djSession.audio_mime_type || 'audio/mpeg',
        'Content-Length': String(stat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado en disco' }, { status: 404 });
  }
}
