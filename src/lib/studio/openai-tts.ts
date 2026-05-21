import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const OPENAI_TTS_DEFAULT_MODEL = 'gpt-4o-mini-tts';
export const OPENAI_TTS_DEFAULT_VOICE = 'onyx';
export const OPENAI_TTS_DEFAULT_SPEED = 0.92;
export const OPENAI_TTS_DEFAULT_INSTRUCTIONS =
  'Habla en español de España con tono grave, sobrio y autoritario. Ritmo pausado, estilo documental de true crime, sin dramatizar en exceso.';

const OPENAI_TTS_CHAR_LIMIT = 3900;

interface OpenAITTSOptions {
  apiKey: string;
  model: string;
  voice: string;
  instructions?: string;
  speed?: number;
}

export interface OpenAITTSResult {
  sectionDurations: number[];
}

function splitLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';

  for (const paragraph of paragraphs) {
    const separator = current ? '\n\n' : '';
    const candidate = current + separator + paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current.trim()) {
      chunks.push(current.trim());
      current = '';
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) ?? [paragraph];
    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length > maxChars && current.trim()) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = next;
      }
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function normalizeSpeed(speed?: number): number {
  if (!Number.isFinite(speed)) return OPENAI_TTS_DEFAULT_SPEED;
  return Math.max(0.25, Math.min(4, speed ?? OPENAI_TTS_DEFAULT_SPEED));
}

async function synthesizeOpenAIChunk(text: string, outputPath: string, options: OpenAITTSOptions): Promise<void> {
  const model = options.model || OPENAI_TTS_DEFAULT_MODEL;
  const body: Record<string, unknown> = {
    model,
    voice: options.voice || OPENAI_TTS_DEFAULT_VOICE,
    input: text,
    response_format: 'mp3',
    speed: normalizeSpeed(options.speed),
  };

  if (model.startsWith('gpt-4o-mini-tts')) {
    body.instructions = options.instructions?.trim() || OPENAI_TTS_DEFAULT_INSTRUCTIONS;
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    if (response.status === 429) {
      throw new Error('Cuota de OpenAI agotada. Recarga créditos en platform.openai.com o usa otro motor TTS (Edge TTS es gratuito).');
    }
    if (response.status === 401) {
      throw new Error('API key de OpenAI inválida o sin permisos. Revisa la configuración del canal.');
    }
    throw new Error(`OpenAI TTS error ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length === 0) throw new Error('OpenAI TTS devolvió audio vacío');
  await fs.writeFile(outputPath, audio);
}

async function generateSilence(durationMs: number, outputPath: string): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-f', 'lavfi',
    '-i', 'anullsrc=r=24000:cl=mono',
    '-t', String(durationMs / 1000),
    '-acodec', 'libmp3lame',
    '-b:a', '192k',
    outputPath,
  ]);
}

async function concatFiles(files: string[], outputPath: string): Promise<void> {
  const listPath = `${outputPath}.list.txt`;
  await fs.writeFile(listPath, files.map((file) => `file '${file}'`).join('\n'), 'utf-8');
  try {
    await execFileAsync('ffmpeg', [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-acodec', 'libmp3lame',
      '-b:a', '192k',
      outputPath,
    ]);
  } finally {
    await fs.unlink(listPath).catch(() => null);
  }
}

async function getDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'quiet',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    filePath,
  ]);
  const duration = Number.parseFloat(stdout.trim());
  return Number.isFinite(duration) ? duration : 0;
}

export async function runOpenAITTS(
  sections: string[],
  outputMp3: string,
  options: OpenAITTSOptions
): Promise<OpenAITTSResult> {
  const tmpDir = path.join('/tmp', `openai-tts-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const sectionSilence = path.join(tmpDir, 'silence_section.mp3');
    await generateSilence(1500, sectionSilence);

    const sectionFiles: string[] = [];
    const sectionDurations: number[] = [];

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const chunks = splitLongText(sections[sectionIndex], OPENAI_TTS_CHAR_LIMIT);
      const chunkFiles: string[] = [];

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunkPath = path.join(tmpDir, `section_${sectionIndex}_chunk_${chunkIndex}.mp3`);
        await synthesizeOpenAIChunk(chunks[chunkIndex], chunkPath, options);
        chunkFiles.push(chunkPath);
      }

      const sectionPath = path.join(tmpDir, `section_${sectionIndex}.mp3`);
      if (chunkFiles.length === 1) {
        await fs.copyFile(chunkFiles[0], sectionPath);
      } else {
        await concatFiles(chunkFiles, sectionPath);
      }

      sectionFiles.push(sectionPath);
      sectionDurations.push(Number((await getDuration(sectionPath)).toFixed(3)));
    }

    const finalParts: string[] = [];
    for (let i = 0; i < sectionFiles.length; i++) {
      finalParts.push(sectionFiles[i]);
      if (i < sectionFiles.length - 1) finalParts.push(sectionSilence);
    }

    await concatFiles(finalParts, outputMp3);
    return { sectionDurations };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
  }
}
