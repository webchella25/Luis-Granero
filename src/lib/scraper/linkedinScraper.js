// src/lib/scraper/linkedinScraper.js

/**
 * LINKEDIN SCRAPER — desactivado
 * El scraping directo de Google está bloqueado y los actores de Apify
 * para LinkedIn requieren pago o no existen.
 * Módulo reservado para cuando haya una alternativa viable.
 */

export async function analyzeLinkedInPresence() {
  return {
    hasPresence: false,
    unavailable: true,
    message: 'Sin análisis de LinkedIn disponible'
  };
}

export function generateLinkedInPitch() {
  return null;
}
