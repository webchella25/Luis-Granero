// middleware.js
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 Middleware ejecutado para:', pathname)
  
  // NO proteger login
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    console.log('✅ Ruta pública, permitiendo acceso')
    return NextResponse.next()
  }
  
  // Proteger rutas admin - SOLO verificar que cookie existe
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value
    
    console.log('🍪 Cookie session exists:', !!token)
    console.log('🍪 Cookie value:', token ? token.substring(0, 30) + '...' : 'none')
    
    if (!token) {
      console.log('❌ No token, redirect to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    console.log('✅ Token found, allowing access')
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}