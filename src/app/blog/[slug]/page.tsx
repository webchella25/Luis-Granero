// src/app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Header from '../../../components/layout/Header'
import Footer from '../../../components/layout/Footer'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Función para obtener el post
async function getPost(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/blog/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// Metadata dinámica
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post no encontrado - Luis Granero',
      description: 'El artículo que buscas no existe.'
    }
  }

  return {
    title: `${post.title} - Luis Granero Blog`,
    description: post.excerpt || post.description,
  }
}

// Componente principal
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-8">{post.title}</h1>
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
      <Footer />
    </main>
  )
}

// Generar rutas estáticas
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/public/blog`)
    const data = await response.json()
    
    return data.posts?.map((post: any) => ({
      slug: post.slug,
    })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}