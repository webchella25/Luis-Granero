// src/app/admin/services/page.js - VERSIÓN CORREGIDA
'use client'
import { useState, useEffect } from 'react'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/services')
      
      if (response.ok) {
        const data = await response.json()
        setServices(Array.isArray(data) ? data : [])
      } else {
        console.error('Error fetching services:', response.status)
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Error cargando servicios')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditService = (service) => {
    setEditingService({
      ...service,
      technologies: service.technologies || [],
      features: service.features || [],
      examples: service.examples || []
    })
    setShowModal(true)
  }

  const handleNewService = () => {
    setEditingService({
      _id: null,
      title: '',
      subtitle: '',
      description: '',
      icon: '💻',
      color: 'from-cyan-400 to-blue-500',
      technologies: [],
      features: [],
      examples: [],
      pricing: {
        startingPrice: '',
        priceRange: { min: 0, max: 0 }
      },
      deliveryTime: '',
      isActive: true
    })
    setShowModal(true)
  }

  const handleSaveService = async () => {
    if (!editingService.title.trim()) {
      alert('El título es obligatorio')
      return
    }

    setSaving(true)
    try {
      const url = editingService._id 
        ? `/api/admin/services/${editingService._id}`
        : '/api/admin/services'
      
      const method = editingService._id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingService)
      })

      if (response.ok) {
        await fetchServices()
        setShowModal(false)
        setEditingService(null)
        alert('Servicio guardado correctamente')
      } else {
        alert('Error guardando servicio')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error guardando servicio')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchServices()
        alert('Servicio eliminado correctamente')
      } else {
        alert('Error eliminando servicio')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error eliminando servicio')
    }
  }

  const updateServiceField = (field, value) => {
    setEditingService(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateArrayField = (field, index, value) => {
    setEditingService(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setEditingService(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setEditingService(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
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
        <button 
          onClick={handleNewService}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
        >
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
                  <button 
                    onClick={() => handleEditService(service)}
                    className="text-sm bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service._id)}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
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
            <button 
              onClick={handleNewService}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Crear Primer Servicio
            </button>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingService._id ? 'Editar' : 'Nuevo'} Servicio
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icono (Emoji)
                    </label>
                    <input
                      type="text"
                      value={editingService.icon}
                      onChange={(e) => updateServiceField('icon', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="💻"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título del Servicio
                    </label>
                    <input
                      type="text"
                      value={editingService.title}
                      onChange={(e) => updateServiceField('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Desarrollo Web Moderno"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={editingService.subtitle}
                    onChange={(e) => updateServiceField('subtitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="React, Next.js, TypeScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    value={editingService.description}
                    onChange={(e) => updateServiceField('description', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Describe el servicio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tecnologías
                  </label>
                  <div className="space-y-2">
                    {editingService.technologies.map((tech, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => updateArrayField('technologies', index, e.target.value)}
                          placeholder="Tecnología"
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={() => removeArrayItem('technologies', index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addArrayItem('technologies')}
                      className="text-cyan-600 hover:text-cyan-700 text-sm"
                    >
                      + Añadir tecnología
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio Inicial
                    </label>
                    <input
                      type="text"
                      value={editingService.pricing?.startingPrice || ''}
                      onChange={(e) => updateServiceField('pricing', {
                        ...editingService.pricing,
                        startingPrice: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="1,500€"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo de Entrega
                    </label>
                    <input
                      type="text"
                      value={editingService.deliveryTime}
                      onChange={(e) => updateServiceField('deliveryTime', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="2-4 semanas"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveService}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Servicio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}