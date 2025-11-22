// src/lib/seo/metadata.ts
import SiteSettings from '@/models/SiteSettings';
import dbConnect from '@/lib/mongodb';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  openGraph: {
    title: string;
    description: string;
    images: string[];
    url: string;
    siteName: string;
    locale: string;
    type: string;
  };
  twitter: {
    card: string;
    site?: string;
    creator?: string;
    title: string;
    description: string;
    images?: string[];
  };
  robots: {
    index: boolean;
    follow: boolean;
    googleBot?: {
      index: boolean;
      follow: boolean;
    };
  };
  alternates?: {
    canonical: string;
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://luisgranero.com';

/**
 * Obtiene los settings desde MongoDB
 */
async function getSettings() {
  try {
    await dbConnect();
    const settings = await SiteSettings.getSettings();
    return settings;
  } catch (error) {
    console.error('Error getting settings for metadata:', error);
    return null;
  }
}

/**
 * Genera metadata para una página específica
 */
export async function generatePageMetadata(
  page: 'home' | 'servicios' | 'portfolio' | 'blog' | 'contacto' | 'sobreMi' | 'cursos',
  customData?: Partial<PageMetadata>
): Promise<PageMetadata> {
  const settings = await getSettings();

  // Extraer datos con optional chaining y valores por defecto
  const pageData = (settings as any)?.pageMetadata?.[page] || {};
  const seoData = (settings as any)?.seo || {};
  const ogData = (settings as any)?.openGraph || {};

  const title = customData?.title || pageData.title || seoData.siteName || 'Luis Granero';
  const description = customData?.description || pageData.description || seoData.siteDescription || 'Desarrollo web moderno';
  const image = customData?.openGraph?.images?.[0] || ogData.defaultImage || '/images/og-default.jpg';
  const url = customData?.openGraph?.url || `${BASE_URL}/${page === 'home' ? '' : page}`;

  return {
    title,
    description,
    keywords: customData?.keywords || pageData.keywords || seoData.keywords,
    openGraph: {
      title: customData?.openGraph?.title || title,
      description: customData?.openGraph?.description || description,
      images: [image],
      url,
      siteName: seoData.siteName || 'Luis Granero',
      locale: 'es_ES',
      type: customData?.openGraph?.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: ogData.twitterHandle,
      creator: ogData.twitterHandle,
      title: customData?.twitter?.title || title,
      description: customData?.twitter?.description || description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Genera metadata para un post de blog
 */
export async function generateBlogPostMetadata(post: any): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = (settings as any)?.seo || {};
  const ogData = (settings as any)?.openGraph || {};

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || seoData.defaultMetaDescription;
  const image = post.featuredImage || ogData.defaultImage || '/images/og-default.jpg';
  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: `${title} | Blog Luis Granero`,
    description,
    keywords: post.seo?.keywords || post.tags || [],
    openGraph: {
      title,
      description,
      images: [image],
      url,
      siteName: seoData.siteName || 'Luis Granero',
      locale: 'es_ES',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      site: ogData.twitterHandle,
      creator: ogData.twitterHandle,
      title,
      description,
      images: [image],
    },
    robots: {
      index: post.isPublished !== false,
      follow: post.isPublished !== false,
      googleBot: {
        index: post.isPublished !== false,
        follow: post.isPublished !== false,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Genera metadata para un curso
 */
export async function generateCourseMetadata(course: any): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = (settings as any)?.seo || {};
  const ogData = (settings as any)?.openGraph || {};

  const title = course.seo?.metaTitle || course.title;
  const description = course.seo?.metaDescription || course.description || seoData.defaultMetaDescription;
  const image = course.thumbnail || ogData.defaultImage || '/images/og-default.jpg';
  const url = `${BASE_URL}/cursos/${course.slug}`;

  return {
    title: `${title} | Cursos Luis Granero`,
    description,
    keywords: course.seo?.keywords || course.tags || [],
    openGraph: {
      title,
      description,
      images: [image],
      url,
      siteName: seoData.siteName || 'Luis Granero',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: ogData.twitterHandle,
      creator: ogData.twitterHandle,
      title,
      description,
      images: [image],
    },
    robots: {
      index: course.isPublished !== false,
      follow: course.isPublished !== false,
      googleBot: {
        index: course.isPublished !== false,
        follow: course.isPublished !== false,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Genera metadata para un proyecto de portfolio
 */
export async function generatePortfolioMetadata(project: any): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = (settings as any)?.seo || {};
  const ogData = (settings as any)?.openGraph || {};

  const title = project.seo?.metaTitle || project.title;
  const description = project.seo?.metaDescription || project.description || seoData.defaultMetaDescription;
  const image = project.thumbnail || project.images?.[0] || ogData.defaultImage || '/images/og-default.jpg';
  const url = `${BASE_URL}/portfolio/${project.slug}`;

  return {
    title: `${title} | Portfolio Luis Granero`,
    description,
    keywords: project.seo?.keywords || project.technologies || [],
    openGraph: {
      title,
      description,
      images: [image],
      url,
      siteName: seoData.siteName || 'Luis Granero',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: ogData.twitterHandle,
      creator: ogData.twitterHandle,
      title,
      description,
      images: [image],
    },
    robots: {
      index: project.isActive !== false,
      follow: project.isActive !== false,
      googleBot: {
        index: project.isActive !== false,
        follow: project.isActive !== false,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}