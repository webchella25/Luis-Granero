import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getValidAccessTokenForCanal } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';
import { deleteLocalVideoFile, hasConfirmedYoutubeUpload } from '@/lib/studio/uploaded-local-video-cleanup';

interface UploadShortBody {
  scriptId: string;
  seccion: number; // índice de la sección (0, 2, 3)
  titulo: string;
  descripcion?: string;
  tags?: string[];
  visibilidad?: 'public' | 'unlisted' | 'private';
  publishAt?: string; // ISO 8601 — si viene, programa la publicación
}

function sanitizeTitle(t: string): string {
  return t
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\uFEFF/g, '')
    .replace(/[<>]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function sanitizeTags(tags: string[]): string[] {
  const cleaned: string[] = [];
  let totalChars = 0;
  for (const raw of tags) {
    const tag = raw
      .normalize('NFC')                    // normalizar Unicode compuesto (ñ, á, etc.)
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
      .replace(/[\u2018\u2019\u201A\u201B]/g, '') // comillas tipográficas simples
      .replace(/[\u201C\u201D\u201E\u201F]/g, '') // comillas tipográficas dobles
      .replace(/[\u2013\u2014\u2015]/g, '-')      // em-dash / en-dash → guión normal
      .replace(/[^\x00-\xFF]/g, '')        // eliminar cualquier char fuera de Latin-1
      .replace(/[<>#"'`]/g, '')            // chars prohibidos / problemáticos en YouTube
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100); // YouTube permite hasta 100 chars por tag
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
  const status: Record<string, unknown> = {
    selfDeclaredMadeForKids: false,
  };

  if (metadata.publishAt) {
    status.privacyStatus = 'private';
    status.publishAt = metadata.publishAt;
  } else {
    status.privacyStatus = metadata.visibilidad;
  }

  const res = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(fileSize),
      },
      body: JSON.stringify({
        snippet: {
          title: sanitizeTitle(metadata.titulo),
          description: metadata.descripcion.slice(0, 5000),
          tags: sanitizeTags(metadata.tags),
          categoryId: '27',
          defaultLanguage: 'es',
          defaultAudioLanguage: 'es',
        },
        status,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error iniciando upload YouTube Short: ${res.status} ${err.slice(0, 300)}`);
  }

  const uploadUri = res.headers.get('location');
  if (!uploadUri) throw new Error('YouTube no devolvió URI de upload resumable');

  return uploadUri;
}

async function uploadVideoStream(uploadUri: string, videoPath: string, fileSize: number): Promise<string> {
  const nodeStream = createReadStream(videoPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream;

  const res = await fetch(uploadUri, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(fileSize) },
    body: webStream,
    // @ts-expect-error — duplex requerido para streaming en Node.js
    duplex: 'half',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error subiendo Short: ${res.status} ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error('YouTube no devolvió el ID del Short');

  return data.id;
}

async function uploadShortBackground(
  scriptId: string,
  canalId: string,
  seccion: number,
  shortAbsPath: string,
  metadata: { titulo: string; descripcion: string; tags: string[]; visibilidad: string; publishAt?: string }
) {
  try {
    const fileSize = statSync(shortAbsPath).size;
    const accessToken = await getValidAccessTokenForCanal(canalId);
    const uploadUri = await initiateResumableUpload(accessToken, metadata, fileSize);
    const videoId = await uploadVideoStream(uploadUri, shortAbsPath, fileSize);
    const youtubeUrl = `https://www.youtube.com/shorts/${videoId}`;

    await connectDB();
    const s = await StudioScript.findById(scriptId);
    if (s) {
      const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccion);
      if (entry) {
        entry.youtube_id = videoId;
        entry.youtube_url = youtubeUrl;
        entry.youtube_status = 'uploaded';
        if (metadata.publishAt) {
          entry.scheduled_at = new Date(metadata.publishAt);
        }
      }
      await s.save();
      console.log(`✅ Short sección ${seccion} subido a YouTube: ${youtubeUrl}${metadata.publishAt ? ` (programado: ${metadata.publishAt})` : ''}`);

      if (entry) {
        try {
          const deleted = await deleteLocalVideoFile('short', entry.path);
          entry.local_deleted_at = new Date();
          await s.save();
          console.log(deleted ? `[upload-youtube-short] MP4 local eliminado: ${entry.path}` : `[upload-youtube-short] MP4 local ya no existía: ${entry.path}`);
        } catch (deleteErr) {
          console.warn('[upload-youtube-short] No se pudo eliminar el MP4 local tras subirlo:', deleteErr instanceof Error ? deleteErr.message : deleteErr);
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`Error subiendo Short sección ${seccion} a YouTube:`, msg);
    await connectDB();
    const s = await StudioScript.findById(scriptId);
    if (s) {
      const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccion);
      if (entry) {
        entry.youtube_status = 'error';
        entry.youtube_error = msg.slice(0, 500);
      }
      await s.save();
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

    const body = (await request.json()) as Partial<UploadShortBody>;

    if (!body.scriptId) return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    if (body.seccion === undefined) return NextResponse.json({ error: 'seccion es obligatoria' }, { status: 400 });
    if (!body.titulo?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });

    await connectDB();
    const script = await StudioScript.findById(body.scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });

    const entry = (script.shorts ?? []).find((sh) => sh.seccion === body.seccion);
    if (!entry) return NextResponse.json({ error: `No hay Short generado para la sección ${body.seccion}` }, { status: 400 });
    if (!entry.path) return NextResponse.json({ error: 'El Short no tiene archivo generado' }, { status: 400 });
    if (entry.youtube_status === 'processing') return NextResponse.json({ status: 'processing', message: 'Ya está subiendo' });

    const shortFilename = entry.path.replace('/api/studio/short/', '');
    const shortAbsPath = path.join(process.cwd(), 'public', 'studio', 'shorts', path.basename(shortFilename));

    try { statSync(shortAbsPath); } catch {
      if (hasConfirmedYoutubeUpload(entry)) {
        entry.youtube_status = entry.youtube_status === 'ready' ? 'uploaded' : entry.youtube_status;
        entry.local_deleted_at = entry.local_deleted_at ?? new Date();
        await script.save();
        return NextResponse.json({
          status: 'uploaded',
          youtubeUrl: entry.youtube_url,
          youtubeVideoId: entry.youtube_id,
          message: 'El Short ya está subido a YouTube y el archivo local fue eliminado',
        });
      }
      return NextResponse.json({ error: `Fichero del Short no encontrado` }, { status: 404 });
    }

    entry.youtube_status = 'processing';
    entry.youtube_error = undefined;
    await script.save();

    // Añadir enlace al vídeo largo si ya está publicado
    let descripcionFinal = body.descripcion?.trim() ?? '';
    if (script.youtube_url) {
      descripcionFinal += `\n\n▶ Vídeo completo: ${script.youtube_url}\n\n#Shorts`;
    } else {
      descripcionFinal += '\n\n#Shorts';
    }

    const metadata = {
      titulo: body.titulo.trim(),
      descripcion: descripcionFinal,
      tags: body.tags ?? [],
      visibilidad: body.visibilidad ?? 'unlisted',
      publishAt: body.publishAt?.trim() || undefined,
    };

    uploadShortBackground(body.scriptId, session.canal_id, body.seccion, shortAbsPath, metadata).catch(console.error);

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando upload del Short:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
