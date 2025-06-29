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

        {/* Recent Updates */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Actualizaciones Recientes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">Homepage actualizada</span>
              </div>
              <span className="text-sm text-gray-500">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Servicios modificados</span>
              </div>
              <span className="text-sm text-gray-500">Ayer</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Contacto configurado</span>
              </div>
              <span className="text-sm text-gray-500">Hace 3 días</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/content/homepage"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors"
            >
              ✏️ Editar Hero
            </Link>
            <Link
              href="/admin/content/services"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors"
            >
              🛠️ Gestionar Servicios
            </Link>
            <Link
              href="/admin/content/contact"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors"
            >
              📞 Config. Contacto
            </Link>
            <Link
              href="/admin/content/about"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors"
            >
              👨‍💻 Sobre Mí
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-cyan-400 mb-3">💡 Consejos</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Actualiza regularmente el contenido para mejorar tu SEO</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Mantén consistencia en el tono y estilo de tu marca personal</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span>Revisa que todos los enlaces y formularios funcionen correctamente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}