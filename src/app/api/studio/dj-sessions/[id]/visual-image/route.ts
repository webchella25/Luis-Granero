import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import {
  DJ_MAX_VISUAL_IMAGE_BYTES,
  djVisualDir,
  ensureDir,
  getDjVisualImageMimeType,
  isAllowedDjVisualImage,
  removeFileIfExists,
  sanitizeFilename,
} from '@/lib/studio/dj-session-files';
import StudioDjSession from '@/models/StudioDjSession';

interface Params { params: Promise<{ id: string }> }

function publicVisualImageSession(item: Record<string, unknown>) {
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

  const imagePath = djSession?.cover_image_path || djSession?.visual_image_path;
  if (!imagePath) {
    return NextResponse.json({ error: 'Imagen visual no encontrada' }, { status: 404 });
  }

  try {
    const stat = statSync(imagePath);
    const stream = createReadStream(imagePath);
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': djSession?.cover_image_path
          ? (djSession.cover_image_mime_type || getDjVisualImageMimeType(imagePath))
          : 'image/jpeg',
        'Content-Length': String(stat.size),
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
    const image = formData.get('cover_image');

    if (!(image instanceof File)) return NextResponse.json({ error: 'La imagen es obligatoria' }, { status: 400 });
    if (!isAllowedDjVisualImage(image)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa JPG, PNG o WEBP.' }, { status: 400 });
    }
    if (image.size > DJ_MAX_VISUAL_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `La imagen supera el tamaño máximo permitido (${Math.round(DJ_MAX_VISUAL_IMAGE_BYTES / 1024 / 1024)} MB).` },
        { status: 413 }
      );
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

    const ext = path.extname(image.name).toLowerCase() || '.jpg';
    const filename = `${Date.now()}_${sanitizeFilename(image.name).replace(/\.[^.]+$/, '')}${ext}`;
    const tempPath = path.join(visualDir, `${filename}.tmp`);
    const finalPath = path.join(visualDir, filename);
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(tempPath, buffer);
    await fs.rename(tempPath, finalPath);

    const previousCoverPath = djSession.cover_image_path;
    djSession.cover_image_path = finalPath;
    djSession.cover_image_original_name = image.name;
    djSession.cover_image_mime_type = image.type || getDjVisualImageMimeType(image.name);
    djSession.cover_image_size = image.size;
    await djSession.save();

    if (previousCoverPath && previousCoverPath !== finalPath) {
      await removeFileIfExists(previousCoverPath);
    }

    return NextResponse.json({
      success: true,
      session: publicVisualImageSession({
        ...djSession.toObject(),
        _id: djSession._id.toString(),
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error subiendo imagen visual';
    console.error('[dj-sessions/visual-image] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!session.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const { id } = await params;
    await connectDB();
    const djSession = await StudioDjSession.findOne({
      _id: id,
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
    });
    if (!djSession) return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });

    const previousCoverPath = djSession.cover_image_path;
    djSession.cover_image_path = null;
    djSession.cover_image_original_name = null;
    djSession.cover_image_mime_type = null;
    djSession.cover_image_size = 0;
    await djSession.save();
    await removeFileIfExists(previousCoverPath);

    return NextResponse.json({
      success: true,
      session: publicVisualImageSession({
        ...djSession.toObject(),
        _id: djSession._id.toString(),
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error eliminando imagen visual';
    console.error('[dj-sessions/visual-image] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
