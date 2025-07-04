// src/components/admin/editors/StatsEditor.js
'use client'
import { useState } from 'react'

export default function StatsEditor({ data, onChange }) {
  const [stats, setStats] = useState(data || [
    { label: "Proyectos", value: "50+", icon: "🚀" },
    { label: "Años", value: "10+", icon: "📅" },
    { label: "Clientes", value: "35+", icon: "👥" },
    { label: "Tecnologías", value: "15+", icon: "⚡" }
  ])

  const updateStat = (index, field, value) => {
    const updatedStats = stats.map((stat, i) => 
      i === index ? { ...stat, [field]: value } : stat
    )
    setStats(updatedStats)
    onChange(updatedStats)
  }

  const addStat = () => {
    const newStats = [...stats, { label: "", value: "", icon: "📊" }]
    setStats(newStats)
    onChange(newStats)
  }

  const removeStat = (index) => {
    const updatedStats = stats.filter((_, i) => i !== index)
    setStats(updatedStats)
    onChange(updatedStats)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Estadísticas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Números que demuestran tu experiencia
          </p>
        </div>
        <button
          onClick={addStat}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          + Añadir Estadística
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estadística {index + 1}
                </span>
                <button
                  onClick={() => removeStat(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕ Eliminar
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Icono
                  </label>
                  <input
                    type="text"
                    value={stat.icon}
                    onChange={(e) => updateStat(index, 'icon', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="🚀"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="50+"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Etiqueta
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Proyectos"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista Previa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Vista Previa
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}