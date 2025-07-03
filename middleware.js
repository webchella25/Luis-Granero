// middleware.js (EN LA RAÍZ)
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  console.log(`🔍 Middleware: ${pathname}`)
  
  // Debug temporal - respuesta personalizada para verificar que funciona
  if (pathname.startsWith('/admin')) {
    console.log('🔍 Admin route detected')
    
    if (pathname === '/admin' || pathname === '/admin/') {
      console.log('🔄 Redirecting /admin to /admin/login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}