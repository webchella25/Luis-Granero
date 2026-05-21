// src/lib/checkAuth.js
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

// Acepta un Request opcional. Si se pasa, lee la cookie directamente de él.
// Esto es más fiable en producción detrás de Nginx/PM2 que usar headers() de next/headers.
export async function checkAuth(request) {
  try {
    // Si se pasa el objeto request (route handlers), leer cookie de él directamente
    if (request) {
      // Primero: chequear header inyectado por middleware
      if (request.headers.get('x-admin-verified') === '1') {
        return {
          user: {
            id: request.headers.get('x-admin-id') || '',
            email: request.headers.get('x-admin-email') || '',
            role: request.headers.get('x-admin-role') || 'admin'
          }
        }
      }

      // Segundo: leer cookie del request
      const cookieHeader = request.headers.get('cookie') || ''
      const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
      const token = match?.[1]
      if (!token) return null

      const { payload } = await jwtVerify(token, secret)
      return {
        user: {
          id: payload.id,
          email: payload.email,
          role: payload.role
        }
      }
    }

    // Fallback: usar headers() de next/headers (para Server Components)
    const { headers } = await import('next/headers')
    const headerStore = await headers()

    if (headerStore.get('x-admin-verified') === '1') {
      return {
        user: {
          id: headerStore.get('x-admin-id') || '',
          email: headerStore.get('x-admin-email') || '',
          role: headerStore.get('x-admin-role') || 'admin'
        }
      }
    }

    const cookieHeader = headerStore.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
    const token = match?.[1]
    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return {
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    }
  } catch {
    return null
  }
}
