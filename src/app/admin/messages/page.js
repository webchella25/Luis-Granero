'use client'
import { useState, useEffect } from 'react'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, archived: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadMessages()
  }, [statusFilter, priorityFilter, searchQuery])

  const loadMessages = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/admin/messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        loadMessages()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handlePriorityChange = async (messageId, newPriority) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      })
      
      if (response.ok) {
        loadMessages()
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const handleDelete = async (messageId) => {
    if (!confirm('Seguro que quieres eliminar este mensaje?')) return
    
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadMessages()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const openMessageModal = (message) => {
    setSelectedMessage(message)
    setShowModal(true)
    
    if (message.status === 'new') {
      handleStatusChange(message._id, 'read')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500',
      read: 'bg-yellow-500',
      replied: 'bg-green-500',
      archived: 'bg-gray-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-red-400'
    }
    return colors[priority] || 'text-gray-400'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} horas`
    if (diffInHours < 48) return 'Ayer'
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Cargando mensajes...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Mensajes y Consultas</h1>
        <p className="text-gray-400">Gestiona los mensajes recibidos desde el formulario de contacto</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Total</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/30">
          <div className="text-gray-400 text-sm">Nuevos</div>
          <div className="text-2xl font-bold text-blue-400">{stats.new}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-gray-400 text-sm">Leidos</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.read}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
          <div className="text-gray-400 text-sm">Respondidos</div>
          <div className="text-2xl font-bold text-green-400">{stats.replied}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm">Archivados</div>
          <div className="text-2xl font-bold text-gray-400">{stats.archived}</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nombre, email, empresa..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              <option value="all">Todos</option>
              <option value="new">Nuevos</option>
              <option value="read">Leidos</option>
              <option value="replied">Respondidos</option>
              <option value="archived">Archivados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Prioridad</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            >
              <option value="all">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No hay mensajes con estos filtros
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {messages.map((message) => (
              <div
                key={message._id}
                onClick={() => openMessageModal(message)}
                className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(message.status)}`}></span>
                      <h3 className="text-white font-medium truncate">
                        {message.personal?.name || 'Sin nombre'}
                      </h3>
                      {message.status === 'new' && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          NUEVO
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span>{message.personal?.email}</span>
                      {message.personal?.phone && <span>{message.personal?.phone}</span>}
                      {message.personal?.company && <span>{message.personal?.company}</span>}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>Proyecto:</strong> {message.project?.type || 'No especificado'}
                      {message.project?.budget && (
                        <span className="ml-3">
                          <strong>Presupuesto:</strong> {message.project?.budget}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {message.project?.description || 'Sin descripcion'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                    <span className={`text-2xl ${getPriorityColor(message.priority)}`}>
                      {message.priority === 'high' && '🔴'}
                      {message.priority === 'medium' && '🟡'}
                      {message.priority === 'low' && '⚪'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedMessage.personal?.name}
                  </h2>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <a 
                      href={`mailto:${selectedMessage.personal?.email}`}
                      className="hover:text-cyan-400 transition-colors"
                    >
                      {selectedMessage.personal?.email}
                    </a>
                    {selectedMessage.personal?.phone && (
                      <a 
                        href={`tel:${selectedMessage.personal?.phone}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {selectedMessage.personal?.phone}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedMessage.status}
                  onChange={(e) => {
                    handleStatusChange(selectedMessage._id, e.target.value)
                    setSelectedMessage({...selectedMessage, status: e.target.value})
                  }}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                >
                  <option value="new">Nuevo</option>
                  <option value="read">Leido</option>
                  <option value="replied">Respondido</option>
                  <option value="archived">Archivado</option>
                </select>

                <select
                  value={selectedMessage.priority}
                  onChange={(e) => {
                    handlePriorityChange(selectedMessage._id, e.target.value)
                    setSelectedMessage({...selectedMessage, priority: e.target.value})
                  }}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                >
                  <option value="low">Prioridad Baja</option>
                  <option value="medium">Prioridad Media</option>
                  <option value="high">Prioridad Alta</option>
                </select>

                <button
                  onClick={() => handleDelete(selectedMessage._id)}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Informacion del Proyecto</h3>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Tipo de Proyecto:</span>
                      <p className="text-white">{selectedMessage.project?.type || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Presupuesto:</span>
                      <p className="text-white">{selectedMessage.project?.budget || 'A consultar'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Timeline:</span>
                      <p className="text-white">{selectedMessage.project?.timeline || 'Flexible'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Empresa:</span>
                      <p className="text-white">{selectedMessage.personal?.company || 'Particular'}</p>
                    </div>
                  </div>
                  
                  {selectedMessage.personal?.website && (
                    <div>
                      <span className="text-gray-400 text-sm">Website:</span>
                      <p className="text-white">
                        <a 
                          href={selectedMessage.personal.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          {selectedMessage.personal.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Descripcion</h3>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedMessage.project?.description || 'Sin descripcion'}
                  </p>
                </div>
              </div>

              {(selectedMessage.project?.technologies?.length > 0 || selectedMessage.project?.features?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedMessage.project?.technologies?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Tecnologias</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMessage.project.technologies.map((tech, i) => (
                          <span key={i} className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedMessage.project?.features?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMessage.project.features.map((feature, i) => (
                          <span key={i} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Metadata</h3>
                <div className="bg-gray-700/50 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                  <div>Fecha: {new Date(selectedMessage.createdAt).toLocaleString('es-ES')}</div>
                  <div>Fuente: {selectedMessage.source || 'Website Form'}</div>
                  {selectedMessage.metadata?.ipAddress && (
                    <div>IP: {selectedMessage.metadata.ipAddress}</div>
                  )}
                  {selectedMessage.metadata?.referrer && (
                    <div>Referrer: {selectedMessage.metadata.referrer}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}