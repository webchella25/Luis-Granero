/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🔥 PERMITIR IMÁGENES DE CLOUDINARY
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        pathname: '/**',
      },
      // 🔥 Tu cloud name específico
      {
        protocol: 'https',
        hostname: 'dl6ra1qy7.cloudinary.com',
        pathname: '/**',
      },
    ],
    // 🔥 CONFIGURACIÓN ADICIONAL
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Otras configuraciones que puedas tener
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig