// src/app/blog/[slug]/page.tsx - Versión corregida
import { notFound } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import BlogPost from '../../../components/blog/BlogPost';
import RelatedPosts from '../../../components/blog/RelatedPosts';

// Función para obtener un post por slug
async function getPostBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Función para obtener posts relacionados
async function getRelatedPosts(category: string, currentSlug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog?category=${category}&limit=3`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.posts.filter((post: any) => post.slug !== currentSlug);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// ✅ Interface corregida para Next.js 15
interface BlogPostPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Artículo no encontrado - Luis Granero Blog',
    };
  }
  
  return {
    title: `${post.title} - Luis Granero Blog`,
    description: post.excerpt || post.description,
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishDate,
      authors: ['Luis Granero'],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(post.category, post.slug);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <BlogPost post={post} />
      <RelatedPosts posts={relatedPosts} currentCategory={post.category} />
      <Footer />
    </main>
  );
}

// Generar páginas estáticas para posts existentes
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog?limit=100`);
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    
    return data.posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}