// src/app/admin/content/services/page.js
'use client'
import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ServicesEditor() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  // Cargar servicios
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveServices = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      })
      
      if (response.ok) {
        setLastSaved(new Date())
        console.log('Servicios guardados correctamente')
      }
    } catch (error) {
      console.error('Error saving services:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddService = () => {
    setEditingService({
      id: Date.now(),
      icon: "💻",
      title: "",
      description: "",
      features: [""],
      technologies: [""],
      color: "from-cyan-400 to-blue-500",
      startingPrice: "",
      deliveryTime: ""
    })
    setShowModal(true)
  }

  const handleEditService = (service) => {
    setEditingService({ ...service })
    setShowModal(true)
  }

  const handleSaveService = () => {
    if (editingService.id && services.find(s => s.id === editingService.id)) {
      // Edit existing
      setServices(services.map(s => s.id === editingService.id ? editingService : s))
    } else {
      // Add new
      setServices([...services, editingService])
    }
    setShowModal(false)
    setEditingService(null)
  }

  const handleDeleteService = (id) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  const updateServiceField = (field, value) => {
    setEditingService(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addFeature = () => {
    setEditingService(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }))
  }

  const updateFeature = (index, value) => {
    setEditingService(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index) => {
    setEditingService(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addTechnology = () => {
    setEditingService(prev => ({
      ...prev,
      technologies: [...prev.technologies, ""]
    }))
  }

  const updateTechnology = (index, value) => {
    setEditingService(prev => ({
      ...prev,
      technologies: prev.technologies.map((t, i) => i === index ? value : t)
    }))
  }

  const removeTechnology = (index) => {
    setEditingService(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando servicios...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Servicios</h1>
          <p className="text-gray-400">Administra los servicios que ofreces</p>
          {lastSaved && (
            <p className="text-sm text-green-400 mt-2">
              Guardado: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddService}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Servicio</span>
          </button>
          <button
            onClick={saveServices}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{service.icon}</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                  title="Editar servicio"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Eliminar servicio"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {service.title}
            </h3>
            
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {service.description}
            </p>

            {/* Features preview */}
            {service.features && service.features.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Características:</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-400 mr-1">✓</span>
                      {feature}
                    </li>
                  ))}
                  {service.features.length > 3 && (
                    <li className="text-gray-500">+{service.features.length - 3} más...</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-green-400 font-semibold">
                {service.startingPrice}
              </span>
              <span className="text-gray-500">
                {service.deliveryTime}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {service.technologies?.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-700 text-cyan-400 rounded"
                >
                  {tech}
                </span>
              ))}
              {service.technologies?.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                  +{service.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">No hay servicios configurados</div>
            <button
              onClick={handleAddService}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md"
            >
              Agregar tu primer servicio
            </button>
          </div>
        )}
      </div>

      {/* Modal para editar/crear servicio */}
      {showModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  {services.find(s => s.id === editingService.id) ? 'Editar' : 'Nuevo'} Servicio
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Icon y Título */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icono (Emoji)
                    </label>
                    <input
                      type="text"
                      value={editingService.icon}
                      onChange={(e) => updateServiceField('icon', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="💻"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título del Servicio
                    </label>
                    <input
                      type="text"
                      value={editingService.title}
                      onChange={(e) => updateServiceField('title', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="Desarrollo Web Moderno"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) => updateServiceField('description', e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Descripción detallada del servicio..."
                  />
                </div>

                {/* Precio y Tiempo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio inicial
                    </label>
                    <input
                      type="text"
                      value={editingService.startingPrice}
                      onChange={(e) => updateServiceField('startingPrice', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="1,500€"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tiempo de entrega
                    </label>
                    <input
                      type="text"
                      value={editingService.deliveryTime}
                      onChange={(e) => updateServiceField('deliveryTime', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="2-4 semanas"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Características principales
                  </label>
                  {editingService.features?.map((feature, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="Característica del servicio"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    + Agregar característica
                  </button>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tecnologías
                  </label>
                  {editingService.technologies?.map((tech, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateTechnology(index, e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                        placeholder="React, Next.js, etc."
                      />
                      <button
                        onClick={() => removeTechnology(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTechnology}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    + Agregar tecnología
                  </button>
                </div>

                {/* Color gradient */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color del gradiente
                  </label>
                  <select
                    value={editingService.color}
                    onChange={(e) => updateServiceField('color', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="from-cyan-400 to-blue-500">Cyan a Azul</option>
                    <option value="from-green-400 to-emerald-500">Verde a Esmeralda</option>
                    <option value="from-purple-400 to-pink-500">Púrpura a Rosa</option>
                    <option value="from-orange-400 to-red-500">Naranja a Rojo</option>
                    <option value="from-indigo-400 to-cyan-500">Índigo a Cyan</option>
                    <option value="from-pink-400 to-purple-500">Rosa a Púrpura</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveService}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md"
                >
                  Guardar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}