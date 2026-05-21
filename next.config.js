/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 CONFIGURACIÓN DE IMÁGENES DE CLOUDINARY
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Rewrites para servir archivos estáticos de studio desde API routes
  // (evita el cache de 404 de Next.js para archivos en public/ creados en runtime)
  async rewrites() {
    return [
      {
        source: '/studio/audio/:filename',
        destination: '/api/studio/audio/:filename',
      },
      {
        source: '/studio/thumbnails/:filename',
        destination: '/api/studio/thumbnails/:filename',
      },
      {
        source: '/studio/assets/:path*',
        destination: '/api/studio/serve/assets/:path*',
      },
      {
        source: '/studio/carteles/:path*',
        destination: '/api/studio/carteles/files/:path*',
      },
    ];
  },

  // Redirects 301 para SEO
  async redirects() {
    return [
      // Redirect de /home a /
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Evitar duplicados de index.html
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Tu configuración original
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
