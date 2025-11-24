// src/app/admin/certificados/page.js
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrophyIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  useEffect(() => {
    fetchCertificates()
  }, [search, pagination.page])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        page: pagination.page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/certificates?${params}`)
      const data = await response.json()

      if (data.success) {
        setCertificates(data.certificates)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
              Certificados Emitidos
            </h1>
            <p className="text-gray-400 mt-1">
              Gestión y seguimiento de todos los certificados
            </p>
          </div>
          <a
            href="/api/admin/students/export?type=certificates"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar CSV
          </a>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Certificados</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.thisMonth}
              </div>
              <div className="text-sm text-gray-400">Este Mes</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-6">
              <div className="text-3xl font-bold text-white mb-1">
                {stats.lastMonth}
              </div>
              <div className="text-sm text-gray-400">Mes Pasado</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-3xl font-bold text-white">
                  {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                </div>
                {stats.growthRate >= 0 ? (
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                ) : (
                  <ArrowTrendingDownIcon className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="text-sm text-gray-400">Crecimiento Mensual</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por estudiante, curso o ID de certificado..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-white">Cargando certificados...</div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {search ? 'No se encontraron certificados' : 'No hay certificados emitidos aún'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID Certificado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha Emisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Completado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrophyIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-yellow-400 font-mono text-sm">
                            {cert.certificateId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/estudiantes/${cert.student._id}`}
                          className="hover:text-cyan-400"
                        >
                          <div className="text-white font-semibold">
                            {cert.student.fullName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {cert.student.email}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/cursos/${cert.course._id}/estudiantes`}
                          className="hover:text-cyan-400"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cert.course.icon}</span>
                            <span className="text-white font-semibold">
                              {cert.course.title}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${cert.progress}%` }}
                            />
                          </div>
                          <span className="text-green-400 font-semibold">
                            {Math.round(cert.progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {formatDate(cert.certificateDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {formatDate(cert.completedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
