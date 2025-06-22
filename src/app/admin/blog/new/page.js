// src/app/admin/blog/new/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BlogPostForm from '@/components/admin/forms/BlogPostForm'

export default function NewBlogPost() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (postData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        router.push('/admin/blog')
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nuevo Artículo</h1>
        <p className="text-gray-400">Escribe un nuevo artículo para tu blog técnico</p>
      </div>

      <BlogPostForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Crear Artículo"
      />
    </div>
  )
}