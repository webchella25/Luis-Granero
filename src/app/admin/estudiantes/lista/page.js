// src/app/admin/estudiantes/lista/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  UserIcon,
  AcademicCapIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline'

export default function StudentsList() {
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(initialFilter)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('xp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchStudents()
  }, [filter, search, sortBy, sortOrder, pagination.page])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter,
        search,
        sortBy,
        sortOrder,
        page: pagination.page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/students?${params}`)
      const data = await response.json()

      if (data.success) {
        setStudents(data.students)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatStudyTime = (minutes) => {
    if (!minutes) return '0h'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const filters = [
    { id: 'all', label: 'Todos', icon: UserIcon },
    { id: 'active', label: 'Activos', icon: FireIcon },
    { id: 'inactive', label: 'Inactivos', icon: null },
    { id: 'premium', label: 'Premium', icon: TrophyIcon },
    { id: 'at_risk', label: 'En Riesgo', icon: null },
    { id: 'completed', label: 'Con Cursos Completados', icon: AcademicCapIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">👥 Estudiantes</h1>
            <p className="text-gray-400 mt-1">
              {pagination.total} estudiantes registrados
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/api/admin/students/export?type=students"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar CSV
            </a>
            <Link
              href="/admin/estudiantes"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="xp">Por XP</option>
              <option value="level">Por Nivel</option>
              <option value="activity">Por Actividad</option>
              <option value="createdAt">Por Registro</option>
              <option value="courses">Por Cursos</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              filter === f.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f.icon && <f.icon className="w-4 h-4" />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-white">Cargando estudiantes...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">No se encontraron estudiantes</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {students.map((student) => (
              <Link
                key={student._id}
                href={`/admin/estudiantes/${student._id}`}
                className="block bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Left Side - Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      student.isPremium
                        ? 'bg-yellow-500/20 border-2 border-yellow-500'
                        : student.isActive
                        ? 'bg-green-500/20 border-2 border-green-500'
                        : 'bg-gray-700'
                    }`}>
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.username} className="w-full h-full rounded-full" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-white">
                          {student.fullName}
                        </h3>
                        {student.isPremium && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                            💎 Premium
                          </span>
                        )}
                        {student.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                            🔥 Activo
                          </span>
                        )}
                        {student.isAtRisk && (
                          <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                            ⚠️ En Riesgo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{student.email}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-purple-400">
                          Nivel {student.level}
                        </span>
                        <span className="text-cyan-400">
                          {student.totalXP.toLocaleString()} XP
                        </span>
                        {student.streak > 0 && (
                          <span className="text-orange-400">
                            🔥 {student.streak} días
                          </span>
                        )}
                        <span className="text-gray-500">
                          {formatStudyTime(student.totalStudyTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Course Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-cyan-400">
                        {student.coursesEnrolled}
                      </div>
                      <div className="text-xs text-gray-400">Inscritos</div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {student.coursesInProgress}
                      </div>
                      <div className="text-xs text-gray-400">En progreso</div>
                    </div>

                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {student.coursesCompleted}
                      </div>
                      <div className="text-xs text-gray-400">Completados</div>
                    </div>

                    {student.certificatesEarned > 0 && (
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {student.certificatesEarned}
                        </div>
                        <div className="text-xs text-gray-400">Certificados</div>
                      </div>
                    )}
                  </div>

                  {/* Activity Info */}
                  <div className="text-right text-sm text-gray-500 ml-6">
                    <div>Registro: {formatDate(student.createdAt)}</div>
                    <div>Última actividad: {formatDate(student.lastActivity)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <span className="text-gray-400">
                Página {pagination.page} de {pagination.totalPages}
              </span>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
