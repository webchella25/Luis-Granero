import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import {
  DJ_MAX_VISUAL_VIDEO_BYTES,
  djVisualDir,
  ensureDir,
  getAudioDurationSeconds,
  removeFileIfExists,
  sanitizeFilename,
} from '@/lib/studio/dj-session-files';
import { sanitizeVisualMode, validateVisualVideo } from '@/lib/studio/dj-session-visuals';
import StudioDjSession from '@/models/StudioDjSession';

export const runtime = 'nodejs';

interface Params { params: Promise<{ id: string }> }

function publicVisualSession(item: Record<string, unknown>) {
  const {
    cover_image_path: _coverImagePath,
    visual_video_path: _visualVideoPath,
    visual_image_path: _visualImagePath,
    ...safe
  } = item;
  void _coverImagePath;
  void _visualVideoPath;
  void _visualImagePath;
  return { ...safe, cover_image_uploaded: Boolean(item.cover_image_path) };
}

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
  if (!djSession?.visual_video_path) return NextResponse.json({ error: 'Vídeo visual no encontrado' }, { status: 404 });

  try {
    const stat = statSync(djSession.visual_video_path);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      const [startRaw, endRaw] = rangeHeader.replace(/bytes=/, '').split('-');
      const start = Number.parseInt(startRaw, 10);
      const end = endRaw ? Number.parseInt(endRaw, 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const stream = createReadStream(djSession.visual_video_path, { start, end });
      return new NextResponse(stream as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': djSession.visual_video_mime_type || 'video/mp4',
          'Cache-Control': 'private, max-age=0',
        },
      });
    }

    const stream = createReadStream(djSession.visual_video_path);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': djSession.visual_video_mime_type || 'video/mp4',
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=0',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Archivo visual no encontrado en disco' }, { status: 404 });
  }
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { id } = await params;
    const formData = await request.formData();
    const visual = formData.get('visual_video');

    if (!(visual instanceof File)) return NextResponse.json({ error: 'El vídeo visual es obligatorio' }, { status: 400 });
    if (!(await validateVisualVideo(visual))) {
      return NextResponse.json({ error: 'Formato no soportado. Usa MP4, MOV o WEBM.' }, { status: 400 });
    }
    if (visual.size > DJ_MAX_VISUAL_VIDEO_BYTES) {
      return NextResponse.json({ error: 'El vídeo visual supera el tamaño máximo permitido' }, { status: 413 });
    }

    await connectDB();
    const djSession = await StudioDjSession.findOne({
      _id: id,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });

    const visualDir = djVisualDir(session.canal_id);
    await ensureDir(visualDir);

    const ext = path.extname(visual.name).toLowerCase() || '.mp4';
    const filename = `${Date.now()}_${sanitizeFilename(visual.name).replace(/\.[^.]+$/, '')}${ext}`;
    const tempPath = path.join(visualDir, `${filename}.tmp`);
    const finalPath = path.join(visualDir, filename);
    const buffer = Buffer.from(await visual.arrayBuffer());
    await fs.writeFile(tempPath, buffer);
    await fs.rename(tempPath, finalPath);

    const duration = await getAudioDurationSeconds(finalPath);
    const previousVisualPath = djSession.visual_video_path;
    djSession.visual_mode = sanitizeVisualMode('video_loop');
    djSession.visual_status = 'ready';
    djSession.visual_error = null;
    djSession.visual_provider = 'manual';
    djSession.visual_workflow = 'upload';
    djSession.visual_video_path = finalPath;
    djSession.visual_video_original_name = visual.name;
    djSession.visual_video_mime_type = visual.type || 'video/mp4';
    djSession.visual_video_size = visual.size;
    djSession.visual_video_duration = duration;
    djSession.visual_generated_at = new Date();
    djSession.visual_prompt = djSession.visual_prompt || '';
    await djSession.save();

    if (previousVisualPath && previousVisualPath !== finalPath) {
      await removeFileIfExists(previousVisualPath);
    }

    return NextResponse.json({
      success: true,
      session: publicVisualSession({
        ...djSession.toObject(),
        _id: djSession._id.toString(),
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error subiendo vídeo visual';
    console.error('[dj-sessions/visual-video] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
