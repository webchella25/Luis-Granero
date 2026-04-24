import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioMusicaAmbiental from '@/models/StudioMusicaAmbiental';
import { getValidAccessTokenForCanal } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'studio', 'musica-ambiental', 'videos');

interface UploadBody {
  titulo: string;
  descripcion: string;
  tags: string[];
  visibilidad: 'public' | 'unlisted' | 'private';
  publishAt?: string;
}

function removeEmojis(text: string): string {
  return text.replace(/[\uD800-\uDFFF]/g, '').replace(/[☀-➿]/g, '');
}

function sanitizeTitle(t: string): string {
  return t
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/﻿/g, '')
    .replace(/[<>]/g, '')
    .replace(/[​-‍﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function sanitizeTags(tags: string[]): string[] {
  const cleaned: string[] = [];
  let totalChars = 0;
  for (const raw of tags) {
    const tag = raw
      .normalize('NFC')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/[​-‍﻿]/g, '')
      .replace(/[‘’‚‛]/g, '')
      .replace(/[“”„‟]/g, '')
      .replace(/[–—―]/g, '-')
      .replace(/[^\x00-\xFF]/g, '')
      .replace(/[<>#"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
    if (!tag) continue;
    if (totalChars + tag.length + (cleaned.length > 0 ? 1 : 0) > 500) break;
    totalChars += tag.length + (cleaned.length > 0 ? 1 : 0);
    cleaned.push(tag);
  }
  return cleaned;
}

async function initiateResumableUpload(
  accessToken: string,
  metadata: { titulo: string; descripcion: string; tags: string[]; visibilidad: string; publishAt?: string },
  fileSize: number
): Promise<string> {
  const status: Record<string, unknown> = { selfDeclaredMadeForKids: false };
  if (metadata.publishAt) {
    status.privacyStatus = 'private';
    status.publishAt = metadata.publishAt;
  } else {
    status.privacyStatus = metadata.visibilidad;
  }

  const cleanTags = sanitizeTags(metadata.tags);
  const requestBody = {
    snippet: {
      title: sanitizeTitle(metadata.titulo),
      description: removeEmojis(metadata.descripcion).slice(0, 5000),
      tags: cleanTags,
      categoryId: '10', // Music
      defaultLanguage: 'es',
    },
    status,
  };

  const res = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(fileSize),
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Initiate upload failed ${res.status}: ${errText}`);
  }

  const uploadUri = res.headers.get('location');
  if (!uploadUri) throw new Error('YouTube no devolvió la URI de subida');
  return uploadUri;
}

async function uploadVideoStream(uploadUri: string, videoAbsPath: string, fileSize: number): Promise<string> {
  const nodeStream = createReadStream(videoAbsPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  const res = await fetch(uploadUri, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(fileSize) },
    body: webStream,
    // @ts-expect-error — duplex requerido para streaming en Node.js
    duplex: 'half',
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload stream failed ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error('YouTube no devolvió el ID del vídeo');
  return data.id;
}

async function uploadBackground(
  docId: string,
  canalId: string,
  videoAbsPath: string,
  metadata: { titulo: string; descripcion: string; tags: string[]; visibilidad: string; publishAt?: string }
) {
  try {
    const fileSize = statSync(videoAbsPath).size;
    const accessToken = await getValidAccessTokenForCanal(canalId);

    let uploadUri: string;
    try {
      uploadUri = await initiateResumableUpload(accessToken, metadata, fileSize);
    } catch (tagsErr) {
      const msg = tagsErr instanceof Error ? tagsErr.message : '';
      if (msg.includes('invalidTags')) {
        console.warn('[musica-ambiental/upload-youtube] invalidTags — reintentando sin tags');
        uploadUri = await initiateResumableUpload(accessToken, { ...metadata, tags: [] }, fileSize);
      } else {
        throw tagsErr;
      }
    }

    const videoId = await uploadVideoStream(uploadUri, videoAbsPath, fileSize);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(docId, {
      $set: {
        youtube_id: videoId,
        youtube_url: youtubeUrl,
        ...(metadata.publishAt ? { scheduled_at: new Date(metadata.publishAt) } : {}),
      },
    });
    console.log(`✅ [musica-ambiental] Vídeo subido a YouTube: ${youtubeUrl}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[musica-ambiental/upload-youtube] Error:', msg);
    // Registrar el error en el documento pero sin cambiar estado
    await connectDB();
    await StudioMusicaAmbiental.findByIdAndUpdate(docId, {
      $set: { error_msg: `YouTube: ${msg.slice(0, 500)}` },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

    const { id } = await params;
    const body = (await request.json()) as Partial<UploadBody>;

    if (!body.titulo?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });

    await connectDB();
    const doc = await StudioMusicaAmbiental.findById(id);
    if (!doc) return NextResponse.json({ error: 'Vídeo no encontrado' }, { status: 404 });
    if (!doc.video_path) return NextResponse.json({ error: 'El vídeo aún no está generado' }, { status: 400 });
    if (doc.youtube_id) return NextResponse.json({ status: 'already_uploaded', youtube_url: doc.youtube_url });

    // Derivar ruta absoluta del vídeo
    const filename = path.basename(doc.video_path);
    const videoAbsPath = path.join(VIDEOS_DIR, filename);
    try { statSync(videoAbsPath); } catch {
      return NextResponse.json({ error: 'Fichero de vídeo no encontrado en disco' }, { status: 404 });
    }

    const metadata = {
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() ?? '',
      tags: body.tags ?? [],
      visibilidad: body.visibilidad ?? 'unlisted',
      publishAt: body.publishAt?.trim() || undefined,
    };

    uploadBackground(id, session.canal_id, videoAbsPath, metadata).catch(console.error);

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[musica-ambiental/upload-youtube] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
