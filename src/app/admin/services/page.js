// src/app/admin/services/page.js - VERSIÓN CORREGIDA
'use client'
import { useState, useEffect } from 'react'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/services')
      
      if (response.ok) {
        const data = await response.json()
        // Asegurar que data es un array
        setServices(Array.isArray(data) ? data : [])
      } else {
        console.error('Error fetching services:', response.status)
        setServices([]) // Array vacío por defecto
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Error cargando servicios')
      setServices([]) // Array vacío por defecto
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Servicios
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cargando servicios...
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Servicios
            </h1>
            <p className="text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
          <button 
            onClick={fetchServices}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tus servicios y precios ({services.length} servicios)
          </p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
          + Nuevo Servicio
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚡</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {services.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total servicios</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                €{services.reduce((sum, s) => {
                  const price = parseInt(s.pricing?.startingPrice?.replace(/[€,]/g, '') || '0')
                  return sum + price
                }, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className="text-2xl mr-3">👁️</span>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {services.reduce((sum, s) => sum + (s.stats?.views || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total vistas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length > 0 ? (
          services.map(service => (
            <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{service.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {service.subtitle}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {service.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {service.technologies?.slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {service.technologies?.length > 3 && (
                    <span className="text-xs text-gray-500">+{service.technologies.length - 3}</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-cyan-600">
                    {service.pricing?.startingPrice || 'Consultar'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {service.deliveryTime}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-sm bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors">
                    Editar
                  </button>
                  <button className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <span className="text-6xl mb-4 block">⚡</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay servicios configurados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Comienza creando tu primer servicio
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
              Crear Primer Servicio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}