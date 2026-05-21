// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_BASE_URL =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://www.luisgranero.com'

function getBaseUrl(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const isInternalHost = !host || /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)

  if (isInternalHost) {
    return PUBLIC_BASE_URL
  }

  const proto = request.headers.get('x-forwarded-proto') || 'https'
  return `${proto}://${host}`
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // NO proteger login ni registro
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Proteger rutas Studio con JWT
  if (pathname.startsWith('/studio') || pathname.startsWith('/api/studio')) {
    const isPublic =
      pathname === '/studio/login' ||
      pathname === '/api/studio/auth' ||
      pathname.startsWith('/studio/audio/') ||
      pathname.startsWith('/studio/images/') ||
      pathname.startsWith('/studio/videos/') ||
      pathname.startsWith('/studio/thumbnails/') ||
      pathname.startsWith('/studio/carteles/') ||
      pathname.startsWith('/studio/assets/') ||
      pathname.startsWith('/api/studio/image/') ||
      pathname.startsWith('/api/studio/video/');

    if (isPublic) return NextResponse.next();

    const studioSession = request.cookies.get('studio_session')?.value;

    if (!studioSession) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/studio/login', getBaseUrl(request)));
    }

    let session = null;
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET
      );
      const { payload } = await jwtVerify(studioSession, secret);
      if (payload.workspace_id) {
        session = { workspace_id: payload.workspace_id, canal_id: payload.canal_id ?? null };
      }
    } catch {
      // Token invalid or expired
    }

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/studio/login', getBaseUrl(request)));
      response.cookies.delete('studio_session');
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-studio-workspace-id', session.workspace_id);
    if (session.canal_id) requestHeaders.set('x-studio-canal-id', session.canal_id);

    // If no canal selected and not on selector page, redirect
    const requiresCanal =
      !pathname.startsWith('/api/') &&
      pathname !== '/studio/seleccionar-canal' &&
      pathname !== '/studio/canales' &&
      !session.canal_id;
    if (requiresCanal) {
      return NextResponse.redirect(new URL('/studio/seleccionar-canal', getBaseUrl(request)));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Proteger rutas admin - Verificar y validar JWT
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/leads') ||
    pathname.startsWith('/api/sequences') ||
    pathname.startsWith('/api/appointments') ||
    pathname.startsWith('/api/templates')
  ) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', getBaseUrl(request)))
    }

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)

      // Pasar identidad verificada como headers de request
      // Así los route handlers no necesitan re-verificar el JWT
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-admin-id', payload.id || '')
      requestHeaders.set('x-admin-email', payload.email || '')
      requestHeaders.set('x-admin-role', payload.role || 'admin')
      requestHeaders.set('x-admin-verified', '1')

      return NextResponse.next({ request: { headers: requestHeaders } })
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.json({ success: false, error: 'Sesión inválida' }, { status: 401 })
        response.cookies.delete('session')
        return response
      }
      const response = NextResponse.redirect(new URL('/admin/login', getBaseUrl(request)))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/leads/:path*',
    '/api/sequences/:path*',
    '/api/appointments/:path*',
    '/api/templates/:path*',
    '/studio/:path*',
    '/api/studio/:path*',
  ]
}
