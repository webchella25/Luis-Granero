// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware ejecutado para:', pathname)

  // NO proteger login
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    console.log('✅ Ruta pública, permitiendo acceso')
    return NextResponse.next()
  }

  // Proteger rutas admin - Verificar y validar JWT
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value

    console.log('🍪 Cookie session exists:', !!token)

    if (!token) {
      console.log('❌ No token, redirect to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar el JWT
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)

      console.log('✅ Token válido para usuario:', payload.email)
      return NextResponse.next()
    } catch (error) {
      console.log('❌ Token inválido o expirado:', error.message)
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