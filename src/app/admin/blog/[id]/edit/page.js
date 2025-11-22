// src/app/admin/blog/[id]/edit/page.js
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import BlogPostForm from '@/components/admin/forms/BlogPostForm'

export default function EditBlogPost() {
  const [postData, setPostData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const params = useParams()

  useEffect(() => {
    fetchPostData()
  }, [params.id])

  const fetchPostData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Post no encontrado')
      }
      
      const data = await response.json()
      setPostData(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p>Cargando post...</p>
        </div>
      </div>
    )
  }

  if (error || !postData) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error || 'Post no encontrado'}</p>
            <Link 
              href="/admin/blog" 
              className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Volver al blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link 
            href="/admin/blog" 
            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Volver al blog</span>
          </Link>
        </div>
        
        <BlogPostForm 
          initialData={postData} 
          isEditing={true} 
        />
      </div>
    </div>
  )
}