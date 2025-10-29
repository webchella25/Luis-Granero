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
  
  // Tu configuración original
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
}

export default nextConfig