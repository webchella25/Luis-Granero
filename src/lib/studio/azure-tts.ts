import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const AZURE_TTS_DEFAULT_REGION = 'westeurope';
export const AZURE_TTS_DEFAULT_VOICE = 'es-ES-AlvaroNeural';
export const AZURE_TTS_DEFAULT_STYLE = '';
export const AZURE_TTS_DEFAULT_RATE = '-8%';
export const AZURE_TTS_DEFAULT_PITCH = '-8Hz';
export const AZURE_TTS_OUTPUT_FORMAT = 'audio-24khz-96kbitrate-mono-mp3';

const AZURE_SECTION_CHAR_LIMIT = 4500;

interface AzureTTSOptions {
  apiKey: string;
  region: string;
  voice: string;
  style?: string;
  rate?: string;
  pitch?: string;
}

export interface AzureTTSResult {
  sectionDurations: number[];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

function buildSsml(text: string, options: AzureTTSOptions): string {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const body = paragraphs
    .map((paragraph) => `<p>${xmlEscape(paragraph)}</p>`)
    .join('<break time="800ms"/>');

  const style = options.style?.trim();
  const rate = options.rate?.trim() || AZURE_TTS_DEFAULT_RATE;
  const pitch = options.pitch?.trim() || AZURE_TTS_DEFAULT_PITCH;

  const prosody = `<prosody rate="${xmlEscape(rate)}" pitch="${xmlEscape(pitch)}">${body}</prosody>`;
  const styled = style
    ? `<mstts:express-as style="${xmlEscape(style)}" styledegree="1.15">${prosody}</mstts:express-as>`
    : prosody;

  return [
    `<speak version="1.0" xml:lang="es-ES" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts">`,
    `<voice name="${xmlEscape(options.voice)}">`,
    styled,
    '</voice>',
    '</speak>',
  ].join('');
}

async function synthesizeAzureChunk(text: string, outputPath: string, options: AzureTTSOptions): Promise<void> {
  const region = options.region.trim() || AZURE_TTS_DEFAULT_REGION;
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': options.apiKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': AZURE_TTS_OUTPUT_FORMAT,
      'User-Agent': 'luisgranero-studio',
    },
    body: buildSsml(text, options),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Azure TTS error ${response.status}: ${body.slice(0, 300)}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.length === 0) throw new Error('Azure TTS devolvió audio vacío');
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

export async function runAzureTTS(
  sections: string[],
  outputMp3: string,
  options: AzureTTSOptions
): Promise<AzureTTSResult> {
  const tmpDir = path.join('/tmp', `azure-tts-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const sectionSilence = path.join(tmpDir, 'silence_section.mp3');
    await generateSilence(1500, sectionSilence);

    const sectionFiles: string[] = [];
    const sectionDurations: number[] = [];

    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const chunks = splitLongText(sections[sectionIndex], AZURE_SECTION_CHAR_LIMIT);
      const chunkFiles: string[] = [];

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunkPath = path.join(tmpDir, `section_${sectionIndex}_chunk_${chunkIndex}.mp3`);
        await synthesizeAzureChunk(chunks[chunkIndex], chunkPath, options);
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
