// src/app/admin/legal/[id]/edit/page.js
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import LegalPageForm from '@/components/admin/forms/LegalPageForm'

export default function EditLegalPage() {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    fetchPageData()
  }, [])

  const fetchPageData = async () => {
    try {
      const response = await fetch(`/api/admin/legal/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPageData(data.page)
      }
    } catch (error) {
      console.error('Error fetching page:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando página...</div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Página no encontrada</div>
        <Link href="/admin/legal" className="text-cyan-400">
          Volver a páginas legales
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar Página Legal</h1>
        <p className="text-gray-400">Modifica: {pageData.title}</p>
      </div>
      
      <LegalPageForm initialData={pageData} isEditing={true} />
    </div>
  )
}