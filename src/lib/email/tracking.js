// src/lib/email/tracking.js - UTILIDADES DE TRACKING
import crypto from 'crypto';

/**
 * Genera un pixel de tracking invisible para incluir en emails
 * @param {string} emailLogId - ID del EmailLog en MongoDB
 * @returns {string} HTML del pixel de tracking
 */
export function generateTrackingPixel(emailLogId) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingUrl = `${baseUrl}/api/email-tracking/open/${emailLogId}`;
  
  return `<img src="${trackingUrl}" width="1" height="1" style="display:none;opacity:0;max-height:0;max-width:0;" alt="" />`;
}

/**
 * Convierte todos los enlaces de un HTML en enlaces trackeables
 * @param {string} html - HTML del email
 * @param {string} emailLogId - ID del EmailLog
 * @returns {string} HTML con enlaces trackeables
 */
export function makeLinksTrackable(html, emailLogId) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Regex para encontrar todos los enlaces <a href="...">
  const linkRegex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi;
  
  return html.replace(linkRegex, (match, attributes, url) => {
    // No trackear enlaces internos de tracking
    if (url.includes('/api/email-tracking/')) {
      return match;
    }
    
    // No trackear enlaces de unsubscribe
    if (url.includes('unsubscribe')) {
      return match;
    }
    
    // Crear URL de tracking
    const trackingUrl = `${baseUrl}/api/email-tracking/click/${emailLogId}?url=${encodeURIComponent(url)}`;
    
    // Reemplazar la URL original con la de tracking
    return `<a ${attributes.replace(url, trackingUrl)}>`;
  });
}

/**
 * Prepara un email para tracking completo
 * @param {string} htmlBody - Cuerpo del email en HTML
 * @param {string} emailLogId - ID del EmailLog
 * @returns {string} HTML con tracking completo
 */
export function prepareEmailForTracking(htmlBody, emailLogId) {
  // Añadir enlaces trackeables
  let trackedHtml = makeLinksTrackable(htmlBody, emailLogId);
  
  // Añadir pixel de tracking al final del body
  const trackingPixel = generateTrackingPixel(emailLogId);
  
  // Insertar el pixel antes del cierre de </body> o al final
  if (trackedHtml.includes('</body>')) {
    trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`);
  } else {
    trackedHtml += trackingPixel;
  }
  
  return trackedHtml;
}

/**
 * Extrae metadata de la request (IP, User-Agent, Location)
 * @param {Request} request - Request object de Next.js
 * @returns {object} Metadata extraída
 */
export function extractRequestMetadata(request) {
  const headers = request.headers;
  
  // Obtener IP real (considerando proxies)
  const ip = 
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';
  
  const userAgent = headers.get('user-agent') || 'unknown';
  
  // Location aproximada desde headers de Cloudflare (si existe)
  const country = headers.get('cf-ipcountry') || null;
  const city = headers.get('cf-ipcity') || null;
  
  const location = country && city ? `${city}, ${country}` : country || null;
  
  return {
    ip,
    userAgent,
    location
  };
}

/**
 * Genera un hash único para evitar tracking duplicado
 * @param {string} emailLogId - ID del EmailLog
 * @param {string} ip - IP del usuario
 * @returns {string} Hash único
 */
export function generateTrackingHash(emailLogId, ip) {
  return crypto
    .createHash('md5')
    .update(`${emailLogId}-${ip}`)
    .digest('hex');
}

/**
 * Calcula métricas de engagement de un email
 * @param {object} emailLog - EmailLog document
 * @returns {object} Métricas calculadas
 */
export function calculateEngagementMetrics(emailLog) {
  const metrics = {
    opened: emailLog.opened,
    clicked: emailLog.clicked,
    openCount: emailLog.openCount || 0,
    clickCount: emailLog.clickCount || 0,
    timeToOpen: emailLog.timeToOpen || null,
    timeToClick: emailLog.timeToClick || null,
    engagementScore: 0
  };
  
  // Calcular engagement score (0-100)
  if (emailLog.opened) metrics.engagementScore += 40;
  if (emailLog.clicked) metrics.engagementScore += 60;
  if (emailLog.openCount > 1) metrics.engagementScore += Math.min(emailLog.openCount * 5, 20);
  
  // Bonus por respuesta rápida
  if (emailLog.timeToOpen && emailLog.timeToOpen < 3600) { // < 1 hora
    metrics.engagementScore += 10;
  }
  
  metrics.engagementScore = Math.min(metrics.engagementScore, 100);
  
  return metrics;
}

/**
 * Formatea tiempo en segundos a formato legible
 * @param {number} seconds - Segundos
 * @returns {string} Tiempo formateado
 */
export function formatTimeToOpen(seconds) {
  if (!seconds) return 'No abierto';
  
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/**
 * Valida que un emailLogId es válido
 * @param {string} emailLogId - ID a validar
 * @returns {boolean} Es válido
 */
export function isValidEmailLogId(emailLogId) {
  return /^[0-9a-fA-F]{24}$/.test(emailLogId);
}
