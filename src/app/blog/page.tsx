// src/app/blog/page.tsx - Versión corregida
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BlogHero from '../../components/blog/BlogHero';
import FeaturedPost from '../../components/blog/FeaturedPost';
import BlogGrid from '../../components/blog/BlogGrid';
import BlogCategories from '../../components/blog/BlogCategories';
import NewsletterSignup from '../../components/blog/NewsletterSignup';

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
      'next.js guías',
      'javascript avanzado',
      'performance web',
      'seo técnico'
    ],
    openGraph: {
      title: 'Blog de Desarrollo Web - Luis Granero',
      description: `${blogData.total} artículos técnicos sobre React, Next.js y desarrollo web moderno`,
      type: 'website'
    }
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // ✅ AWAIT searchParams antes de usar
  const resolvedSearchParams = await searchParams;
  
  const [blogData, featuredPost] = await Promise.all([
    getBlogData(resolvedSearchParams),
    getFeaturedPost()
  ]);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <BlogHero totalPosts={blogData.total} />
      {featuredPost && <FeaturedPost post={featuredPost} />}
      <BlogGrid 
        posts={blogData.posts} 
        categories={blogData.categories}
        pagination={blogData.pagination}
        currentCategory={resolvedSearchParams?.category as string}
      />
      <BlogCategories categories={blogData.categories} />
      <NewsletterSignup />
      <Footer />
    </main>
  );
}