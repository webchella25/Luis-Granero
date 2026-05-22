// src/lib/rateLimit.js
// Rate limit en memoria para VPS de un solo proceso.
// Limitación: no comparte estado entre procesos PM2 cluster ni sobrevive reinicios.
// Si se activa cluster o se escala horizontalmente, sustituir memoryStore por un adapter Redis.

const rateLimitStore = new Map()

const memoryStore = {
  get(key) {
    return rateLimitStore.get(key)
  },
  set(key, record) {
    rateLimitStore.set(key, record)
  },
  delete(key) {
    rateLimitStore.delete(key)
  },
  entries() {
    return rateLimitStore.entries()
  },
}

let store = memoryStore

export function setRateLimitStore(customStore) {
  store = customStore || memoryStore
}

function cleanupExpiredRecords() {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now - value.resetTime > 0) {
      store.delete(key)
    }
  }
}

// En VPS mantiene la memoria acotada. unref evita mantener vivo el proceso por el timer.
const cleanupTimer = setInterval(cleanupExpiredRecords, 10 * 60 * 1000)
cleanupTimer.unref?.()

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

  let record = store.get(key)

  // Si no existe o ya expiró, crear nuevo registro
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs
    }
    store.set(key, record)

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
  store.set(key, record)

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
