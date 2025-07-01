// src/middleware.js
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware logic aquí si necesitas
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Solo proteger rutas /admin excepto /admin/login
        if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
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