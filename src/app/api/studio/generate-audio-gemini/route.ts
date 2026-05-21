import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import connectDB from '@/lib/mongodb';
import StudioScript from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import { cleanScriptForTTS } from '@/lib/studio/clean-script-for-tts';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { addAudioVersion, createAudioOutput } from '@/lib/studio/audio-versions';

export const maxDuration = 300;

const execFileAsync = promisify(execFile);

const GEMINI_TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const GEMINI_TTS_VOICE = 'Kore'; // Voz grave y expresiva, multilingüe
const GEMINI_CHAR_LIMIT = 800; // Gemini TTS cierra el stream ~5min — chunks cortos evitan el timeout

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

async function callGeminiTTS(text: string, apiKey: string): Promise<Buffer> {
  // TTS models require streamGenerateContent — generateContent returns empty content
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini TTS error ${res.status}: ${err.slice(0, 300)}`);
  }

  const audioChunks: Buffer[] = [];
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    lineBuffer += decoder.decode(value, { stream: true });
    const lines = lineBuffer.split('\n');
    lineBuffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const chunk = JSON.parse(jsonStr) as {
          candidates?: Array<{
            content?: { parts?: Array<{ inlineData?: { data: string } }> };
          }>;
        };
        const b64 = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) audioChunks.push(Buffer.from(b64, 'base64'));
      } catch {
        // línea SSE malformada, ignorar
      }
    }
  }

  if (audioChunks.length === 0) {
    throw new Error('Gemini TTS: respuesta sin audio');
  }

  return Buffer.concat(audioChunks);
}

async function callGeminiTTSWithRetry(text: string, apiKey: string, maxRetries = 3): Promise<Buffer> {
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callGeminiTTS(text, apiKey);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = 1500 * Math.pow(2, attempt); // 1.5s, 3s, 6s
        console.warn(`[Gemini TTS] Chunk ${attempt + 1} fallido (${lastError.message}), reintentando en ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

async function pcmToMp3(pcmBuffer: Buffer, tmpDir: string, index: number): Promise<string> {
  const pcmPath = path.join(tmpDir, `chunk_${index}.pcm`);
  const mp3Path = path.join(tmpDir, `chunk_${index}.mp3`);
  await fs.writeFile(pcmPath, pcmBuffer);
  await execFileAsync('ffmpeg', [
    '-y', '-f', 's16le', '-ar', '24000', '-ac', '1',
    '-i', pcmPath, '-codec:a', 'libmp3lame', '-b:a', '192k', mp3Path,
  ]);
  await fs.unlink(pcmPath);
  return mp3Path;
}

async function concatenateMp3s(chunkPaths: string[], outputPath: string): Promise<void> {
  const listPath = outputPath + '.list.txt';
  await fs.writeFile(listPath, chunkPaths.map((p) => `file '${p}'`).join('\n'));
  await execFileAsync('ffmpeg', [
    '-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath,
  ]);
  await fs.unlink(listPath);
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
    const canalData = canal as { config?: { gemini_api_key?: string } } | null;
    const apiKey = canalData?.config?.gemini_api_key ?? '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key no configurada en este canal' }, { status: 400 });
    }

    const script = await StudioScript.findById(scriptId);
    if (!script) {
      return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    }

    // Marcar como procesando y responder inmediatamente — la generación continúa en background
    script.audio_status = 'processing';
    script.audio_error = undefined;
    await script.save();

    void runGeminiTTSBackground(scriptId, apiKey);

    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando Gemini TTS:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function runGeminiTTSBackground(scriptId: string, apiKey: string): Promise<void> {
  const tmpPaths: string[] = [];
  try {
    await connectDB();
    const script = await StudioScript.findById(scriptId);
    if (!script) return;

    const narrationText = cleanScriptForTTS(script.guion_json, 'elevenlabs');
    const chunks = splitIntoChunks(narrationText, GEMINI_CHAR_LIMIT);

    const audioDir = path.join(process.cwd(), 'public', 'studio', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    const tmpDir = path.join('/tmp', `gemini-tts-${scriptId}`);
    await fs.mkdir(tmpDir, { recursive: true });

    const { outputPath, audioPath } = createAudioOutput(scriptId, 'gemini-tts');

    const mp3Chunks: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const pcm = await callGeminiTTSWithRetry(chunks[i], apiKey);
      const mp3Path = await pcmToMp3(pcm, tmpDir, i);
      mp3Chunks.push(mp3Path);
      tmpPaths.push(mp3Path);
    }

    if (mp3Chunks.length === 1) {
      await fs.copyFile(mp3Chunks[0], outputPath);
    } else {
      await concatenateMp3s(mp3Chunks, outputPath);
    }

    for (const p of tmpPaths) await fs.unlink(p).catch(() => null);
    await fs.rmdir(tmpDir).catch(() => null);

    addAudioVersion(script, {
      engine: 'gemini-tts',
      path: audioPath,
      meta: { model: GEMINI_TTS_MODEL, voice: GEMINI_TTS_VOICE },
    });
    await script.save();
    console.log('[Gemini TTS] Audio listo:', audioPath);
  } catch (error) {
    for (const p of tmpPaths) await fs.unlink(p).catch(() => null);
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error generando audio con Gemini TTS:', message);
    try {
      await connectDB();
      await StudioScript.findByIdAndUpdate(scriptId, { audio_status: 'error', audio_error: message });
    } catch { /* ignorar error al guardar estado */ }
  }
}
