// src/lib/scraper/socialMediaValidator.js
/**
 * Validación de resultados de búsqueda de redes sociales via SerpApi.
 *
 * Reglas antes de aceptar una URL encontrada:
 *  1. El slug/username de la URL debe contener al menos una palabra del nombre del negocio.
 *  2. Si el negocio tiene teléfono, el snippet debe mencionar el teléfono O el nombre.
 *  3. El score de similitud entre el nombre del negocio y el título/snippet debe ser >= 40%.
 */

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'los', 'las', 'del', 'y', 'e', 'o', 'a', 'en', 'con', 'por',
  'para', 'un', 'una', 'unos', 'unas', 'su', 'sus', 'al', 'lo', 'le', 'les',
  'the', 'and', 'of', 'in', 'at', 'for', 'to', 'is', 'are', 'was',
  'sl', 'sa', 'slu', 'cb', 'sc', 'ltd', 'llc', 'srl'
]);

/**
 * Normaliza texto: minúsculas, sin acentos, solo alfanumérico
 */
function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eliminar acentos
    .replace(/[^a-z0-9\s]/g, ' ')    // reemplazar especiales por espacio
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae palabras clave del nombre del negocio (min 3 chars, sin stop words)
 */
function extractKeywords(businessName) {
  const normalized = normalizeText(businessName);
  return normalized
    .split(' ')
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

/**
 * Calcula qué porcentaje de palabras clave del negocio aparecen en el texto.
 * Retorna 0-100.
 */
function calculateNameMatchScore(businessName, text) {
  const keywords = extractKeywords(businessName);
  if (!keywords.length) return 100; // sin keywords → no podemos invalidar

  const textNormalized = normalizeText(text);
  const matching = keywords.filter(kw => textNormalized.includes(kw));
  return Math.round((matching.length / keywords.length) * 100);
}

/**
 * Verifica si el slug/username de la URL contiene al menos una palabra del negocio.
 * "Talleres Serpis" → URL debe contener "taller" o "serpis"
 */
function slugContainsKeyword(url, businessName) {
  const keywords = extractKeywords(businessName);
  if (!keywords.length) return true;

  const urlNormalized = normalizeText(url);
  return keywords.some(kw => urlNormalized.includes(kw));
}

/**
 * Valida si un resultado de SerpApi es válido para el negocio dado.
 *
 * @param {object} result  - Resultado de SerpApi { link, title, snippet }
 * @param {string} businessName - Nombre del negocio
 * @param {string|null} phone   - Teléfono del negocio (opcional)
 * @returns {{ valid: boolean, reason: string }}
 */
export function validateSocialResult(result, businessName, phone = null) {
  const link    = result.link    || '';
  const title   = result.title   || '';
  const snippet = result.snippet || '';
  const combined = `${title} ${snippet}`;

  // ── Regla 1: URL slug contiene al menos una keyword del negocio ────────
  if (!slugContainsKeyword(link, businessName)) {
    const keywords = extractKeywords(businessName);
    return {
      valid: false,
      reason: `URL slug "${link}" no contiene ninguna de las keywords [${keywords.join(', ')}] de "${businessName}"`
    };
  }

  // ── Regla 2: Si hay teléfono, snippet debe mencionar teléfono o nombre ──
  if (phone) {
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length >= 6) {
      const snippetDigits = snippet.replace(/\D/g, '');
      const phoneInSnippet = snippetDigits.includes(phoneDigits.slice(-6));
      const nameScore = calculateNameMatchScore(businessName, combined);
      const nameInContent = nameScore >= 30;

      if (!phoneInSnippet && !nameInContent) {
        return {
          valid: false,
          reason: `Teléfono ${phone} no aparece en snippet y nombre tiene solo ${nameScore}% de coincidencia`
        };
      }
    }
  }

  // ── Regla 3: Similitud mínima del 40% entre nombre y título/snippet ─────
  const titleScore   = calculateNameMatchScore(businessName, title);
  const snippetScore = calculateNameMatchScore(businessName, snippet);
  const maxScore     = Math.max(titleScore, snippetScore);

  if (maxScore < 40) {
    return {
      valid: false,
      reason: `Similitud insuficiente: título=${titleScore}%, snippet=${snippetScore}% (mínimo 40%) para "${businessName}"`
    };
  }

  return { valid: true };
}
