// src/components/admin/editors/ServicesEditor.js
'use client'
import { useState, useEffect } from 'react'

export default function ServicesEditor({ data, onChange }) {
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState(data || [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (service) => {
    const isSelected = selectedServices.some(s => s._id === service._id)
    
    let updatedServices
    if (isSelected) {
      updatedServices = selectedServices.filter(s => s._id !== service._id)
    } else {
      updatedServices = [...selectedServices, service]
    }
    
    setSelectedServices(updatedServices)
    onChange(updatedServices)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Servicios en Homepage
        </h3>
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Servicios en Homepage
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona qué servicios mostrar en la página principal
          </p>
        </div>
        <div className="text-2xl">⚡</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servicios Disponibles */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Servicios Disponibles ({services.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s._id === service._id)
              
              return (
                <div
                  key={service._id}
                  onClick={() => toggleService(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {service.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {service.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-semibold text-cyan-600">
                      {service.pricing?.startingPrice}
                    </span>
                    <span className="text-xs text-gray-500">
                      {service.deliveryTime}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vista Previa */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Vista Previa ({selectedServices.length} seleccionados)
          </h4>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            {selectedServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {selectedServices.map((service) => (
                  // Continuación de ServicesEditor.js
                  <div key={service._id} className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color || 'from-cyan-400 to-blue-500'}`}>
                        <span className="text-white text-lg">{service.icon}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {service.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.subtitle}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-semibold text-cyan-600">
                            Desde {service.pricing?.startingPrice}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {service.deliveryTime}
                          </span>
                        </div>
                        
                        {service.technologies && service.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {service.technologies.slice(0, 3).map((tech, index) => (
                              <span key={index} className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded">
                                {tech}
                              </span>
                            ))}
                            {service.technologies.length > 3 && (
                              <span className="text-xs text-gray-500">+{service.technologies.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No hay servicios seleccionados
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Selecciona servicios de la lista para mostrarlos en la homepage
                </p>
              </div>
            )}
          </div>
          
          {/* Configuración adicional */}
          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Configuración de Sección
            </h5>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Título de la sección
                </label>
                <input
                  type="text"
                  defaultValue="Mis Servicios"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  defaultValue="Soluciones web personalizadas para tu negocio"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showViewAllButton"
                  defaultChecked={true}
                  className="mr-2"
                />
                <label htmlFor="showViewAllButton" className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrar botón "Ver todos los servicios"
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orden de los servicios */}
      {selectedServices.length > 1 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Orden de Visualización
          </h4>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Arrastra para reordenar los servicios:
            </p>
            
            <div className="space-y-2">
              {selectedServices.map((service, index) => (
                <div
                  key={service._id}
                  className="flex items-center space-x-3 bg-white dark:bg-gray-600 p-3 rounded border border-gray-200 dark:border-gray-500 cursor-move"
                >
                  <span className="text-gray-400">⋮⋮</span>
                  <span className="text-lg">{service.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {service.title}
                  </span>
                  <span className="text-sm text-gray-500 ml-auto">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}