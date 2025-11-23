// src/lib/csrf.js
// Sistema simple de protección CSRF usando doble submit de cookies

import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Genera un token CSRF
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Obtiene o crea el token CSRF de las cookies
 */
export async function getCSRFToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get('csrf-token')?.value;

  if (!token) {
    token = generateCSRFToken();
    cookieStore.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });
  }

  return token;
}

/**
 * Verifica el token CSRF del request
 * @param {Request} request - Next.js request object
 * @returns {boolean} - true si el token es válido
 */
export async function verifyCSRFToken(request) {
  // Obtener token de la cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf-token')?.value;

  if (!cookieToken) {
    return false;
  }

  // Obtener token del header o body
  const headerToken = request.headers.get('x-csrf-token');

  // Si viene del header, verificar
  if (headerToken) {
    return headerToken === cookieToken;
  }

  // Si es form data, obtener del body
  try {
    const contentType = request.headers.get('content-type');

    // Para JSON requests
    if (contentType?.includes('application/json')) {
      const body = await request.json();
      const bodyToken = body._csrf;
      return bodyToken === cookieToken;
    }

    // Para form data
    if (contentType?.includes('application/x-www-form-urlencoded') ||
        contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const formToken = formData.get('_csrf');
      return formToken === cookieToken;
    }
  } catch (error) {
    return false;
  }

  return false;
}

/**
 * Middleware de CSRF para rutas API
 * Usar en endpoints que modifiquen estado (POST, PUT, DELETE, PATCH)
 */
export async function csrfProtection(request) {
  const method = request.method;

  // Solo verificar en métodos que modifican estado
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const isValid = await verifyCSRFToken(request);

    if (!isValid) {
      return {
        valid: false,
        response: Response.json(
          { error: 'Token CSRF inválido o ausente' },
          { status: 403 }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Hook para obtener token CSRF en el cliente
 * Endpoint: GET /api/csrf-token
 */
export async function handleCSRFTokenRequest() {
  const token = await getCSRFToken();

  return Response.json({ csrfToken: token });
}
