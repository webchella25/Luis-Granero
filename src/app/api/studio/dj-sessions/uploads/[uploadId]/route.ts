import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import { djUploadDir, removeDirIfExists } from '@/lib/studio/dj-session-files';
import StudioDjUploadSession from '@/models/StudioDjUploadSession';

export const runtime = 'nodejs';

interface Params { params: Promise<{ uploadId: string }> }

function buildUploadStatus(upload: {
  upload_id: string;
  status: string;
  filename: string;
  mime_type: string;
  file_size: number;
  chunk_size: number;
  total_chunks: number;
  received_chunks?: number[];
  received_bytes?: number;
  expires_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
  error?: string | null;
  final_session_id?: string | null;
}) {
  const uploadedChunks = [...new Set(upload.received_chunks ?? [])].sort((a, b) => a - b);
  const uploadedSet = new Set(uploadedChunks);
  const missingChunks = Array.from({ length: upload.total_chunks }, (_, index) => index).filter((index) => !uploadedSet.has(index));
  const uploadedBytes = upload.received_bytes ?? 0;

  return {
    uploadId: upload.upload_id,
    status: upload.status,
    fileName: upload.filename,
    fileSize: upload.file_size,
    fileType: upload.mime_type,
    chunkSize: upload.chunk_size,
    totalChunks: upload.total_chunks,
    uploadedChunks,
    missingChunks,
    uploadedBytes,
    progress: upload.file_size > 0 ? Math.min(100, Math.round((uploadedBytes / upload.file_size) * 100)) : 0,
    expiresAt: upload.expires_at,
    error: upload.error ?? null,
    finalSessionId: upload.final_session_id ?? null,
    createdAt: upload.created_at,
    updatedAt: upload.updated_at,
  };
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { uploadId } = await params;
  await connectDB();
  const upload = await StudioDjUploadSession.findOne({
    upload_id: uploadId,
    workspace_id: session.workspace_id,
    canal_id: session.canal_id,
  });
  if (!upload) return NextResponse.json({ error: 'Upload no encontrado' }, { status: 404 });

  if ((upload.status === 'initiated' || upload.status === 'uploading') && upload.expires_at.getTime() < Date.now()) {
    upload.status = 'expired';
    upload.expired_at = upload.expired_at ?? new Date();
    upload.last_activity_at = upload.expired_at;
    await upload.save();
  }

  return NextResponse.json({ upload: buildUploadStatus(upload.toObject()) });
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  const { uploadId } = await params;
  await connectDB();
  const upload = await StudioDjUploadSession.findOne({
    upload_id: uploadId,
    workspace_id: session.workspace_id,
    canal_id: session.canal_id,
  });
  if (!upload) return NextResponse.json({ error: 'Upload no encontrado' }, { status: 404 });

  upload.status = 'cancelled';
  upload.cancelled_at = new Date();
  upload.last_activity_at = upload.cancelled_at;
  await upload.save();
  await removeDirIfExists(djUploadDir(session.workspace_id, upload.upload_id));

  return NextResponse.json({ success: true });
}
