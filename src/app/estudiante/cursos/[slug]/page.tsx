// src/app/estudiante/cursos/[slug]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface Article {
  _id: string
  title: string
  slug: string
  order: number
  duration?: string
  isCompleted: boolean
  completedAt?: string
}

interface CourseProgressData {
  course: {
    _id: string
    title: string
    description: string
    slug: string
    icon: string
    totalArticles: number
  }
  progress: {
    _id: string
    progress: number
    completedArticles: number
    totalArticles: number
    startedAt: string
    lastAccessedAt: string
    timeSpent: number
    certificateIssued: boolean
    certificateIssuedAt?: string
  }
  articles: Article[]
}

export default function CourseProgressPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CourseProgressData | null>(null)
  const [error, setError] = useState('')
  const [updatingArticle, setUpdatingArticle] = useState<string | null>(null)

  useEffect(() => {
    fetchCourseProgress()
  }, [params.slug])

  const fetchCourseProgress = async () => {
    try {
      const res = await fetch(`/api/student/courses/${params.slug}/progress`)

      if (res.status === 401) {
        router.push('/estudiante/login')
        return
      }

      const result = await res.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error || 'Error al cargar el progreso del curso')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const toggleArticleCompletion = async (articleSlug: string, isCompleted: boolean) => {
    setUpdatingArticle(articleSlug)
    try {
      const res = await fetch(`/api/student/courses/${params.slug}/articles/${articleSlug}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted })
      })

      if (res.ok) {
        // Refresh data
        await fetchCourseProgress()
      } else {
        setError('Error al actualizar el progreso')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setUpdatingArticle(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Cargando progreso...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <Link
              href="/estudiante/dashboard"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/estudiante/dashboard"
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              ← Volver al Dashboard
            </Link>
          </div>

          {/* Course Header */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{data.course.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {data.course.title}
                  </h1>
                  <p className="text-gray-400">{data.course.description}</p>
                </div>
              </div>
              {data.progress.certificateIssued && (
                <Link
                  href={`/estudiante/certificados/${data.progress._id}`}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  📜 Ver Certificado
                </Link>
              )}
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-cyan-400 text-2xl font-bold">
                  {Math.round(data.progress.progress)}%
                </div>
                <div className="text-gray-400 text-sm">Completado</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-green-400 text-2xl font-bold">
                  {data.progress.completedArticles}/{data.progress.totalArticles}
                </div>
                <div className="text-gray-400 text-sm">Lecciones</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-purple-400 text-2xl font-bold">
                  {formatTimeSpent(data.progress.timeSpent)}
                </div>
                <div className="text-gray-400 text-sm">Tiempo Total</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-blue-400 text-sm font-bold">
                  {formatDate(data.progress.startedAt)}
                </div>
                <div className="text-gray-400 text-sm">Inicio</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Progreso General</span>
                <span className="text-gray-400 text-sm">
                  {Math.round(data.progress.progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${data.progress.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Certificate Notice */}
          {data.progress.progress === 100 && data.progress.certificateIssued && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎉</span>
                <div>
                  <h3 className="text-green-400 font-bold text-lg mb-1">
                    ¡Felicitaciones! Has completado el curso
                  </h3>
                  <p className="text-gray-300">
                    Tu certificado fue emitido el {formatDate(data.progress.certificateIssuedAt!)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Articles List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">📚 Lecciones del Curso</h2>

            <div className="space-y-4">
              {data.articles.map((article) => (
                <div
                  key={article._id}
                  className={`bg-gray-900 border rounded-lg p-6 transition-all ${
                    article.isCompleted
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-gray-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => toggleArticleCompletion(article.slug, article.isCompleted)}
                        disabled={updatingArticle === article.slug}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          article.isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600 hover:border-cyan-400'
                        } ${updatingArticle === article.slug ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      >
                        {article.isCompleted && <span className="text-white text-lg">✓</span>}
                      </button>

                      {/* Article Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-gray-500 font-mono text-sm">
                            #{article.order.toString().padStart(2, '0')}
                          </span>
                          <Link
                            href={`/cursos/${params.slug}/${article.slug}`}
                            className={`text-lg font-bold transition-colors ${
                              article.isCompleted
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-white hover:text-cyan-400'
                            }`}
                          >
                            {article.title}
                          </Link>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          {article.duration && (
                            <span className="text-gray-400">⏱️ {article.duration}</span>
                          )}
                          {article.isCompleted && article.completedAt && (
                            <span className="text-green-400">
                              ✓ Completado el {formatDate(article.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/cursos/${params.slug}/${article.slug}`}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                          article.isCompleted
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        }`}
                      >
                        {article.isCompleted ? 'Revisar' : 'Continuar'} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Complete but no Certificate */}
          {data.progress.progress === 100 && !data.progress.certificateIssued && (
            <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-6 mt-8">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎓</span>
                <div>
                  <h3 className="text-cyan-400 font-bold text-lg mb-1">
                    ¡Has completado todas las lecciones!
                  </h3>
                  <p className="text-gray-300">
                    Tu certificado se está generando. Recibirás una notificación cuando esté listo.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
