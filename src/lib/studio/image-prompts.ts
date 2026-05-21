import { exec } from 'child_process';
import { promisify } from 'util';
import type { ScriptSection } from '@/models/StudioScript';
import { callLLM, type LLMConfig } from '@/lib/studio/llm-client';

const execAsync = promisify(exec);

// ── Estilos base por motor ──
export const STYLE_PREFIX_FREEPIK =
  'cinematic scene, dramatic lighting, no text, no watermark, no faces, no logos';

export const STYLE_PREFIX_HF =
  'cinematic scene, dramatic lighting, deep shadows, no text, no watermark, photorealistic';

const SHOT_VARIETY =
  'wide establishing shot, close-up detail, atmospheric medium shot, dramatic low angle, overhead view, moody silhouette, candlelit detail, symbolic still life, product detail, environmental context';

// ── Obtener duración del audio en segundos ──
export async function getAudioDurationSeconds(audioAbsPath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioAbsPath}"`
    );
    const dur = parseFloat(stdout.trim());
    return isNaN(dur) || dur <= 0 ? 0 : dur;
  } catch {
    return 0;
  }
}

/** Estima duración a partir del número de palabras cuando no hay audio aún */
export function estimateDurationFromWords(sections: ScriptSection[]): number {
  const totalWords = sections.reduce(
    (sum, s) => sum + s.content.split(/\s+/).filter(Boolean).length,
    0
  );
  // ~140 palabras por minuto habladas
  return (totalWords / 140) * 60;
}

/** 1 imagen cada 4s · mínimo 25 · máximo 50 */
export function calculateImageCount(durationSeconds: number): number {
  if (durationSeconds <= 0) return 25;
  return Math.max(25, Math.min(50, Math.ceil(durationSeconds / 4)));
}

/**
 * Distribuye N imágenes entre M secciones proporcional al número de palabras.
 * Garantiza mínimo 1 imagen por sección.
 */
export function distributeAcrossSections(
  sections: ScriptSection[],
  numImages: number
): number[] {
  const wordCounts = sections.map(
    (s) => s.content.split(/\s+/).filter(Boolean).length
  );
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  // Distribución proporcional sin redondear (fracciones reales)
  const raw = wordCounts.map((wc) => (wc / totalWords) * numImages);

  // Floor con mínimo 1
  const result = raw.map((r) => Math.max(1, Math.floor(r)));

  // Repartir el sobrante a los que tienen mayor fracción decimal
  let remaining = numImages - result.reduce((a, b) => a + b, 0);
  const byFrac = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);

  for (let j = 0; remaining > 0 && j < byFrac.length; j++, remaining--) {
    result[byFrac[j].i]++;
  }

  return result;
}

/**
 * Genera N prompts visuales distribuidos entre secciones mediante Claude Haiku.
 * - Cada sección recibe proporciones según su peso en palabras
 * - Dentro de cada sección los prompts varían en composición/ángulo
 */
export async function generateDistributedPrompts(
  sections: ScriptSection[],
  numImages: number,
  personaje: string,
  epoca: string,
  canalConfig: LLMConfig,
  stylePrefix: string,
  canalNicho?: string
): Promise<string[]> {
  const distribution = distributeAcrossSections(sections, numImages);
  const totalNeeded = distribution.reduce((a, b) => a + b, 0);

  const sectionList = sections
    .map((s, i) => {
      const n = distribution[i];
      return `SECTION ${i + 1} — "${s.title}" → ${n} prompt${n > 1 ? 's' : ''}:\n${s.content.slice(0, 220)}...`;
    })
    .join('\n\n');

  const nichoCtx = canalNicho ? `Channel niche: ${canalNicho}. ` : '';
  const raw = await callLLM({
    system: `You are generating image prompts for a YouTube video about "${personaje}" (${epoca}). ${nichoCtx}Generate distinct English visual prompts (max 30 words each) that match the visual style and atmosphere appropriate for this topic and channel niche. Focus on objects, symbols, settings, atmosphere — NO faces, NO people.`,
    messages: [
      {
        role: 'user',
        content: `For each section below, generate the specified number of distinct visual prompts. For sections needing multiple prompts, vary the composition using: ${SHOT_VARIETY}.

${sectionList}

Output exactly ${totalNeeded} lines total (in section order), one prompt per line. No numbering, no section headers, no blank lines, no extra text.`,
      },
    ],
    maxTokens: 6000,
    model: 'fast',
    canalConfig,
  });

  const prompts = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => {
      // Descartar líneas que parezcan cabeceras o numeración generadas por el LLM
      if (/^(section|\*\*section|#)/i.test(l)) return false;
      if (/^\d+[\.\)]\s/.test(l)) return false; // "1. prompt" o "1) prompt"
      return l.length > 5;
    })
    .slice(0, numImages);

  const FALLBACK_SHOTS = [
    'dramatic low angle, deep shadows',
    'wide establishing shot, atmospheric mist',
    'close-up symbolic detail, moody lighting',
    'overhead view, cinematic composition',
    'silhouette against dark background',
    'candlelit scene, ancient artifacts',
    'environmental context, night atmosphere',
    'slow motion still, dramatic tension',
  ];

  let fallbackIdx = 0;
  while (prompts.length < numImages) {
    const shot = FALLBACK_SHOTS[fallbackIdx % FALLBACK_SHOTS.length];
    prompts.push(`${personaje} ${epoca} setting, ${shot}, no people`);
    fallbackIdx++;
  }

  return prompts.map((p) => `${stylePrefix}, ${p}`);
}
