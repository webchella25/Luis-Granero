// src/components/home/LatestPosts.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readTime?: string
  category?: {
    name: string
    slug: string
  }
}

interface LatestPostsProps {
  posts: Post[]
}

export default function LatestPosts({ posts }: LatestPostsProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📝 Últimos Artículos
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Tutoriales, guías y reflexiones sobre desarrollo web
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-gray-900 rounded-lg p-6 hover:bg-gray-850 transition-all hover:transform hover:scale-105"
              >
                {/* Category & Read Time */}
                <div className="flex items-center justify-between mb-4">
                  {post.category && (
                    <span className="text-xs font-semibold text-cyan-400 uppercase">
                      {post.category.name}
                    </span>
                  )}
                  {post.readTime && (
                    <span className="text-xs text-gray-500">
                      {post.readTime}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Date */}
                <div className="flex items-center text-gray-500 text-sm">
                  <span>📅 {formatDate(post.publishedAt)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Ver más */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/blog"
            className="inline-block bg-gray-900 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold transition-all"
          >
            Ver Todos los Artículos →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
