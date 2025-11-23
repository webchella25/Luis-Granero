// src/app/unsubscribe/[token]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function UnsubscribePage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [unsubscribed, setUnsubscribed] = useState(false)
  const [error, setError] = useState('')
  const [subscriber, setSubscriber] = useState<any>(null)

  useEffect(() => {
    fetchSubscriber()
  }, [])

  const fetchSubscriber = async () => {
    try {
      const res = await fetch(`/api/unsubscribe/${params.token}`)
      const data = await res.json()

      if (res.ok) {
        setSubscriber(data.subscriber)
      } else {
        setError(data.error || 'Token inválido')
      }
    } catch (err) {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/unsubscribe/${params.token}`, {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setUnsubscribed(true)
      } else {
        setError(data.error || 'Error al darse de baja')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="text-white text-xl">Cargando...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
            <p className="text-xl text-gray-300">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (unsubscribed) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Te has dado de baja correctamente
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Ya no recibirás más emails de este curso.
            </p>
            <p className="text-gray-400 mb-8">
              Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte.
            </p>
            <a
              href="/cursos"
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg font-bold transition-colors"
            >
              Ver otros cursos
            </a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            ¿Seguro que quieres darte de baja?
          </h1>

          {subscriber && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Email:</strong> {subscriber.email}
              </p>
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Nombre:</strong> {subscriber.name}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Curso:</strong> {subscriber.course}
              </p>
            </div>
          )}

          <p className="text-xl text-gray-300 mb-8">
            Ya no recibirás más emails de este curso. Siempre puedes volver a suscribirte cuando quieras.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Sí, darme de baja'}
            </button>
            <a
              href="/cursos"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold transition-colors"
            >
              Cancelar
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
