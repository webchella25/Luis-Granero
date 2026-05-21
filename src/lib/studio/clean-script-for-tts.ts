import { ScriptSection } from '@/models/StudioScript';

// Títulos de sección a filtrar si aparecen como línea suelta en el contenido
const SECTION_TITLE_PATTERNS = [
  /^hook$/i,
  /^contexto\s+hist[oó]rico$/i,
  /^ascenso$/i,
  /^el\s+lado\s+oscuro$/i,
  /^ca[ií]da$/i,
  /^reflexi[oó]n$/i,
  /^introducci[oó]n$/i,
  /^conclusi[oó]n$/i,
  /^desarrollo$/i,
  /^cl[ií]max$/i,
  /^epilogo$/i,
  /^ep[ií]logo$/i,
];

// Patrones de metadatos a eliminar: (350 palabras), (~400 palabras), (0-30s), (30-90s)
const METADATA_PATTERNS = [
  /^\(~?\d+\s+palabras\)$/i,
  /^\(~?\d+\)$/,
  /^\(\d+-\d+s\)$/i,
  /^\(\d+s\)$/i,
  /^\[~?\d+\s+palabras\]$/i,
  /^\[~?\d+\]$/,
];

function isSectionTitle(line: string): boolean {
  const trimmed = line.trim();
  return SECTION_TITLE_PATTERNS.some((re) => re.test(trimmed));
}

function isMetadata(line: string): boolean {
  const trimmed = line.trim();
  return METADATA_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Limpia el contenido de una sección:
 * - Elimina líneas que son solo el título de sección
 * - Elimina contadores de palabras y marcas de tiempo entre paréntesis
 */
function cleanContent(content: string): string {
  return content
    .split('\n')
    .filter((line) => !isSectionTitle(line) && !isMetadata(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // colapsar saltos múltiples
    .trim();
}

/**
 * Escapa caracteres especiales para SSML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convierte párrafos de un bloque de texto en elementos <p> con breaks entre párrafos.
 */
function wrapParagraphsSSML(text: string, breakBetweenParas: string): string {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return paragraphs
    .map((p) => `<p>${escapeXml(p.trim())}</p>`)
    .join(`\n  ${breakBetweenParas}\n  `);
}

/**
 * Recibe el array de secciones del guión y devuelve el texto limpio
 * listo para el motor de narración seleccionado.
 *
 * - edge-tts: devuelve SSML completo con <speak>, <p> y <break>
 * - elevenlabs: devuelve texto plano con <break time="1.5s"/> entre secciones
 */
/**
 * Devuelve las secciones limpias como array de strings planos (sin SSML ni JSON).
 * Útil para motores TTS que no usan SSML: NVIDIA, Gemini, etc.
 */
export function getCleanedSections(sections: ScriptSection[]): string[] {
  return sections.map((s) => cleanContent(s.content)).filter(Boolean);
}

const DRAMATIC_TONES = new Set(['oscuro', 'misterioso']);

// Palabras que generan impacto emocional — se añade micro-silencio tras ellas
const DRAMATIC_WORDS: Array<[string, string]> = [
  ['murió', '0.5s'],      ['muerte', '0.5s'],     ['muerto', '0.4s'],     ['muerta', '0.4s'],
  ['asesinó', '0.5s'],    ['asesinado', '0.4s'],  ['asesinada', '0.4s'],  ['asesinaron', '0.5s'],
  ['desapareció', '0.6s'],['desaparecido', '0.5s'],['desaparecida', '0.5s'],
  ['bomba', '0.5s'],      ['explotó', '0.5s'],    ['explosión', '0.4s'],
  ['masacre', '0.5s'],    ['cadáver', '0.5s'],    ['cadáveres', '0.5s'],
  ['torturó', '0.5s'],    ['tortura', '0.4s'],
  ['secuestró', '0.5s'],  ['secuestrada', '0.5s'],
  ['ejecutó', '0.5s'],    ['ejecutado', '0.4s'],
  ['disparó', '0.4s'],    ['dispararon', '0.4s'],
  ['sangre', '0.4s'],     ['horror', '0.4s'],
  ['víctima', '0.4s'],    ['víctimas', '0.4s'],
];

function addDramaticWordPauses(text: string): string {
  let result = text;
  for (const [word, duration] of DRAMATIC_WORDS) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Coincide con la palabra seguida de puntuación opcional y espacio o fin de cadena
    const regex = new RegExp(`(${escaped})([.,;:]?)(\\s|$)`, 'gi');
    result = result.replace(regex, (_m, w: string, p: string, s: string) => `${w}${p} <break time="${duration}"/>${s}`);
  }
  return result;
}

function addSuspensePauses(text: string): string {
  return addDramaticWordPauses(text)
    // Pausa media tras pregunta retórica
    .replace(/\?(\s)/g, '? <break time="0.6s"/>$1')
    // Pausa corta tras exclamación dramática
    .replace(/!(\s)/g, '! <break time="0.4s"/>$1')
    // Pausa larga tras puntos suspensivos
    .replace(/\.{3}(\s|$)/g, '... <break time="0.8s"/>$1');
}

// Frase aislada corta (≤4 palabras) → pausa de tensión después
function applyShortSentencePause(paragraph: string): string {
  const trimmed = paragraph.trim();
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 4 && /[.!?]$/.test(trimmed)) {
    return trimmed + ' <break time="0.5s"/>';
  }
  return trimmed;
}

export function cleanScriptForTTS(
  sections: ScriptSection[],
  engine: 'elevenlabs' | 'edge-tts',
  tono?: string
): string {
  const cleaned = sections
    .map((s) => cleanContent(s.content))
    .filter(Boolean);

  if (engine === 'edge-tts') {
    // JSON con secciones separadas — el script Python añade silencios reales con pydub
    return JSON.stringify({
      sections: cleaned,
      pause_between: 1500,
      pause_paragraph: 800,
    });
  }

  const isDramatic = DRAMATIC_TONES.has(tono ?? '');

  // ElevenLabs: pausa entre secciones con <break> SSML
  const sectionBreak = isDramatic ? '\n\n<break time="1.8s"/>\n\n' : '\n\n<break time="1.2s"/>\n\n';
  const paraBreak = '\n\n';

  return cleaned
    .map((text) =>
      text
        .split(/\n\n+/)
        .filter(Boolean)
        .map((p) => {
          const withShortPause = isDramatic ? applyShortSentencePause(p) : p.trim();
          return isDramatic ? addSuspensePauses(withShortPause) : withShortPause;
        })
        .join(paraBreak)
    )
    .join(sectionBreak);
}
