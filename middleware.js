// middleware.js (EN LA RAÍZ, no en src/)
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Debug para ver qué está pasando
    console.log('🔍 Middleware executing for:', req.nextUrl.pathname);
    console.log('🔍 Has token:', !!req.nextauth?.token);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Permitir login
        if (path.startsWith('/admin/login')) {
          console.log('✅ Allowing access to login page');
          return true;
        }
        
        // Permitir páginas de debug
        if (path.includes('/admin/status') || path.includes('/admin/debug')) {
          console.log('✅ Allowing access to debug page');
          return true;
        }
        
        // Proteger otras rutas admin
        if (path.startsWith('/admin')) {
          console.log('🔐 Protecting admin route, token exists:', !!token);
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*']
};