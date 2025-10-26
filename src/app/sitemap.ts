// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luisgranero.com';

  // Páginas estáticas
  const staticPages = [
    '',
    '/sobre-mi',
    '/servicios',
    '/portfolio',
    '/blog',
    '/cursos', // 🔥 NUEVO
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Obtener posts del blog
  let blogPosts: any[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/public/blog`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      blogPosts = data.posts || [];
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Obtener rutas de aprendizaje 🔥 NUEVO
  let learningPaths: any[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/public/learning-paths`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      learningPaths = data.paths || [];
    }
  } catch (error) {
    console.error('Error fetching learning paths for sitemap:', error);
  }

  const cursosUrls = learningPaths.map((path) => ({
    url: `${baseUrl}/cursos/${path.slug}`,
    lastModified: new Date(path.updatedAt || path.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogUrls, ...cursosUrls];
}