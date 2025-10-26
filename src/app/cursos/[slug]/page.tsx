// src/app/cursos/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import LearningPathDetail from '../../../components/cursos/LearningPathDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLearningPath(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/learning-paths/${slug}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.path;
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const path = await getLearningPath(resolvedParams.slug);
  
  if (!path) {
    return {
      title: 'Ruta no encontrada - Luis Granero',
    };
  }
  
  return {
    title: `${path.title} - Cursos Luis Granero`,
    description: path.description,
    keywords: path.topics.join(', '),
    openGraph: {
      title: path.title,
      description: path.description,
      type: 'article',
    }
  };
}

export default async function LearningPathPage({ params }: Props) {
  const resolvedParams = await params;
  const path = await getLearningPath(resolvedParams.slug);
  
  if (!path) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <LearningPathDetail path={path} />
      <Footer />
    </main>
  );
}