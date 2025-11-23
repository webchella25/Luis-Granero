// src/lib/rateLimit.js
// Sistema simple de rate limiting basado en memoria
// Para producción considera usar Redis o Upstash

const rateLimitStore = new Map()

// Limpiar entradas antiguas cada 10 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.resetTime > 0) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Rate limiter simple
 * @param {string} identifier - IP o identificador único
 * @param {number} limit - Número máximo de intentos
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @returns {Object} { success: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(identifier, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const key = identifier

  let record = rateLimitStore.get(key)

  // Si no existe o ya expiró, crear nuevo registro
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, record)

    return {
      success: true,
      remaining: limit - 1,
      resetTime: record.resetTime
    }
  }

  // Si ya alcanzó el límite
  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  // Incrementar contador
  record.count++
  rateLimitStore.set(key, record)

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Obtener IP del request (maneja proxies y Vercel)
 * @param {Request} request - Next.js request object
 * @returns {string} IP address
 */
export function getClientIP(request) {
  // Vercel y otros proxies
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Real IP header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback - no debería usarse en producción
  return 'unknown'
}
