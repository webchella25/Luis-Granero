// src/app/admin/email-courses/[id]/edit/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export default function EditEmailCoursePage({ params }) {
  const unwrappedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    icon: '📧',
    color: 'cyan',
    totalDays: 5,
    ctaText: 'Comenzar Gratis',
    sendTime: '09:00',
    isActive: true,
    benefits: [''],
    whatYouLearn: [''],
    testimonials: [],
    emails: []
  })

  useEffect(() => {
    fetchCourse()
  }, [])

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/admin/email-courses/${unwrappedParams.id}`)
      const data = await res.json()

      if (res.ok) {
        setFormData({
          ...data.course,
          benefits: data.course.benefits?.length ? data.course.benefits : [''],
          whatYouLearn: data.course.whatYouLearn?.length ? data.course.whatYouLearn : [''],
          emails: data.course.emails?.length
            ? data.course.emails
            : Array.from({ length: 5 }, (_, i) => ({
                day: i + 1,
                subject: '',
                htmlContent: '',
                previewText: ''
              }))
        })
      } else {
        setError('Curso no encontrado')
      }
    } catch (err) {
      setError('Error al cargar curso')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleEmailChange = (index, field, value) => {
    setFormData(prev => {
      const newEmails = [...prev.emails]
      newEmails[index] = {
        ...newEmails[index],
        [field]: value
      }
      return { ...prev, emails: newEmails }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Limpiar arrays vacíos
      const cleanData = {
        ...formData,
        benefits: formData.benefits.filter(b => b.trim()),
        whatYouLearn: formData.whatYouLearn.filter(w => w.trim())
      }

      const res = await fetch(`/api/admin/email-courses/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin/email-courses')
      } else {
        setError(data.error || 'Error al actualizar curso')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Cargando curso...</div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="p-8">
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
        <Link
          href="/admin/email-courses"
          className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block"
        >
          ← Volver a cursos
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/email-courses"
          className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block"
        >
          ← Volver a cursos
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Editar Curso</h1>
        <p className="text-gray-400">{formData.title}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Información Básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Título del Curso *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Slug (URL) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                required
                pattern="[a-z0-9-]+"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Icono (Emoji)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                maxLength={2}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Color</label>
              <select
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="cyan">Cyan</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="orange">Orange</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2">Descripción Corta</label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                maxLength={100}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2">Descripción Completa *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Texto del CTA</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                Curso activo
              </label>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Beneficios</h2>

          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                placeholder="Escribe un beneficio..."
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('benefits', index)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                🗑️
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddArrayItem('benefits')}
            className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            + Añadir beneficio
          </button>
        </div>

        {/* Qué aprenderás */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Qué Aprenderás</h2>

          {formData.whatYouLearn.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange('whatYouLearn', index, e.target.value)}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                placeholder="Escribe un tema..."
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('whatYouLearn', index)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                🗑️
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddArrayItem('whatYouLearn')}
            className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
          >
            + Añadir tema
          </button>
        </div>

        {/* Emails */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Emails del Curso</h2>

          {formData.emails.map((email, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">Día {email.day}</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-2">Asunto del Email *</label>
                  <input
                    type="text"
                    value={email.subject}
                    onChange={(e) => handleEmailChange(index, 'subject', e.target.value)}
                    className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                    placeholder={`Asunto del email día ${email.day}`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Texto de Vista Previa</label>
                  <input
                    type="text"
                    value={email.previewText}
                    onChange={(e) => handleEmailChange(index, 'previewText', e.target.value)}
                    className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500"
                    placeholder="Texto que aparece en la bandeja de entrada..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Contenido HTML *</label>
                  <textarea
                    value={email.htmlContent}
                    onChange={(e) => handleEmailChange(index, 'htmlContent', e.target.value)}
                    className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 font-mono text-sm"
                    rows={10}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Variables: {`{{name}}`}, {`{{email}}`}, {`{{unsubscribe_url}}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <Link
            href="/admin/email-courses"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
