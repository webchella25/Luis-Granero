import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { djChunkPath, djUploadDir, ensureDir } from '@/lib/studio/dj-session-files';
import StudioDjUploadSession from '@/models/StudioDjUploadSession';

export const runtime = 'nodejs';

interface Params { params: Promise<{ uploadId: string }> }

async function summarizeChunks(workspaceId: string, uploadId: string, totalChunks: number) {
  const received: number[] = [];
  let bytes = 0;
  for (let index = 0; index < totalChunks; index++) {
    const filePath = djChunkPath(workspaceId, uploadId, index);
    try {
      const stat = await fs.stat(filePath);
      received.push(index);
      bytes += stat.size;
    } catch {
      // chunk missing
    }
  }
  return { received, bytes };
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { uploadId } = await params;
    const formData = await request.formData();
    const chunk = formData.get('chunk');
    const chunkIndex = Number(formData.get('chunkIndex'));

    if (!(chunk instanceof File)) return NextResponse.json({ error: 'chunk es obligatorio' }, { status: 400 });
    if (!Number.isInteger(chunkIndex) || chunkIndex < 0) return NextResponse.json({ error: 'chunkIndex inválido' }, { status: 400 });

    await connectDB();
    const upload = await StudioDjUploadSession.findOne({
      upload_id: uploadId,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!upload) return NextResponse.json({ error: 'Upload no encontrado' }, { status: 404 });
    if (upload.status === 'completed') return NextResponse.json({ error: 'Upload ya completado' }, { status: 409 });
    if (upload.status === 'cancelled') return NextResponse.json({ error: 'Upload cancelado' }, { status: 409 });
    if (upload.status === 'failed' || upload.status === 'error') return NextResponse.json({ error: upload.error ?? 'Upload fallido' }, { status: 409 });
    if (upload.status === 'expired' || upload.expires_at.getTime() < Date.now()) {
      upload.status = 'expired';
      upload.expired_at = upload.expired_at ?? new Date();
      upload.last_activity_at = upload.expired_at;
      await upload.save();
      return NextResponse.json({ error: 'Upload expirado' }, { status: 410 });
    }
    if (chunkIndex >= upload.total_chunks) return NextResponse.json({ error: 'chunkIndex fuera de rango' }, { status: 400 });

    await ensureDir(djUploadDir(session.workspace_id, upload.upload_id));
    const buffer = Buffer.from(await chunk.arrayBuffer());
    const expectedMax = chunkIndex === upload.total_chunks - 1
      ? upload.file_size - upload.chunk_size * (upload.total_chunks - 1)
      : upload.chunk_size;
    if (buffer.length > expectedMax) {
      return NextResponse.json({ error: 'Chunk más grande de lo esperado' }, { status: 400 });
    }

    await fs.writeFile(djChunkPath(session.workspace_id, upload.upload_id, chunkIndex), buffer);
    const summary = await summarizeChunks(session.workspace_id, upload.upload_id, upload.total_chunks);

    upload.received_chunks = summary.received;
    upload.received_bytes = summary.bytes;
    upload.status = 'uploading';
    upload.error = null;
    upload.last_activity_at = new Date();
    await upload.save();

    const uploadedSet = new Set(upload.received_chunks);
    return NextResponse.json({
      upload_id: upload.upload_id,
      received_chunks: upload.received_chunks,
      missing_chunks: Array.from({ length: upload.total_chunks }, (_, index) => index).filter((index) => !uploadedSet.has(index)),
      received_bytes: upload.received_bytes,
      total_chunks: upload.total_chunks,
      progress: upload.file_size > 0 ? Math.min(100, Math.round((upload.received_bytes / upload.file_size) * 100)) : 0,
      status: upload.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error subiendo chunk';
    console.error('[dj-upload/chunk] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
