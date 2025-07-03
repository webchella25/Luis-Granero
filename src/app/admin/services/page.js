// src/app/admin/services/page.js
'use client'
import { useState, useEffect } from 'react'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tus servicios y precios
          </p>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg">
          + Nuevo Servicio
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          services.map(service => (
            <div key={service._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-colors">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{service.icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-cyan-600">
                  {service.pricing?.startingPrice}
                </span>
                <button className="text-sm text-cyan-600 hover:text-cyan-700">
                  Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}