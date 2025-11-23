// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Solo loguear en desarrollo
  const isDev = process.env.NODE_ENV !== 'production'

  // NO proteger login
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Proteger rutas admin - Verificar y validar JWT
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value

    if (!token) {
      if (isDev) console.log('❌ No token, redirect to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar el JWT
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      if (isDev) console.log('❌ Token inválido o expirado:', error.message)
      // Limpiar cookie inválida y redirigir a login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}