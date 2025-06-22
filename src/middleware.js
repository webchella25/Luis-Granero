// src/middleware.js
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Solo aplicar middleware a rutas que NO sean login
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Si está en la página de login, permitir acceso sin token
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        // Para otras rutas admin, requerir token
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}