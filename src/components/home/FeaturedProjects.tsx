// src/components/home/FeaturedProjects.tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Project {
  slug: string
  title: string
  description: string
  image?: string
  technologies?: string[]
  category?: string
}

interface FeaturedProjectsProps {
  projects: Project[]
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            💼 Proyectos Destacados
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Algunos de los proyectos en los que he trabajado
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/portfolio/${project.slug}`}
                className="group block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all hover:transform hover:scale-105"
              >
                {/* Image */}
                {project.image ? (
                  <div className="relative h-48 bg-gray-700 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-6xl">💼</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {project.category && (
                    <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {project.category}
                    </span>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
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
            href="/portfolio"
            className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold transition-all"
          >
            Ver Todos los Proyectos →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
