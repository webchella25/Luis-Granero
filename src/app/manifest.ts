// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luis Granero - Desarrollador Full Stack',
    short_name: 'Luis Granero',
    description: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#06b6d4', // Cyan-400 de Tailwind
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['education', 'productivity', 'development'],
    lang: 'es-ES',
  };
}
