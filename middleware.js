// middleware.js (en la raíz del proyecto)
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Rutas que NO requieren auth
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }
  
  // Verificar token en rutas admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value
    
    console.log('🔒 Middleware - Checking auth for:', pathname)
    console.log('🍪 Token exists:', !!token)
    
    if (!token) {
      console.log('❌ No token, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    try {
      await jwtVerify(token, secret)
      console.log('✅ Token valid, allowing access')
      return NextResponse.next()
    } catch (error) {
      console.log('❌ Invalid token:', error.message)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}