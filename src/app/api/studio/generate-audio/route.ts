import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import { EDGE_TTS_PITCH, EDGE_TTS_RATE, EDGE_TTS_VOICE, EDGE_TTS_VOLUME, runEdgeTTS } from '@/lib/studio/edge-tts';
import { cleanScriptForTTS } from '@/lib/studio/clean-script-for-tts';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

const execAsync = promisify(exec);

const ELEVENLABS_CHAR_LIMIT = 4800; // margen bajo el límite de 5000
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam - grave, narrativo

interface VoicePreset {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

const VOICE_PRESETS: Record<string, VoicePreset> = {
  oscuro:      { stability: 0.41, similarity_boost: 0.80, style: 0.33, speed: 0.89 },
  misterioso:  { stability: 0.40, similarity_boost: 0.78, style: 0.34, speed: 0.88 },
  inspirador:  { stability: 0.50, similarity_boost: 0.82, style: 0.25, speed: 0.95 },
  divulgativo: { stability: 0.55, similarity_boost: 0.83, style: 0.18, speed: 1.00 },
  educativo:   { stability: 0.60, similarity_boost: 0.85, style: 0.15, speed: 1.00 },
  amigable:    { stability: 0.62, similarity_boost: 0.85, style: 0.18, speed: 1.02 },
};
const DEFAULT_PRESET: VoicePreset = { stability: 0.45, similarity_boost: 0.80, style: 0.22, speed: 0.95 };

function splitIntoChunks(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  // Dividir por párrafos dobles primero para no cortar en mitad de frase
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
        // Párrafo solo ya supera el límite: dividir por frases
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

async function callElevenLabs(text: string, voiceId: string, apiKey: string, preset: VoicePreset = DEFAULT_PRESET): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: preset.stability,
        similarity_boost: preset.similarity_boost,
        style: preset.style,
        use_speaker_boost: true,
      },
      speed: preset.speed,
    }),
  });

  if (!response.ok) {
    let errorMsg = `ElevenLabs error ${response.status}`;
    try {
      const errBody = (await response.json()) as { detail?: { message?: string } | string };
      if (typeof errBody.detail === 'string') errorMsg += `: ${errBody.detail}`;
      else if (errBody.detail?.message) errorMsg += `: ${errBody.detail.message}`;
    } catch {
      // ignorar
    }
    const quotaError = new Error(errorMsg) as Error & { isQuotaError: boolean };
    quotaError.isQuotaError = (
      response.status === 401 ||
      response.status === 429 ||
      errorMsg.toLowerCase().includes('quota') ||
      errorMsg.toLowerCase().includes('exceeds') ||
      errorMsg.toLowerCase().includes('limit')
    );
    throw quotaError;
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function concatenateMp3s(chunkPaths: string[], outputPath: string): Promise<void> {
  // Crear fichero de lista para ffmpeg concat
  const listPath = outputPath + '.list.txt';
  const listContent = chunkPaths.map((p) => `file '${p}'`).join('\n');
  await fs.writeFile(listPath, listContent, 'utf-8');

  await execAsync(
    `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`
  );

  await fs.unlink(listPath);
}

async function fallbackToEdgeTTS(scriptId: string, ssmlText: string): Promise<{ audioPath: string; sectionDurations: number[] }> {
  const tmpTextPath = `/tmp/studio-chunks-${scriptId}-fallback.json`;
  await fs.writeFile(tmpTextPath, ssmlText, 'utf-8');

  const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
  await fs.mkdir(audioDir, { recursive: true });

  const { outputPath, audioPath } = createAudioOutput(scriptId, 'edge-tts');

  try {
    const { sectionDurations } = await runEdgeTTS(tmpTextPath, outputPath);
    return { audioPath, sectionDurations };
  } finally {
    await fs.unlink(tmpTextPath).catch(() => null);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tmpChunkPaths: string[] = [];

  try {
  const session = getStudioSession(request);
  if (!session?.canal_id) {
    return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
  }
    const { scriptId } = (await request.json()) as { scriptId?: string };

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY no configurada' }, { status: 500 });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID ?? DEFAULT_VOICE_ID;

    // Cargar guión de MongoDB
    await connectDB();
    const script = await StudioScript.findById(scriptId);

    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    const tono = (script.tono as string | undefined) ?? '';
    const voicePreset = VOICE_PRESETS[tono] ?? DEFAULT_PRESET;

    const narrationText = cleanScriptForTTS(script.guion_json, 'elevenlabs', tono);
    const chunks = splitIntoChunks(narrationText, ELEVENLABS_CHAR_LIMIT);

    // Directorio de salida
    const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'elevenlabs');

    try {
      if (chunks.length === 1) {
        const audioBuffer = await callElevenLabs(chunks[0], voiceId, apiKey, voicePreset);
        await fs.writeFile(outputPath, audioBuffer);
      } else {
        for (let i = 0; i < chunks.length; i++) {
          const chunkPath = path.join(audioDir, `${scriptId}_chunk_${i}.mp3`);
          tmpChunkPaths.push(chunkPath);
          const audioBuffer = await callElevenLabs(chunks[i], voiceId, apiKey, voicePreset);
          await fs.writeFile(chunkPath, audioBuffer);
        }
        await concatenateMp3s(tmpChunkPaths, outputPath);
        for (const p of tmpChunkPaths) {
          await fs.unlink(p).catch(() => null);
        }
      }

      const audioVersion = addAudioVersion(script, {
        engine: 'elevenlabs',
        path: audioPath,
        meta: { voiceId },
      });
      await script.save();

      return NextResponse.json({ success: true, audioPath, audioVersion, engine: 'elevenlabs' });

    } catch (elevenLabsError) {
      // Limpiar chunks parciales
      for (const p of tmpChunkPaths) {
        await fs.unlink(p).catch(() => null);
      }

      const err = elevenLabsError as Error & { isQuotaError?: boolean };
      const isQuota = err.isQuotaError === true;

      if (!isQuota) throw elevenLabsError;

      // Fallback automático a Edge TTS por cuota agotada
      console.warn('ElevenLabs sin créditos, usando Edge TTS como fallback:', err.message);
      const edgeSsml = cleanScriptForTTS(script.guion_json, 'edge-tts');
      const fallback = await fallbackToEdgeTTS(scriptId, edgeSsml);

      const audioVersion = addAudioVersion(script, {
        engine: 'edge-tts',
        path: fallback.audioPath,
        sectionDurations: fallback.sectionDurations,
        meta: { voice: EDGE_TTS_VOICE, rate: EDGE_TTS_RATE, pitch: EDGE_TTS_PITCH, volume: EDGE_TTS_VOLUME, fallbackFrom: 'elevenlabs' },
      });
      await script.save();

      return NextResponse.json({
        success: true,
        audioPath: fallback.audioPath,
        audioVersion,
        engine: 'edge-tts',
        voice: EDGE_TTS_VOICE,
        rate: EDGE_TTS_RATE,
        pitch: EDGE_TTS_PITCH,
        volume: EDGE_TTS_VOLUME,
        fallback: true,
        fallbackReason: err.message,
      });
    }

  } catch (error) {
    for (const p of tmpChunkPaths) {
      await fs.unlink(p).catch(() => null);
    }

    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
