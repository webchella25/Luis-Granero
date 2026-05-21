// src/app/blog/page.tsx - Versión corregida
import Link from 'next/link';
import { Suspense } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BlogHero from '../../components/blog/BlogHero';
import FeaturedPost from '../../components/blog/FeaturedPost';
import BlogGrid from '../../components/blog/BlogGrid';
import BlogCategories from '../../components/blog/BlogCategories';
import NewsletterSignup from '../../components/blog/NewsletterSignup';
import SchemaOrg from '../../components/seo/SchemaOrg';
import { getItemListSchema, getBreadcrumbSchema } from '../../lib/seo/schemas';

export const revalidate = 3600;

async function getBlogData(searchParams: Record<string, any> = {}) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const params = new URLSearchParams();
    params.append('limit', '20');

    if (searchParams?.category && typeof searchParams.category === 'string') {
      params.append('category', searchParams.category);
    }
    if (searchParams?.page) {
      params.append('page', searchParams.page.toString());
    }

    const res = await fetch(`${baseUrl}/api/public/blog?${params}`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching blog data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return {
      posts: [],
      pagination: { current: 1, total: 1, hasNext: false, hasPrev: false },
      categories: [],
      total: 0
    };
  }
}

// Función para obtener post destacado
async function getFeaturedPost() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog/featured`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error('Error fetching featured post');
    }

    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Función para obtener categorías
async function getCategories() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog/categories`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error('Error fetching categories');
    }

    return res.json();
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// ✅ Interface corregida para Next.js 15
interface BlogPageProps {
  params: Promise<{ [key: string]: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const hasFilters = !!(resolvedSearchParams.tag || resolvedSearchParams.category || resolvedSearchParams.page);

  return {
    title: 'Blog de Desarrollo Web — Luis Granero | React, Next.js y JavaScript',
    description: 'Tutoriales, guías y artículos sobre React, Next.js, JavaScript y desarrollo web moderno. Aprende con ejemplos reales y buenas prácticas aplicadas en proyectos profesionales.',
    keywords: [
      'tutorial React español',
      'guía Next.js español',
      'aprender JavaScript 2025',
      'React hooks tutorial',
      'blog desarrollo web España',
      'tutoriales programación web',
      'Next.js tutorial completo',
    ],
    openGraph: {
      title: 'Blog de Desarrollo Web — Luis Granero | React & Next.js',
      description: 'Tutoriales prácticos de React, Next.js y JavaScript. Aprende desarrollo web moderno con ejemplos reales.',
      type: 'website',
      url: 'https://www.luisgranero.com/blog',
    },
    alternates: {
      canonical: 'https://www.luisgranero.com/blog',
    },
    ...(hasFilters && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const blogData = await getBlogData(resolvedSearchParams);
  const featuredPost = await getFeaturedPost();
  const categories = await getCategories();

  // Generar schemas
  const blogListSchema = getItemListSchema(
    blogData.posts.map((post: any) => ({
      name: post.title,
      url: `/blog/${post.slug}`,
      image: post.featuredImage
    })),
    'Artículos de Blog sobre Desarrollo Web'
  );

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Blog', url: '/blog' }
  ]);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      {/* Schema.org JSON-LD */}
      <SchemaOrg schema={[blogListSchema, breadcrumbSchema]} />

      <Header />

      <BlogHero />

      {featuredPost && <FeaturedPost post={featuredPost} />}

      <Suspense fallback={<div className="py-20 text-center text-slate-500">Cargando artículos…</div>}>
        <BlogGrid
          posts={blogData.posts}
          pagination={blogData.pagination}
        />
      </Suspense>

      <BlogCategories data={{ categories }} />
      
      {/* CTA a Cursos */}
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="badge mb-6">
              <span className="">
                🎓 ¿Quieres aprender de forma estructurada?
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Descubre nuestras Rutas de Aprendizaje
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Secuencias de artículos diseñadas para llevarte de principiante a experto, paso a paso.
            </p>
            <Link
              href="/cursos"
              className="inline-block px-8 py-4 btn-primary"
            >
              Ver todas las rutas →
            </Link>
          </div>
        </div>
      </section>
      
      <NewsletterSignup />
      
      <Footer />
    </main>
  );
}