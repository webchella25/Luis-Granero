import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { getCleanedSections } from '@/lib/studio/clean-script-for-tts';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

export const maxDuration = 300;

const execFileAsync = promisify(execFile);

const NVIDIA_CHAR_LIMIT = 5000;

function splitIntoChunks(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';

  for (const para of paragraphs) {
    const separator = current ? '\n\n' : '';
    const candidate = current + separator + para;

    if (candidate.length > maxChars) {
      if (current) {
        chunks.push(current.trim());
        current = para;
      } else {
        const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
        for (const sentence of sentences) {
          const candSent = current + (current ? ' ' : '') + sentence;
          if (candSent.length > maxChars && current) {
            chunks.push(current.trim());
            current = sentence;
          } else {
            current = candSent;
          }
        }
      }
    } else {
      current = candidate;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) {
      return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
    }

    const { scriptId } = (await request.json()) as { scriptId?: string };
    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    }

    await connectDB();
    const canal = await StudioCanal.findById(session.canal_id).select('config').lean();
    const canalData = canal as { config?: { nvidia_api_key?: string; nvidia_voice?: string } } | null;

    const apiKey = canalData?.config?.nvidia_api_key ?? '';
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API key no configurada en este canal' }, { status: 400 });
    }

    const voice = canalData?.config?.nvidia_voice ?? 'Magpie-Multilingual.ES-US.Leo';

    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    const sections = getCleanedSections(script.guion_json);

    const chunksData = { sections };
    const tmpChunksPath = `/tmp/nvidia-chunks-${scriptId}.json`;
    await fs.writeFile(tmpChunksPath, JSON.stringify(chunksData), 'utf-8');

    const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'nvidia-tts');

    const scriptPath = path.join(process.cwd(), 'scripts', 'nvidia-tts.py');

    try {
      const { stdout, stderr } = await execFileAsync('python3', [
        scriptPath, tmpChunksPath, outputPath, voice, apiKey,
      ]);
      if (stdout) console.log('[NVIDIA TTS]', stdout.slice(0, 500));
      if (stderr) console.error('[NVIDIA TTS stderr]', stderr.slice(0, 500));
    } finally {
      await fs.unlink(tmpChunksPath).catch(() => null);
    }

    const audioVersion = addAudioVersion(script, {
      engine: 'nvidia-tts',
      path: audioPath,
      meta: { voice },
    });
    await script.save();

    return NextResponse.json({ success: true, audioPath, audioVersion, engine: 'nvidia-tts' });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio NVIDIA:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
