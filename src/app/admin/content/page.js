// src/app/admin/content/page.js (actualizado)
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
      title: 'Paquetes',
      description: 'Gestionar paquetes de desarrollo',
      href: '/admin/content/packages',
      icon: '📦',
      color: 'bg-purple-600'
    },
    {
      title: 'Add-ons',
      description: 'Servicios adicionales y complementos',
      href: '/admin/content/addons',
      icon: '🔧',
      color: 'bg-orange-600'
    },
    {
      title: 'Contacto',
      description: 'Página de contacto y formularios',
      href: '/admin/content/contact',
      icon: '📞',
      color: 'bg-pink-600'
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
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-cyan-400 text-2xl font-bold">8</div>
            <div className="text-gray-400 text-sm">Servicios Activos</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-green-400 text-2xl font-bold">3</div>
            <div className="text-gray-400 text-sm">Paquetes</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-purple-400 text-2xl font-bold">12</div>
            <div className="text-gray-400 text-sm">Add-ons</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-orange-400 text-2xl font-bold">96%</div>
            <div className="text-gray-400 text-sm">Completado</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">Servicios actualizados</span>
              </div>
              <span className="text-sm text-gray-500">Hace 5 min</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Nuevo paquete añadido</span>
              </div>
              <span className="text-sm text-gray-500">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Add-ons configurados</span>
              </div>
              <span className="text-sm text-gray-500">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}