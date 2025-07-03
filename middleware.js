// middleware.js (en la raíz del proyecto)
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Solo interceptar rutas admin que NO sean login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    console.log('🔍 Protecting admin route:', pathname)
    // El middleware redirecciona automáticamente a login si no hay token
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}