// src/lib/seo/schemas.ts
// Biblioteca centralizada de schemas Schema.org JSON-LD

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.luisgranero.com';

// Schema Organization - Para todo el sitio
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/#person`,
    name: 'Luis Granero',
    url: BASE_URL,
    image: `${BASE_URL}/images/luis-granero-avatar.jpg`,
    sameAs: [
      'https://github.com/luisgranero',
      'https://linkedin.com/in/luisgranero',
      'https://twitter.com/luisgranero',
    ],
    jobTitle: 'Desarrollador Full Stack',
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance',
    },
    knowsAbout: [
      'React',
      'Next.js',
      'Node.js',
      'JavaScript',
      'TypeScript',
      'Web Development',
      'Full Stack Development',
      'MongoDB',
      'PostgreSQL',
    ],
  };
}

// Schema WebSite - Para homepage
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Luis Granero - Desarrollador Full Stack',
    description: 'Desarrollo web moderno con React, Next.js y tecnologías de vanguardia',
    publisher: {
      '@id': `${BASE_URL}/#person`,
    },
    inLanguage: 'es-ES',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Schema BreadcrumbList - Para navegación
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
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

// Schema Article - Para posts de blog
export function getArticleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  publishDate: string;
  modifiedDate?: string;
  updatedAt?: string;
  tags?: string[];
  author?: string;
  readingTime?: number;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.publishDate,
    dateModified: post.modifiedDate || post.updatedAt || post.publishDate,
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: post.author || 'Luis Granero',
    },
    publisher: {
      '@id': `${BASE_URL}/#person`,
    },
    image: post.featuredImage
      ? {
          '@type': 'ImageObject',
          url: post.featuredImage,
          width: 1200,
          height: 630,
        }
      : undefined,
    keywords: post.tags?.join(', '),
    articleSection: post.category || 'Desarrollo Web',
    inLanguage: 'es-ES',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined,
  };
}

// Schema Course - Para cursos
export function getCourseSchema(course: {
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  provider?: string;
  level?: string;
  duration?: string;
  numberOfLessons?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${BASE_URL}/cursos/${course.slug}`,
    provider: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: course.provider || 'Luis Granero',
    },
    image: course.thumbnail,
    educationalLevel: course.level || 'Principiante',
    coursePrerequisites: 'Conocimientos básicos de programación',
    inLanguage: 'es-ES',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: course.duration,
    },
    numberOfCredits: course.numberOfLessons,
  };
}

// Schema ItemList - Para listados (blog, portfolio, cursos)
export function getItemListSchema(
  items: { name: string; url: string; image?: string }[],
  listName: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.name,
      image: item.image,
    })),
  };
}

// Schema CreativeWork - Para proyectos de portfolio
export function getCreativeWorkSchema(project: {
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  mainImage?: string;
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
  year?: string;
  urls?: { live?: string; github?: string };
  images?: string[];
}) {
  const thumbnail = project.thumbnail || project.images?.[0] || project.mainImage;
  const liveUrl = project.liveUrl || project.urls?.live;
  const githubUrl = project.githubUrl || project.urls?.github;

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    url: `${BASE_URL}/portfolio/${project.slug}`,
    creator: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
    },
    image: thumbnail,
    keywords: project.technologies?.join(', '),
    inLanguage: 'es-ES',
    dateCreated: project.year,
    sameAs: [liveUrl, githubUrl].filter(Boolean),
  };
}

// Schema Service - Para página de servicios
export function getServiceSchema(service: {
  name: string;
  description: string;
  price?: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
    },
    areaServed: service.areaServed || 'ES',
    offers: service.price
      ? {
          '@type': 'Offer',
          price: service.price,
          priceCurrency: 'EUR',
        }
      : undefined,
  };
}

// Schema ProfilePage - Para página sobre-mí
export function getProfilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@id': `${BASE_URL}/#person`,
    },
    url: `${BASE_URL}/sobre-mi`,
    inLanguage: 'es-ES',
  };
}

// Schema ContactPage - Para página de contacto
export function getContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${BASE_URL}/contacto`,
    mainEntity: {
      '@id': `${BASE_URL}/#person`,
    },
  };
}

// Schema FAQ - Para sección de preguntas frecuentes
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
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
