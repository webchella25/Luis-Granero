import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { getValidAccessTokenForCanal } from '@/lib/studio/youtube-auth';
import { getStudioSession } from '@/lib/studio/session';

interface UploadBody {
  scriptId: string;
  titulo: string;
  descripcion: string;
  tags: string[];
  visibilidad: 'public' | 'unlisted' | 'private';
  publishAt?: string; // ISO 8601 — si viene, programa la publicación
}

/**
 * Elimina emojis y caracteres fuera del plano BMP (surrogate pairs).
 * YouTube acepta emojis en la descripción pero a veces falla con ciertos rangos.
 */
function removeEmojis(text: string): string {
  // Eliminar surrogate pairs (emojis, símbolos extra-BMP)
  return text.replace(/[\uD800-\uDFFF]/g, '').replace(/[\u2600-\u27BF]/g, '');
}

/** Limpia y trunca el título para la API de YouTube */
function sanitizeTitle(t: string): string {
  return t
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // caracteres de control
    .replace(/\uFEFF/g, '')                // BOM
    .replace(/[<>]/g, '')                  // prohibidos YouTube
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/\s+/g, ' ')                  // normalizar espacios
    .trim()
    .slice(0, 90);                         // margen de seguridad
}

/**
 * Limpia y trunca los tags para la API de YouTube.
 * Límites reales: cada tag ≤ 30 chars, total de caracteres ≤ 500,
 * sin <> ni caracteres de control.
 */
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
    if (totalChars + tag.length + (cleaned.length > 0 ? 1 : 0) > 500) break; // 500 total
    totalChars += tag.length + (cleaned.length > 0 ? 1 : 0);
    cleaned.push(tag);
  }
  return cleaned;
}

async function initiateResumableUpload(
  accessToken: string,
  metadata: {
    titulo: string;
    descripcion: string;
    tags: string[];
    visibilidad: string;
    publishAt?: string;
  },
  fileSize: number
): Promise<string> {
  const status: Record<string, unknown> = {
    selfDeclaredMadeForKids: false,
  };

  if (metadata.publishAt) {
    // Publicación programada: debe ser privado con publishAt
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
      categoryId: '27',
      defaultLanguage: 'es',
      defaultAudioLanguage: 'es',
    },
    status,
  };
  console.log('[upload-youtube] JSON enviado a YouTube:', JSON.stringify(requestBody).slice(0, 1000));

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
      body: JSON.stringify(requestBody),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[upload-youtube] Error completo de YouTube:', err);
    throw new Error(`Error iniciando upload YouTube: ${res.status} ${err.slice(0, 800)}`);
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
    throw new Error(`Error subiendo vídeo: ${res.status} ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) throw new Error('YouTube no devolvió el ID del vídeo');

  return data.id;
}

async function uploadBackground(
  scriptId: string,
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
        // YouTube rechaza los tags (content policy). Reintentamos sin tags.
        console.warn('[upload-youtube] invalidTags — reintentando sin tags');
        uploadUri = await initiateResumableUpload(accessToken, { ...metadata, tags: [] }, fileSize);
      } else {
        throw tagsErr;
      }
    }

    const videoId = await uploadVideoStream(uploadUri, videoAbsPath, fileSize);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await connectDB();
    const s = await StudioScript.findById(scriptId);
    if (s) {
      s.youtube_id = videoId;
      s.youtube_url = youtubeUrl;
      s.youtube_status = 'ready';
      if (metadata.publishAt) {
        s.youtube_scheduled_at = new Date(metadata.publishAt);
      } else {
        s.youtube_published_at = new Date();
      }
      await s.save();
      console.log(`✅ Vídeo subido a YouTube: ${youtubeUrl}${metadata.publishAt ? ` (programado: ${metadata.publishAt})` : ''}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error subiendo a YouTube:', msg);
    await connectDB();
    const s = await StudioScript.findById(scriptId);
    if (s) {
      s.youtube_status = 'error';
      s.youtube_error = msg.slice(0, 500);
      await s.save();
    }
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

    const body = (await request.json()) as Partial<UploadBody>;

    if (!body.scriptId) return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    if (!body.titulo?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });

    await connectDB();
    const script = await StudioScript.findById(body.scriptId);
    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    if (!script.video_path) return NextResponse.json({ error: 'El guión no tiene vídeo generado' }, { status: 400 });
    if (script.youtube_status === 'processing') return NextResponse.json({ status: 'processing', message: 'Ya está subiendo' });

    const videoFilename = script.video_path.replace('/api/studio/video/', '');
    const videoAbsPath = path.join(process.cwd(), 'public', 'studio', 'videos', path.basename(videoFilename));

    try { statSync(videoAbsPath); } catch {
      return NextResponse.json({ error: `Fichero de vídeo no encontrado` }, { status: 404 });
    }

    script.youtube_status = 'processing';
    script.youtube_error = undefined;
    await script.save();

    const metadata = {
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() ?? '',
      tags: body.tags ?? [],
      visibilidad: body.visibilidad ?? 'unlisted',
      publishAt: body.publishAt?.trim() || undefined,
    };

    console.log('[upload-youtube] titulo recibido:', JSON.stringify(body.titulo));
    console.log('[upload-youtube] titulo sanitizado:', JSON.stringify(sanitizeTitle(metadata.titulo)));
    console.log('[upload-youtube] titulo length:', metadata.titulo.length);
    console.log('[upload-youtube] titulo charCodes:', [...metadata.titulo].slice(0, 20).map(c => c.charCodeAt(0)));
    console.log('[upload-youtube] tags recibidos:', JSON.stringify(metadata.tags));
    console.log('[upload-youtube] tags sanitizados:', JSON.stringify(sanitizeTags(metadata.tags)));

    uploadBackground(body.scriptId, session.canal_id, videoAbsPath, metadata).catch(console.error);

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando upload YouTube:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
