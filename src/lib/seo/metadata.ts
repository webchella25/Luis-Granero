// src/lib/seo/metadata.ts
import SiteSettings from '@/models/SiteSettings';
import dbConnect from '@/lib/mongodb';

export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://www.luisgranero.com'
).replace(/\/$/, '');

export const DEFAULT_OG_IMAGE = '/opengraph-image';

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

type SettingsSection = Record<string, unknown>;

interface SiteSettingsDocument {
  pageMetadata?: Record<string, SettingsSection>;
  seo?: SettingsSection;
  openGraph?: SettingsSection;
}

interface SeoEntity {
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  featuredImage?: string;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  technologies?: string[];
  isPublished?: boolean;
  isActive?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

const BASE_URL = SITE_URL;

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * Obtiene los settings desde MongoDB
 */
async function getSettings(): Promise<SiteSettingsDocument | null> {
  try {
    await dbConnect();
    const settingsModel = SiteSettings as typeof SiteSettings & {
      getSettings?: () => Promise<SiteSettingsDocument>;
    };
    return (await settingsModel.getSettings?.()) || null;
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
  const pageData = settings?.pageMetadata?.[page] || {};
  const seoData = settings?.seo || {};
  const ogData = settings?.openGraph || {};

  const title = customData?.title || getString(pageData.title) || getString(seoData.siteName) || 'Luis Granero';
  const description = customData?.description || getString(pageData.description) || getString(seoData.siteDescription) || 'Desarrollo web moderno';
  const image = customData?.openGraph?.images?.[0] || getString(ogData.defaultImage) || '/images/og-default.jpg';
  const url = customData?.openGraph?.url || `${BASE_URL}/${page === 'home' ? '' : page}`;
  const twitterHandle = getString(ogData.twitterHandle);

  return {
    title,
    description,
    keywords: customData?.keywords || getStringList(pageData.keywords) || getStringList(seoData.keywords),
    openGraph: {
      title: customData?.openGraph?.title || title,
      description: customData?.openGraph?.description || description,
      images: [image],
      url,
      siteName: getString(seoData.siteName) || 'Luis Granero',
      locale: 'es_ES',
      type: customData?.openGraph?.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle || undefined,
      creator: twitterHandle || undefined,
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
export async function generateBlogPostMetadata(post: SeoEntity): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = settings?.seo || {};
  const ogData = settings?.openGraph || {};
  const twitterHandle = getString(ogData.twitterHandle);

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt || getString(seoData.defaultMetaDescription) || 'Desarrollo web moderno';
  const image = post.featuredImage || getString(ogData.defaultImage) || '/images/og-default.jpg';
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
      siteName: getString(seoData.siteName) || 'Luis Granero',
      locale: 'es_ES',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle || undefined,
      creator: twitterHandle || undefined,
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
export async function generateCourseMetadata(course: SeoEntity): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = settings?.seo || {};
  const ogData = settings?.openGraph || {};
  const twitterHandle = getString(ogData.twitterHandle);

  const title = course.seo?.metaTitle || course.title;
  const description = course.seo?.metaDescription || course.description || getString(seoData.defaultMetaDescription) || 'Desarrollo web moderno';
  const image = course.thumbnail || getString(ogData.defaultImage) || '/images/og-default.jpg';
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
      siteName: getString(seoData.siteName) || 'Luis Granero',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle || undefined,
      creator: twitterHandle || undefined,
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
export async function generatePortfolioMetadata(project: SeoEntity): Promise<PageMetadata> {
  const settings = await getSettings();
  const seoData = settings?.seo || {};
  const ogData = settings?.openGraph || {};
  const twitterHandle = getString(ogData.twitterHandle);

  const title = project.seo?.metaTitle || project.title;
  const description = project.seo?.metaDescription || project.description || getString(seoData.defaultMetaDescription) || 'Desarrollo web moderno';
  const image = project.thumbnail || project.images?.[0] || getString(ogData.defaultImage) || '/images/og-default.jpg';
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
      siteName: getString(seoData.siteName) || 'Luis Granero',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: twitterHandle || undefined,
      creator: twitterHandle || undefined,
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
