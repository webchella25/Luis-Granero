// src/app/admin/content/page.js
'use client'
import Link from 'next/link'

export default function ContentManagement() {
  const contentSections = [
    {
      title: 'Homepage',
      description: 'Editar contenido de la página principal',
      href: '/admin/content/homepage',
      icon: '🏠',
      color: 'bg-cyan-600'
    },
    {
      title: 'Sobre Mí',
      description: 'Información personal y profesional',
      href: '/admin/content/about',
      icon: '👨‍💻',
      color: 'bg-green-600'
    },
    {
      title: 'Servicios',
      description: 'Gestionar servicios ofrecidos',
      href: '/admin/content/services',
      icon: '🛠️',
      color: 'bg-blue-600'
    },
    {
      title: 'Contacto',
      description: 'Página de contacto y formularios',
      href: '/admin/content/contact',
      icon: '📞',
      color: 'bg-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Contenido</h1>
          <p className="text-gray-400">Edita el contenido de las páginas de tu sitio web</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="group bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 hover:transform hover:scale-105 border border-gray-700 hover:border-gray-600"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${section.color} p-3 rounded-lg text-2xl`}>
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </h3>
                </div>
              </div>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">4</div>
            <div className="text-gray-400">Páginas gestionables</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-gray-400">Personalizable</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">SEO</div>
            <div className="text-gray-400">Optimizado</div>
          </div>
        </div>
      </div>
    </div>
  )
}