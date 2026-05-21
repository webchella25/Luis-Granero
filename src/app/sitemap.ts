// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.luisgranero.com';

  // Páginas estáticas
  const staticPages = [
    // Pilares
    { route: '', priority: 1.0 },
    { route: '/sobre-mi', priority: 0.8 },
    { route: '/servicios', priority: 0.9 },
    { route: '/portfolio', priority: 0.8 },
    { route: '/blog', priority: 0.8 },
    { route: '/cursos', priority: 0.8 },
    { route: '/contacto', priority: 0.9 },
    // Subpáginas de servicio
    { route: '/servicios/desarrollo-react-nextjs', priority: 0.85 },
    { route: '/servicios/ecommerce', priority: 0.85 },
    { route: '/servicios/consultoria', priority: 0.8 },
    { route: '/servicios/desarrollo-web-valencia', priority: 0.75 },
    { route: '/servicios/desarrollo-saas', priority: 0.85 },
    // Categorías de blog
    { route: '/blog/categoria/react', priority: 0.7 },
    { route: '/blog/categoria/nextjs', priority: 0.7 },
    { route: '/blog/categoria/freelance', priority: 0.7 },
    { route: '/blog/categoria/javascript', priority: 0.65 },
    { route: '/blog/categoria/ecommerce', priority: 0.65 },
  ].map(({ route, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }));

  // Obtener posts del blog
  let blogPosts: any[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/public/blog`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      blogPosts = data.posts || [];
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  const blogUrls = blogPosts.map((post) => {
    const date = post.updatedAt || post.createdAt;
    const lastModified = date ? new Date(date) : new Date();
    // Validar que la fecha sea válida
    if (isNaN(lastModified.getTime())) {
      return {
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      };
    }
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    };
  });

  // Obtener proyectos de portfolio
  let portfolioProjects: any[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/public/projects`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      portfolioProjects = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('Error fetching portfolio projects for sitemap:', error);
  }

  const portfolioUrls = portfolioProjects.map((project) => {
    const date = project.updatedAt || project.createdAt;
    const lastModified = date ? new Date(date) : new Date();
    // Validar que la fecha sea válida
    if (isNaN(lastModified.getTime())) {
      return {
        url: `${baseUrl}/portfolio/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    }
    return {
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  // Obtener cursos (learning paths y email courses)
  let courses: any[] = [];
  try {
    const [pathsRes, emailRes] = await Promise.all([
      fetch(`${baseUrl}/api/public/learning-paths`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/public/email-courses`, { next: { revalidate: 3600 } }),
    ]);

    if (pathsRes.ok) {
      const pathsData = await pathsRes.json();
      courses = [...courses, ...(pathsData.paths || [])];
    }

    if (emailRes.ok) {
      const emailData = await emailRes.json();
      courses = [...courses, ...(emailData.courses || [])];
    }
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  const courseUrls = courses.map((course) => {
    const date = course.updatedAt || course.createdAt;
    const lastModified = date ? new Date(date) : new Date();
    if (isNaN(lastModified.getTime())) {
      return {
        url: `${baseUrl}/cursos/${course.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    }
    return {
      url: `${baseUrl}/cursos/${course.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...blogUrls, ...portfolioUrls, ...courseUrls];
}