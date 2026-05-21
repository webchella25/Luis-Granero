import { NextRequest, NextResponse } from 'next/server';
import { getStudioSession } from '@/lib/studio/session';
import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import StudioScript, { ScriptSection } from '@/models/StudioScript';
import StudioCanal from '@/models/StudioCanal';
import StudioMusicTrack, { type MusicCategory } from '@/models/StudioMusicTrack';
import { callLLM, extractJSON, type LLMConfig } from '@/lib/studio/llm-client';

const execAsync = promisify(exec);

const BEBAS_FONT = path.join(process.cwd(), 'public/studio/fonts/BebasNeue-Regular.ttf');
const FALLBACK_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const SHORT_MAX_DURATION = 58;
const HOOK_SILENCE = 1.5; // segundos de silencio + hook visual al inicio
const SMART_SHORT_COUNT = 3;

interface SmartShortCandidate {
  id: string;
  sourceSeccion: number;
  sectionTitle: string;
  text: string;
  start: number;
  duration: number;
  score: number;
  reason: string;
}

async function selectTrack(categoria: MusicCategory, canal_id: string): Promise<string | null> {
  const tracks = await StudioMusicTrack.find({ categoria, canal_id }).lean() as { archivo_path: string }[];
  if (tracks.length === 0) return null;
  const picked = tracks[Math.floor(Math.random() * tracks.length)];
  return (picked as { archivo_path: string }).archivo_path;
}

function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else { const full = stderr.join(''); const lastLines = full.split('\n').filter(l => l.trim() && !l.startsWith(' ') && !l.startsWith('\t')).slice(-8).join('\n'); reject(new Error(`FFmpeg salió con código ${code}: ${lastLines || full.slice(-800)}`)); }
    });
    proc.on('error', reject);
  });
}

function escapeDt(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '')
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function splitIntoBlocks(text: string, wordsPerBlock = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const blocks: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerBlock) {
    blocks.push(words.slice(i, i + wordsPerBlock).join(' '));
  }
  return blocks;
}

function wrapLine(line: string, maxChars = 18): string {
  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.join('\n');
}

function generateShortTitle(
  sectionTitle: string,
  personaje: string,
  content: string,
  canalNombre: string
): string {
  const tag = canalNombre.replace(/\s+/g, '');
  const firstSentence = (content.split(/[.!?]/)[0] ?? '').trim().slice(0, 55);
  if (sectionTitle.toLowerCase().includes('hook')) {
    return `¿Sabías que ${firstSentence.toLowerCase()}? #${personaje.split(' ')[0]} #${tag}`.slice(0, 100);
  }
  return `${personaje} — ${sectionTitle} #Shorts #${tag}`.slice(0, 100);
}

function generateSmartShortTitle(candidate: SmartShortCandidate, personaje: string, canalNombre: string): string {
  const tag = canalNombre.replace(/\s+/g, '');
  const clean = candidate.text
    .replace(/\s+/g, ' ')
    .replace(/^[¿¡"']+/, '')
    .trim();
  const first = clean.split(/[.!?]/)[0]?.trim().slice(0, 58) || candidate.sectionTitle;
  return `${first}... #Shorts #${tag}`.slice(0, 100);
}

function normalizeSeoText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortHashtag(text: string): string {
  return normalizeSeoText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function inferShortAngle(candidate: SmartShortCandidate): string {
  const title = candidate.sectionTitle.toLowerCase();
  const text = `${candidate.sectionTitle} ${candidate.reason} ${candidate.text}`.toLowerCase();
  if (/perspectiva|impacto/.test(title)) return 'El fallo que marcó la investigación';
  if (/reflexi[oó]n|final|cierre/.test(title)) return 'La pregunta que sigue abierta';
  if (/introducci[oó]n|contexto/.test(title)) return 'La desaparición que no encajaba';
  if (/desarrollo|cronolog/.test(title)) return 'La contradicción que cambió el caso';
  if (/profundizaci[oó]n|puntos clave/.test(title)) return 'Los nueve días que nadie explica';
  if (/\b(prueba|evidencia|investigaci[oó]n|testigo|declaraci[oó]n|coartada)\b/.test(text)) return 'La pista que cambió la investigación';
  if (/\b(mint[iió]|ocult[oó]|secreto|contradicci[oó]n|extraño|raro|no encaj)\b/.test(text)) return 'El detalle que no encajaba';
  if (/\b(descubri[oó]|encontraron|hallazgo|apareci[oó])\b/.test(text)) return 'El hallazgo que lo cambió todo';
  if (/\b(muerte|cad[aá]ver|desapareci[oó]|crimen)\b/.test(text)) return 'El momento más inquietante del caso';
  return 'La parte que casi nadie recuerda';
}

function generateSmartShortSeo(
  candidate: SmartShortCandidate,
  personaje: string,
  canalNombre: string
): { titulo: string; descripcion: string; tags: string[] } {
  const cleanPersonaje = normalizeSeoText(personaje);
  const cleanCanal = normalizeSeoText(canalNombre);
  const caseTag = shortHashtag(cleanPersonaje);
  const channelTag = shortHashtag(cleanCanal);
  const angle = inferShortAngle(candidate);
  const titleCore = `${cleanPersonaje}: ${angle}`;
  const titulo = `${titleCore} #Shorts`.slice(0, 95);
  const descripcion = [
    `${cleanPersonaje}: ${angle.toLowerCase()}.`,
    'Un corte clave del caso en menos de un minuto.',
    'Mira el vídeo completo para entender qué pasó realmente.',
    `#Shorts #${caseTag} #TrueCrime`,
  ].join('\n');
  const tags = [
    cleanPersonaje,
    cleanPersonaje.replace(/^Caso\s+/i, ''),
    `caso ${cleanPersonaje.replace(/^Caso\s+/i, '')}`.trim(),
    'true crime español',
    'crimen real',
    'casos reales',
    'misterios criminales',
    'investigación criminal',
    'documental true crime',
    'YouTube Shorts',
    cleanCanal,
    channelTag,
  ]
    .map(normalizeSeoText)
    .filter((tag, idx, arr) => tag && arr.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === idx)
    .slice(0, 12);

  return { titulo, descripcion, tags };
}

function splitSentences(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6);
  if (sentences.length > 0) return sentences;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 28) {
    chunks.push(words.slice(i, i + 28).join(' '));
  }
  return chunks.filter((s) => s.split(/\s+/).length >= 6);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function scoreTextForRetention(text: string): { score: number; reason: string } {
  const t = text.toLowerCase();
  const signals: Array<[RegExp, number, string]> = [
    [/\b(pero|sin embargo|aunque|hasta que|entonces)\b/g, 10, 'contraste'],
    [/\b(descubri[oó]|revel[oó]|confes[oó]|ocult[oó]|mint[iió]|secreto|verdad)\b/g, 18, 'revelación'],
    [/\b(muerte|asesin|crimen|cad[aá]ver|sangre|desapareci[oó]|víctima|victima)\b/g, 16, 'impacto true crime'],
    [/\b(sospech|culpable|prueba|evidencia|coartada|testigo|investigaci[oó]n)\b/g, 14, 'investigación'],
    [/\b(nadie|nunca|jam[aá]s|imposible|extraño|inquietante|terrible)\b/g, 9, 'curiosidad'],
    [/[¿?]/g, 8, 'pregunta abierta'],
  ];

  const reasons = new Set<string>();
  let score = Math.min(30, Math.round(wordCount(text) / 2));
  for (const [regex, points, reason] of signals) {
    const matches = t.match(regex);
    if (matches?.length) {
      score += Math.min(points * matches.length, points * 2);
      reasons.add(reason);
    }
  }

  const words = wordCount(text);
  if (words >= 55 && words <= 115) score += 18;
  else if (words < 35 || words > 145) score -= 20;

  return {
    score,
    reason: Array.from(reasons).slice(0, 3).join(', ') || 'momento narrativo compacto',
  };
}

function buildSectionTimings(
  sections: ScriptSection[],
  totalDuration: number,
  sectionDurations?: number[]
): { start: number; duration: number }[] {
  if (sectionDurations?.length === sections.length && sectionDurations.every((d) => Number.isFinite(d) && d > 0)) {
    let cursor = 0;
    return sectionDurations.map((duration) => {
      const timing = { start: cursor, duration };
      cursor += duration + 1.5;
      return timing;
    });
  }

  const counts = sections.map((s) => wordCount(s.content));
  const totalWords = counts.reduce((a, b) => a + b, 0) || 1;
  let cursor = 0;
  return counts.map((count) => {
    const duration = (count / totalWords) * totalDuration;
    const timing = { start: cursor, duration };
    cursor += duration;
    return timing;
  });
}

function buildSmartCandidates(
  sections: ScriptSection[],
  totalDuration: number,
  sectionDurations?: number[]
): SmartShortCandidate[] {
  const timings = buildSectionTimings(sections, totalDuration, sectionDurations);
  const candidates: SmartShortCandidate[] = [];

  sections.forEach((section, sourceSeccion) => {
    const sentences = splitSentences(section.content);
    if (sentences.length === 0) return;

    const sectionWords = Math.max(wordCount(section.content), 1);
    const sectionTiming = timings[sourceSeccion] ?? { start: 0, duration: totalDuration / Math.max(sections.length, 1) };
    const wordsPerSecond = sectionWords / Math.max(sectionTiming.duration, 1);
    let wordsBefore = 0;

    for (let i = 0; i < sentences.length; i++) {
      let text = '';
      let words = 0;
      for (let j = i; j < sentences.length && words < 115; j++) {
        text = `${text} ${sentences[j]}`.trim();
        words = wordCount(text);
        if (words >= 45) {
          const rawDuration = words / Math.max(wordsPerSecond, 1.6);
          const duration = Math.max(18, Math.min(SHORT_MAX_DURATION - HOOK_SILENCE, rawDuration));
          const start = sectionTiming.start + (wordsBefore / sectionWords) * sectionTiming.duration;
          const scored = scoreTextForRetention(text);
          candidates.push({
            id: `s${sourceSeccion}_${i}_${j}`,
            sourceSeccion,
            sectionTitle: section.title,
            text,
            start,
            duration,
            score: scored.score,
            reason: scored.reason,
          });
        }
      }
      wordsBefore += wordCount(sentences[i]);
    }
  });

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 80);
}

function pickDiverseCandidates(
  candidates: SmartShortCandidate[],
  count: number,
  poolSize: number
): SmartShortCandidate[] {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const picked: SmartShortCandidate[] = [];
  const usedSections = new Set<number>();

  for (const candidate of sorted) {
    if (usedSections.has(candidate.sourceSeccion)) continue;
    picked.push(candidate);
    usedSections.add(candidate.sourceSeccion);
    if (picked.length >= count) break;
  }

  for (const candidate of sorted) {
    if (picked.length >= poolSize) break;
    if (!picked.some((item) => item.id === candidate.id)) picked.push(candidate);
  }

  return picked.slice(0, poolSize);
}

async function selectBestSmartShorts(
  candidates: SmartShortCandidate[],
  canalConfig: LLMConfig
): Promise<SmartShortCandidate[]> {
  if (candidates.length <= SMART_SHORT_COUNT) return candidates;

  try {
    const raw = await callLLM({
      system:
        'Eres editor senior de YouTube Shorts para true crime. Elige exactamente 3 clips con máxima retención: gancho inmediato, revelación o sospecha clara, tensión creciente y cierre que invite al vídeo largo. Evita elegir clips repetidos o meramente descriptivos. Responde solo JSON válido.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            tarea: 'Devuelve {"clips":[{"id":"...","reason":"...","score":0}]} con los 3 mejores IDs.',
            candidatos: candidates.map((c) => ({
              id: c.id,
              seccion: c.sourceSeccion,
              titulo: c.sectionTitle,
              texto: c.text.slice(0, 650),
              score_heuristico: c.score,
              motivo_heuristico: c.reason,
            })),
          }),
        },
      ],
      maxTokens: 500,
      model: 'fast',
      canalConfig,
    });
    const parsed = JSON.parse(extractJSON(raw)) as { clips?: { id?: string; reason?: string; score?: number }[] };
    const picked: SmartShortCandidate[] = [];
    for (const item of parsed.clips ?? []) {
      const match = candidates.find((c) => c.id === item.id);
      if (match && !picked.some((p) => p.sourceSeccion === match.sourceSeccion)) {
        picked.push({
          ...match,
          reason: item.reason?.slice(0, 180) || match.reason,
          score: Number.isFinite(item.score) ? Math.max(match.score, item.score ?? match.score) : match.score,
        });
      }
      if (picked.length === SMART_SHORT_COUNT) break;
    }
    if (picked.length < SMART_SHORT_COUNT) {
      for (const candidate of candidates) {
        if (picked.length === SMART_SHORT_COUNT) break;
        if (picked.some((p) => p.id === candidate.id || p.sourceSeccion === candidate.sourceSeccion)) continue;
        picked.push(candidate);
      }
    }
    if (picked.length < SMART_SHORT_COUNT) {
      for (const candidate of candidates) {
        if (picked.length === SMART_SHORT_COUNT) break;
        if (!picked.some((p) => p.id === candidate.id)) picked.push(candidate);
      }
    }
    if (picked.length === SMART_SHORT_COUNT) return picked;
  } catch {
    // fallback heurístico
  }

  const picked: SmartShortCandidate[] = [];
  for (const candidate of candidates) {
    if (picked.some((p) => p.sourceSeccion === candidate.sourceSeccion)) continue;
    picked.push(candidate);
    if (picked.length === SMART_SHORT_COUNT) break;
  }
  for (const candidate of candidates) {
    if (picked.length === SMART_SHORT_COUNT) break;
    if (!picked.some((p) => p.id === candidate.id)) picked.push(candidate);
  }
  return picked.length > 0 ? picked : candidates.slice(0, SMART_SHORT_COUNT);
}

async function getAudioDuration(audioAbsPath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioAbsPath}"`
  );
  return parseFloat(stdout.trim());
}

async function generateHookVisual(
  personaje: string,
  sectionTitle: string,
  sectionText: string,
  canalConfig: LLMConfig
): Promise<{ linea1: string; linea2: string }> {
  try {
    const raw = await callLLM({
      system:
        'Generas textos de impacto para YouTube Shorts. Máximo 4 palabras en total, divididas en exactamente 2 líneas cortas. Responde solo con JSON válido, sin markdown.',
      messages: [
        {
          role: 'user',
          content: `Canal: ${personaje}. Sección: ${sectionTitle}. Texto: "${sectionText.slice(0, 120)}". Dame el texto de impacto: {"linea1":"...","linea2":"..."}`,
        },
      ],
      maxTokens: 80,
      model: 'fast',
      canalConfig,
    });
    const parsed = JSON.parse(extractJSON(raw)) as { linea1?: string; linea2?: string };
    if (parsed.linea1 && parsed.linea2) {
      return { linea1: parsed.linea1.toUpperCase(), linea2: parsed.linea2.toUpperCase() };
    }
  } catch {
    // fallback silencioso
  }
  return { linea1: '¿LO SABÍAS', linea2: 'TODO?' };
}

async function buildShortForSection(params: {
  seccionIdx: number;
  sectionTitle: string;
  personaje: string;
  canalNombre: string;
  canalConfig: LLMConfig;
  canal_id: string;
  imageAbsPath: string;
  audioAbsPath: string;
  audioStart: number;
  audioDuration: number;
  sectionText: string;
  outputPath: string;
  tmpDir: string;
}): Promise<{ hookVisual: { linea1: string; linea2: string } }> {
  const {
    seccionIdx, sectionTitle, personaje, canalNombre, canalConfig, canal_id,
    imageAbsPath, audioAbsPath, audioStart, audioDuration,
    sectionText, outputPath, tmpDir,
  } = params;

  let fontPath = BEBAS_FONT;
  try { await fs.access(BEBAS_FONT); } catch { fontPath = FALLBACK_FONT; }

  const TOTAL_DUR = audioDuration + HOOK_SILENCE;
  const FPS = 24;
  const totalFrames = Math.round(TOTAL_DUR * FPS);
  const totalDurStr = TOTAL_DUR.toFixed(3);

  // ── 1. Hook visual (LLM) ────────────────────────────────────────────────────
  const hookVisual = await generateHookVisual(personaje, sectionTitle, sectionText, canalConfig);

  // ── 2. Extraer audio + añadir 1.5s de silencio al inicio ───────────────────
  const shortAudioPath = path.join(tmpDir, `audio_sec_${seccionIdx}.mp3`);
  await runFFmpeg([
    '-i', audioAbsPath,
    '-ss', audioStart.toFixed(3),
    '-t', audioDuration.toFixed(3),
    '-af', 'adelay=delays=1500:all=1',
    '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100',
    '-y', shortAudioPath,
  ]);

  // ── 3. Música de fondo por canal ──────────────────────────────────────────
  const publicDir = path.join(process.cwd(), 'public');
  let bgMusicPath: string | null = null;
  try {
    const trackRelPath = await selectTrack('desarrollo', canal_id);
    if (trackRelPath) {
      bgMusicPath = path.join(publicDir, trackRelPath.split('?')[0]);
    }
  } catch { /* sin música */ }

  // ── 4. Construir cadena de filtros de texto ────────────────────────────────

  // Overlay oscuro
  const darkOverlay = 'eq=brightness=-0.08:contrast=1.05';

  // Mejora 2: Hook visual — primeros 1.5s
  const h1 = escapeDt(hookVisual.linea1);
  const h2 = escapeDt(hookVisual.linea2);
  const hookFilters = [
    `drawtext=fontfile='${fontPath}':text='${h1}':fontsize=140:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h*0.38:enable='between(t,0,1.5)':alpha='if(lt(t,1.2),1,max(0,1-(t-1.2)/0.3))'`,
    `drawtext=fontfile='${fontPath}':text='${h2}':fontsize=140:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h*0.52:enable='between(t,0,1.5)':alpha='if(lt(t,1.2),1,max(0,1-(t-1.2)/0.3))'`,
  ];

  // Mejora 3: Barra de progreso roja en la parte inferior
  const progressBar = `drawbox=x=0:y=ih-8:w='iw*t/${totalDurStr}':h=8:color=0xFF0000@0.9:thickness=fill`;

  // Mejora 1: Subtítulos sincronizados — 3 palabras, desde t=1.5
  const blocks = splitIntoBlocks(sectionText, 3);
  const blockDur = audioDuration / Math.max(blocks.length, 1);
  const subtitleFilters = blocks.map((block, idx) => {
    const tStart = (HOOK_SILENCE + idx * blockDur).toFixed(3);
    const tEnd   = (HOOK_SILENCE + (idx + 1) * blockDur).toFixed(3);
    const wrapped = escapeDt(wrapLine(block.toUpperCase(), 18));
    return `drawtext=fontfile='${fontPath}':text='${wrapped}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=h*0.72:borderw=4:bordercolor=black:line_spacing=8:enable='between(t,${tStart},${tEnd})'`;
  });

  // Mejora 4: CTA últimos 3 segundos
  const ctaStart = Math.max(HOOK_SILENCE, TOTAL_DUR - 3).toFixed(3);
  const ctaFilters = [
    `drawtext=fontfile='${fontPath}':text='VER VÍDEO COMPLETO':fontcolor=white:fontsize=65:x=(w-text_w)/2:y=h*0.82:borderw=3:bordercolor=black:enable='gte(t,${ctaStart})':alpha='if(lt(t-${ctaStart},0.3),(t-${ctaStart})/0.3,1)'`,
    `drawtext=fontfile='${fontPath}':text='${escapeDt(canalNombre.toUpperCase())}':fontcolor=0xAAAAAA:fontsize=38:x=(w-text_w)/2:y=h*0.92:shadowcolor=black@0.8:shadowx=2:shadowy=2:enable='gte(t,${ctaStart})'`,
  ];

  const fadeIn  = 'fade=t=in:st=0:d=0.4';
  const fadeOut = `fade=t=out:st=${(TOTAL_DUR - 0.4).toFixed(3)}:d=0.4`;

  // ── 5. Compositing + Ken Burns + filtros ───────────────────────────────────
  const blurBg  = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:20';
  const fgScale = 'scale=1080:-1';
  const zoompan = `zoompan=z='max(1.10-0.10*on/${totalFrames},1.0)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${FPS}`;

  const textChain = [
    darkOverlay,
    ...hookFilters,
    progressBar,
    ...subtitleFilters,
    ...ctaFilters,
    fadeIn,
    fadeOut,
  ].join(',');

  const filterComplex = [
    `[0:v]split[bg_raw][fg_raw]`,
    `[bg_raw]${blurBg}[blurred]`,
    `[fg_raw]${fgScale}[fg]`,
    `[blurred][fg]overlay=(W-w)/2:(H-h)/2[composed]`,
    `[composed]${zoompan}[zoomed]`,
    `[zoomed]${textChain}[vout]`,
  ].join(';');

  // ── 6. FFmpeg final ────────────────────────────────────────────────────────
  // Mejora 5: música al 25% en Shorts
  const audioFilter = bgMusicPath
    ? filterComplex + `;[1:a][2:a]amix=inputs=2:weights=1 0.25:normalize=0[aout]`
    : filterComplex;

  const baseArgs = [
    '-loop', '1', '-i', imageAbsPath,
    '-i', shortAudioPath,
    ...(bgMusicPath ? ['-stream_loop', '-1', '-i', bgMusicPath] : []),
    '-filter_complex', audioFilter,
    '-map', '[vout]',
    ...(bgMusicPath ? ['-map', '[aout]'] : ['-map', '1:a']),
    '-t', String(TOTAL_DUR), '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart',
    '-y', outputPath,
  ];

  await runFFmpeg(baseArgs);

  await fs.unlink(shortAudioPath).catch(() => null);

  return { hookVisual };
}

async function generateShortsBackground(
  scriptId: string,
  personaje: string,
  canalNombre: string,
  canalConfig: LLMConfig,
  canal_id: string,
  guionSections: ScriptSection[],
  imagesPaths: string[],
  audioAbsPath: string,
  clips: SmartShortCandidate[]
): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const shortsDir = path.join(publicDir, 'studio', 'shorts');
  const tmpDir = path.join('/tmp', `studio-shorts-${scriptId}`);
  await fs.mkdir(shortsDir, { recursive: true });
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    const runId = Date.now();
    for (let slotIdx = 0; slotIdx < clips.length; slotIdx++) {
      const clip = clips[slotIdx];
      const seccionIdx = slotIdx;
      const section = guionSections[clip.sourceSeccion];
      if (!section) continue;

      const startTime = clip.start;
      const audioDuration = Math.min(clip.duration, SHORT_MAX_DURATION - HOOK_SILENCE);

      const imgIdx = Math.min(clip.sourceSeccion, imagesPaths.length - 1);
      const imgRaw = imagesPaths[imgIdx];
      const cleanImgRaw = imgRaw?.split('?')[0];
      const imgApiMatch = cleanImgRaw?.match(/\/api\/studio\/image\/([^/]+)\/([^/]+)$/);
      const imageAbsPath = imgApiMatch
        ? path.join(publicDir, 'studio', 'images', imgApiMatch[1], imgApiMatch[2])
        : path.join(publicDir, cleanImgRaw ?? '');

      const outputFilename = `${scriptId}-short-${slotIdx + 1}-${runId}.mp4`;
      const outputPath = path.join(shortsDir, outputFilename);
      const shortPath = `/api/studio/short/${outputFilename}`;

      try {
        const { hookVisual } = await buildShortForSection({
          seccionIdx,
          sectionTitle: section.title,
          personaje,
          canalNombre,
          canalConfig,
          canal_id,
          imageAbsPath,
          audioAbsPath,
          audioStart: startTime,
          audioDuration,
          sectionText: clip.text,
          outputPath,
          tmpDir,
        });

        await connectDB();
        const s = await StudioScript.findById(scriptId);
        if (s) {
          const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccionIdx);
          if (entry) {
            entry.path = shortPath;
            entry.status = 'ready';
            entry.hook_visual = hookVisual;
            entry.source_seccion = clip.sourceSeccion;
            entry.clip_start = Number(clip.start.toFixed(2));
            entry.clip_duration = Number(audioDuration.toFixed(2));
            entry.clip_score = Math.round(clip.score);
            entry.clip_reason = clip.reason;
          }
          await s.save();
          console.log(`✅ Short inteligente ${slotIdx + 1} listo: ${shortPath}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        console.error(`Error generando Short inteligente ${slotIdx + 1}:`, msg);
        await connectDB();
        const s = await StudioScript.findById(scriptId);
        if (s) {
          const entry = (s.shorts ?? []).find((sh) => sh.seccion === seccionIdx);
          if (entry) {
            entry.status = 'error';
            entry.error = msg.slice(0, 500);
          }
          await s.save();
        }
      }
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => null);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = getStudioSession(request);
    if (!session?.canal_id) {
      return NextResponse.json({ error: 'Canal no seleccionado' }, { status: 400 });
    }

    const body = (await request.json()) as { scriptId?: string; secciones?: number[]; modo?: 'auto' | 'manual'; cantidad?: number };
    const { scriptId } = body;
    const useSmartSelection = body.modo !== 'manual';
    const requestedCount = Math.max(1, Math.min(SMART_SHORT_COUNT, body.cantidad ?? SMART_SHORT_COUNT));
    const secciones = (body.secciones ?? []).filter((s) => Number.isInteger(s) && s >= 0);

    if (!scriptId) return NextResponse.json({ error: 'scriptId es obligatorio' }, { status: 400 });
    if (!useSmartSelection && secciones.length === 0) return NextResponse.json({ error: 'No hay secciones válidas' }, { status: 400 });

    await connectDB();
    const [script, canal] = await Promise.all([
      StudioScript.findById(scriptId),
      StudioCanal.findById(session.canal_id).select('nombre config').lean() as Promise<{ nombre?: string; config?: LLMConfig } | null>,
    ]);

    if (!script) return NextResponse.json({ error: 'Guión no encontrado' }, { status: 404 });
    if (!script.audio_path) return NextResponse.json({ error: 'El guión no tiene narración' }, { status: 400 });
    if (!script.images_paths?.length) return NextResponse.json({ error: 'El guión no tiene imágenes' }, { status: 400 });

    const existingShorts = script.shorts ?? [];
    const processingSlots = useSmartSelection
      ? Array.from({ length: requestedCount }, (_, idx) => idx)
      : secciones;
    const alreadyProcessing = processingSlots.some(
      (s) => existingShorts.find((sh) => sh.seccion === s)?.status === 'processing'
    );
    if (alreadyProcessing) {
      return NextResponse.json({ status: 'processing', message: 'Alguna sección ya está en proceso' });
    }

    const guionSections = (script.guion_json ?? []) as ScriptSection[];
    const personaje = (script.personaje as string | undefined) ?? '';
    const canalNombre = canal?.nombre ?? personaje ?? 'STUDIO';
    const canalConfig = (canal?.config as LLMConfig | undefined) ?? {};
    const publicDir = path.join(process.cwd(), 'public');
    const audioAbsPath = path.join(publicDir, script.audio_path as string);
    const totalDuration = await getAudioDuration(audioAbsPath);

    const smartCandidates = useSmartSelection
      ? pickDiverseCandidates(
          buildSmartCandidates(guionSections, totalDuration, script.audio_section_durations),
          requestedCount,
          Math.max(18, requestedCount * 8)
        )
      : [];

    const clips = useSmartSelection
      ? (await selectBestSmartShorts(smartCandidates, canalConfig)).slice(0, requestedCount)
      : secciones.map((sourceSeccion, idx) => {
          const section = guionSections[sourceSeccion];
          const timings = buildSectionTimings(guionSections, totalDuration, script.audio_section_durations);
          const timing = timings[sourceSeccion] ?? { start: 0, duration: SHORT_MAX_DURATION - HOOK_SILENCE };
          return {
            id: `manual_${sourceSeccion}`,
            sourceSeccion,
            sectionTitle: section?.title ?? `Sección ${sourceSeccion + 1}`,
            text: section?.content ?? '',
            start: timing.start,
            duration: Math.min(timing.duration, SHORT_MAX_DURATION - HOOK_SILENCE),
            score: 0,
            reason: 'selección manual',
          };
        });

    if (clips.length === 0) {
      return NextResponse.json({ error: 'No he encontrado momentos válidos para Short' }, { status: 400 });
    }

    const shortSlots = clips.map((_, idx) => idx);

    const updatedShorts = [...existingShorts.filter((sh) => !secciones.includes(sh.seccion))];
    const cleanedExistingShorts = useSmartSelection ? [] : updatedShorts;

    const nextShorts = [...cleanedExistingShorts];
    for (let slotIdx = 0; slotIdx < clips.length; slotIdx++) {
      const clip = clips[slotIdx];
      const section = guionSections[clip.sourceSeccion];
      const shortSeo = generateSmartShortSeo(clip, personaje, canalNombre);
      const titulo = useSmartSelection
        ? shortSeo.titulo
        : section
          ? generateShortTitle(section.title, personaje, section.content, canalNombre)
          : '';
      nextShorts.push({
        seccion: slotIdx,
        titulo,
        descripcion: shortSeo.descripcion,
        tags: shortSeo.tags,
        path: null,
        status: 'processing',
        youtube_status: 'idle',
        source_seccion: clip.sourceSeccion,
        clip_start: Number(clip.start.toFixed(2)),
        clip_duration: Number(clip.duration.toFixed(2)),
        clip_score: Math.round(clip.score),
        clip_reason: clip.reason,
      });
    }
    script.shorts = nextShorts;
    await script.save();

    const imagesPaths = script.images_paths as string[];
    const sid = scriptId;

    generateShortsBackground(
      sid, personaje, canalNombre, canalConfig, session.canal_id,
      guionSections, imagesPaths, audioAbsPath, clips
    ).catch(console.error);

    return NextResponse.json({ status: 'processing', secciones: shortSlots, clips: clips.map((c, idx) => ({
      seccion: idx,
      source_seccion: c.sourceSeccion,
      start: c.start,
      duration: c.duration,
      reason: c.reason,
    })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Error iniciando generación de Shorts:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
