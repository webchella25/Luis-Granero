// src/lib/seo/schemas.ts - NUEVO
import Settings from '@/models/Settings';
import dbConnect from '@/lib/mongodb';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://luisgranero.com';

async function getSettings() {
  try {
    await dbConnect();
    return await Settings.getSettings();
  } catch (error) {
    console.error('Error getting settings for schema:', error);
    return null;
  }
}

/**
 * Schema: Organization
 */
export async function generateOrganizationSchema() {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};
  const socialProfiles = schemaData.socialProfiles || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: schemaData.businessName || 'Luis Granero',
    description: schemaData.description || 'Desarrollo web moderno',
    url: BASE_URL,
    logo: `${BASE_URL}${settings?.seo?.logoUrl || '/images/logo.png'}`,
    email: schemaData.email,
    telephone: schemaData.phone,
    address: schemaData.address?.city ? {
      '@type': 'PostalAddress',
      addressLocality: schemaData.address.city,
      addressRegion: schemaData.address.region,
      addressCountry: schemaData.address.country,
      postalCode: schemaData.address.postalCode,
      streetAddress: schemaData.address.street,
    } : undefined,
    sameAs: Object.values(socialProfiles).filter(Boolean),
  };
}

/**
 * Schema: Person (tú como profesional)
 */
export async function generatePersonSchema() {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};
  const socialProfiles = schemaData.socialProfiles || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: schemaData.businessName || 'Luis Granero',
    jobTitle: 'Desarrollador Full Stack',
    description: schemaData.description || 'Desarrollador especializado en React, Next.js y TypeScript',
    url: BASE_URL,
    image: `${BASE_URL}${settings?.seo?.logoUrl || '/images/logo.png'}`,
    email: schemaData.email,
    telephone: schemaData.phone,
    address: schemaData.address?.city ? {
      '@type': 'PostalAddress',
      addressLocality: schemaData.address.city,
      addressRegion: schemaData.address.region,
      addressCountry: schemaData.address.country,
    } : undefined,
    sameAs: Object.values(socialProfiles).filter(Boolean),
    knowsAbout: schemaData.services || [],
  };
}

/**
 * Schema: WebSite con SearchAction
 */
export async function generateWebSiteSchema() {
  const settings = await getSettings();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.seo?.siteName || 'Luis Granero',
    description: settings?.seo?.siteDescription || 'Desarrollo web moderno',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Schema: ProfessionalService
 */
export async function generateProfessionalServiceSchema() {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: schemaData.businessName || 'Luis Granero',
    description: schemaData.description || 'Servicios de desarrollo web',
    url: BASE_URL,
    priceRange: '€€€',
    areaServed: {
      '@type': 'Country',
      name: 'España',
    },
    serviceType: schemaData.services || [],
  };
}

/**
 * Schema: BreadcrumbList
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Schema: Article (blog posts)
 */
export async function generateArticleSchema(post: any) {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.seo?.metaDescription,
    image: post.featuredImage ? `${BASE_URL}${post.featuredImage}` : undefined,
    author: {
      '@type': 'Person',
      name: post.author || schemaData.businessName || 'Luis Granero',
    },
    publisher: {
      '@type': 'Organization',
      name: schemaData.businessName || 'Luis Granero',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}${settings?.seo?.logoUrl || '/images/logo.png'}`,
      },
    },
    datePublished: post.publishDate || post.createdAt,
    dateModified: post.updatedAt || post.publishDate || post.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', '),
  };
}

/**
 * Schema: Course
 */
export async function generateCourseSchema(course: any) {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: schemaData.businessName || 'Luis Granero',
      url: BASE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration || 'PT10H',
    },
    offers: course.price ? {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    } : undefined,
  };
}

/**
 * Schema: FAQPage
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Schema: Service (para página de servicios individuales)
 */
export async function generateServiceSchema(service: any) {
  const settings = await getSettings();
  const schemaData = settings?.schemaData || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: schemaData.businessName || 'Luis Granero',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'España',
    },
    offers: service.pricing ? {
      '@type': 'Offer',
      priceRange: `${service.pricing.priceRange?.min}-${service.pricing.priceRange?.max} EUR`,
      priceCurrency: 'EUR',
    } : undefined,
  };
}