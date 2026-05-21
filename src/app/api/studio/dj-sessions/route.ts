import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import { getStudioSession } from '@/lib/studio/session';
import StudioDjSession, { type DjSessionOutputFormat, type DjSessionVisibility } from '@/models/StudioDjSession';
import {
  djAudioDir,
  getAudioDurationSeconds,
  isAllowedDjAudio,
  sanitizeFilename,
} from '@/lib/studio/dj-session-files';

function publicDjSession(item: Record<string, unknown>) {
  const {
    video_file_path: _videoFilePath,
    youtube_upload_url: _youtubeUploadUrl,
    cover_image_path: _coverImagePath,
    visual_video_path: _visualVideoPath,
    visual_image_path: _visualImagePath,
    ...safe
  } = item;
  void _videoFilePath;
  void _youtubeUploadUrl;
  void _coverImagePath;
  void _visualVideoPath;
  void _visualImagePath;
  return { ...safe, cover_image_uploaded: Boolean(item.cover_image_path) };
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function parseVisibility(value: FormDataEntryValue | null): DjSessionVisibility {
  return value === 'public' || value === 'private' || value === 'unlisted'
    ? value
    : 'unlisted';
}

function parseOutputFormat(value: FormDataEntryValue | null): DjSessionOutputFormat {
  return value === '9:16' || value === '1:1' || value === '16:9'
    ? value
    : '16:9';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  await connectDB();
  const sessions = await StudioDjSession.find({
    canal_id: session.canal_id,
    workspace_id: session.workspace_id,
  })
    .sort({ created_at: -1 })
    .lean();

  return NextResponse.json({
    sessions: sessions.map((item) => publicDjSession({ ...item, _id: item._id.toString() })),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = getStudioSession(request);
  if (!session?.canal_id) return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });

  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const titulo = String(formData.get('titulo') ?? '').trim();

    if (!titulo) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
    if (!(audio instanceof File)) return NextResponse.json({ error: 'El audio es obligatorio' }, { status: 400 });
    if (!isAllowedDjAudio(audio)) {
      return NextResponse.json({ error: 'Formato no soportado. Usa MP3, WAV, FLAC o M4A.' }, { status: 400 });
    }

    const dir = djAudioDir(session.canal_id);
    await fs.mkdir(dir, { recursive: true });

    const filename = `${Date.now()}_${sanitizeFilename(audio.name)}`;
    const audioPath = path.join(dir, filename);
    const buffer = Buffer.from(await audio.arrayBuffer());
    await fs.writeFile(audioPath, buffer);

    const duration = await getAudioDurationSeconds(audioPath);
    const bpmRaw = String(formData.get('bpm') ?? '').trim();
    const bpm = bpmRaw ? Number.parseFloat(bpmRaw) : null;
    const scheduledRaw = String(formData.get('scheduled_at') ?? '').trim();

    await connectDB();
    const doc = await StudioDjSession.create({
      workspace_id: session.workspace_id,
      canal_id: session.canal_id,
      dj_id: String(formData.get('dj_id') ?? '').trim(),
      user_id: String(formData.get('user_id') ?? '').trim(),
      titulo,
      descripcion: String(formData.get('descripcion') ?? '').trim(),
      audio_path: audioPath,
      audio_original_name: audio.name,
      audio_mime_type: audio.type || 'application/octet-stream',
      audio_size: audio.size,
      audio_duration: duration,
      estado: 'audio_subido',
      progreso: 10,
      tracklist: String(formData.get('tracklist') ?? '').trim(),
      bpm: Number.isFinite(bpm) ? bpm : null,
      genre: String(formData.get('genre') ?? '').trim(),
      output_format: parseOutputFormat(formData.get('output_format')),
      tags: parseTags(formData.get('tags')),
      visibility: parseVisibility(formData.get('visibility')),
      scheduled_at: scheduledRaw ? new Date(scheduledRaw) : null,
    });

    return NextResponse.json({ success: true, session: publicDjSession({ ...doc.toObject(), _id: doc._id.toString() }) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('[dj-sessions] Error creando sesión:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
