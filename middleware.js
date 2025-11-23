// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  // NO proteger la página de login
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next()
  }
  
  // Proteger rutas admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value
    
    if (!token) {
      console.log('❌ No token found, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
      await jwtVerify(token, secret)
      console.log('✅ Token valid for:', pathname)
      return NextResponse.next()
    } catch (error) {
      console.log('❌ Invalid token:', error.message)
      // Limpiar cookie inválida
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