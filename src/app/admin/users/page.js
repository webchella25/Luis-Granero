// src/app/admin/users/page.js
'use client'
import { useState, useEffect } from 'react'
import { TrashIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, admin, user

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers(users.filter(u => u._id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    return user.role === filter
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <p className="text-gray-400">Administra los usuarios del sistema</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todos ({users.length})
        </button>
        <button
          onClick={() => setFilter('admin')}
          className={`px-4 py-2 rounded-md ${
            filter === 'admin'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
        <button
          onClick={() => setFilter('user')}
          className={`px-4 py-2 rounded-md ${
            filter === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Usuarios ({users.filter(u => u.role === 'user').length})
        </button>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">No hay usuarios que mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                  }`}>
                    {user.role === 'admin' ? (
                      <ShieldCheckIcon className="w-6 h-6 text-purple-400" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {user.username || user.email}
                    </h3>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span>Registrado: {formatDate(user.createdAt)}</span>
                      {user.lastLogin && (
                        <span>• Último acceso: {formatDate(user.lastLogin)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                  
                  <button
                    onClick={() => toggleRole(user._id, user.role)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {user.role === 'admin' ? 'Hacer Usuario' : 'Hacer Admin'}
                  </button>
                  
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar usuario"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}