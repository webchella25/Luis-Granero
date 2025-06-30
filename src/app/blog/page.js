// src/app/blog/page.js
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogSidebar from '@/components/blog/BlogSidebar';
import NewsletterSection from '@/components/blog/NewsletterSection';
import Loading, { SectionLoading } from '@/components/ui/Loading';

// Función para obtener posts del blog desde MongoDB
async function getBlogData(searchParams = {}) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value.toString());
      }
    });
    
    const res = await fetch(`${baseUrl}/api/blog?${params}`, {
      next: { revalidate: 1800 }, // Revalidar cada 30 minutos
    });
    
    if (!res.ok) {
      throw new Error('Error fetching blog data');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading blog:', error);
    return {
      posts: [],
      pagination: { total: 0, totalPages: 0 },
      categories: {},
      tags: [],
      popularPosts: []
    };
  }
}

// Función para obtener configuración del blog
async function getBlogSettings() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog/settings`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching blog settings');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error loading blog settings:', error);
    return {
      content: {
        hero: {
          title: "Blog de Desarrollo",
          subtitle: "Artículos técnicos, tutoriales y insights sobre desarrollo web moderno",
          description: "Comparto mi experiencia y conocimientos sobre React, Next.js, JavaScript y las últimas tendencias en desarrollo web."
        }
      }
    };
  }
}

// Función para obtener posts destacados
async function getFeaturedPosts() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog?featured=true&limit=3`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      throw new Error('Error fetching featured posts');
    }
    
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error loading featured posts:', error);
    return [];
  }
}

// Componente de loading específico para blog
function BlogSkeleton() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-700 rounded w-96 mx-auto mb-6"></div>