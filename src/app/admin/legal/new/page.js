// src/app/admin/legal/new/page.js
'use client'
import LegalPageForm from '@/components/admin/forms/LegalPageForm'

export default function NewLegalPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Nueva Página Legal</h1>
        <p className="text-gray-400">Crea una nueva página legal para tu sitio web</p>
      </div>
      
      <LegalPageForm />
    </div>
  )
}