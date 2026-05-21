// src/app/blog/categoria/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlogGrid from '@/components/blog/BlogGrid';
import SchemaOrg from '@/components/seo/SchemaOrg';
import { getBreadcrumbSchema } from '@/lib/seo/schemas';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 3600;

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  react: {
    title: 'Artículos sobre React — Blog | Luis Granero',
    description: 'Tutoriales, guías y buenas prácticas de React. Hooks, componentes, rendimiento y patrones avanzados explicados con ejemplos reales.',
    keywords: ['tutorial React español', 'React hooks guía', 'componentes React', 'React avanzado', 'aprender React'],
  },
  nextjs: {
    title: 'Artículos sobre Next.js — Blog | Luis Granero',
    description: 'Guías completas de Next.js: App Router, Server Components, ISR, SEO técnico y deploy en producción. Ejemplos prácticos.',
    keywords: ['tutorial Next.js español', 'Next.js App Router', 'Server Components', 'Next.js SEO', 'Next.js 15'],
  },
  javascript: {
    title: 'Artículos sobre JavaScript — Blog | Luis Granero',
    description: 'JavaScript moderno: async/await, ES2025, TypeScript, patrones de diseño y buenas prácticas para desarrollo web profesional.',
    keywords: ['JavaScript moderno', 'TypeScript tutorial', 'async await JavaScript', 'ES2025', 'aprender JavaScript'],
  },
  freelance: {
    title: 'Artículos sobre Freelance y Desarrollo Web — Blog | Luis Granero',
    description: 'Recursos y consejos para desarrolladores freelance: precios, clientes, contratos, productividad y carrera profesional.',
    keywords: ['freelance desarrollo web', 'consejos freelance programador', 'carrera desarrollador web', 'productividad programador'],
  },
  ecommerce: {
    title: 'Artículos sobre E-commerce — Blog | Luis Granero',
    description: 'Guías sobre desarrollo de tiendas online: plataformas, integraciones, rendimiento, SEO y conversión para e-commerce.',
    keywords: ['e-commerce desarrollo web', 'tienda online Next.js', 'Shopify vs a medida', 'optimización tienda online'],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  react: 'React',
  nextjs: 'Next.js',
  javascript: 'JavaScript',
  freelance: 'Freelance',
  ecommerce: 'E-commerce',
};

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryPosts(category: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog?category=${encodeURIComponent(category)}&limit=20`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { posts: [], total: 0 };
    return res.json();
  } catch {
    return { posts: [], total: 0 };
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug.toLowerCase()];
  if (!meta) return { title: 'Categoría — Blog | Luis Granero' };
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `https://www.luisgranero.com/blog/categoria/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      url: `https://www.luisgranero.com/blog/categoria/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_META).map((slug) => ({ slug }));
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug.toLowerCase()];
  if (!label) notFound();

  const data = await getCategoryPosts(label);
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: label, url: `/blog/categoria/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-[#0F172A]">
      <SchemaOrg schema={[breadcrumb]} />
      <Header />

      <section className="pt-32 pb-12 bg-[#0B1120]">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-300">{label}</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <span className="badge badge-cyan">{label}</span>
            <span className="text-sm text-slate-500">{data.total || data.posts?.length || 0} artículos</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
            Artículos sobre <span className="gradient-text">{label}</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            {CATEGORY_META[slug.toLowerCase()]?.description}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          {data.posts?.length > 0 ? (
            <Suspense fallback={<div className="py-20 text-center text-slate-500">Cargando artículos…</div>}>
              <BlogGrid posts={data.posts} />
            </Suspense>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 mb-6">Pronto habrá artículos en esta categoría.</p>
              <Link href="/blog" className="btn-secondary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Ver todos los artículos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA enlace interno */}
      <section className="py-12 bg-[#0B1120] border-t border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 mb-4">¿Quieres aplicar esto en tu proyecto?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/servicios/desarrollo-react-nextjs" className="btn-primary text-sm">
              Ver servicios React & Next.js
            </Link>
            <Link href="/cursos" className="btn-secondary text-sm">
              Explorar cursos gratuitos
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
