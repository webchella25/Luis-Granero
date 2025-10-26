// src/app/blog/page.tsx - Versión corregida
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BlogHero from '../../components/blog/BlogHero';
import FeaturedPost from '../../components/blog/FeaturedPost';
import BlogGrid from '../../components/blog/BlogGrid';
import BlogCategories from '../../components/blog/BlogCategories';
import NewsletterSignup from '../../components/blog/NewsletterSignup';

// ✅ AÑADIR ESTO - Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ✅ Función corregida con tipos explícitos
async function getBlogData(searchParams: Record<string, any> = {}) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const params = new URLSearchParams();
    
    // ✅ Verificar que las propiedades existan antes de acceder
    if (searchParams?.category && typeof searchParams.category === 'string') {
      params.append('category', searchParams.category);
    }
    if (searchParams?.page) {
      params.append('page', searchParams.page.toString());
    }
    
    const res = await fetch(`${baseUrl}/api/public/blog?${params}`, {
      cache: 'no-store',
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
      cache: 'no-store',
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

// ✅ Interface corregida para Next.js 15
interface BlogPageProps {
  params: Promise<{ [key: string]: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const blogData = await getBlogData(resolvedSearchParams);
  
  return {
    title: `Blog - Luis Granero | ${blogData.total} Artículos de Desarrollo Web`,
    description: 'Artículos técnicos, tutoriales de React/Next.js, mejores prácticas de desarrollo web y tendencias tecnológicas.',
    keywords: [
      'blog desarrollo web',
      'tutoriales react',
      'next.js',
      'javascript',
      'typescript',
      'frontend',
      'backend',
      'luis granero blog'
    ],
    openGraph: {
      title: 'Blog - Luis Granero',
      description: 'Artículos técnicos y tutoriales de desarrollo web',
      type: 'website',
    }
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const blogData = await getBlogData(resolvedSearchParams);
  const featuredPost = await getFeaturedPost();

  return (
    <main className="min-h-screen bg-black">
      <Header />
      
      <BlogHero />
      
      {featuredPost && <FeaturedPost post={featuredPost} />}
      
      <BlogGrid 
        posts={blogData.posts}
        pagination={blogData.pagination}
      />
      
      <BlogCategories />
      
      {/* CTA a Cursos */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <span className="text-purple-400 font-semibold text-sm">
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
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
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