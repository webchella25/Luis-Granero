// src/app/admin/content/page.js
'use client'
import Link from 'next/link'

const pages = [
  { id: 'homepage', name: 'Página de Inicio', description: 'Hero, servicios, testimonios', status: 'Publicada' },
  { id: 'about', name: 'Sobre Mí', description: 'Historia, experiencia, habilidades', status: 'Publicada' },
  { id: 'services', name: 'Servicios', description: 'Lista de servicios y precios', status: 'Publicada' },
]

export default function ContentManager() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gestión de Contenido</h1>
        <p className="text-gray-400">Edita el contenido de las páginas principales</p>
      </div>

      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-700">
          {pages.map((page) => (
            <li key={page.id}>
              <Link
                href={`/admin/content/${page.id}`}
                className="block hover:bg-gray-700 px-4 py-4 sm:px-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-cyan-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">
                          {page.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {page.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {page.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {page.status}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}