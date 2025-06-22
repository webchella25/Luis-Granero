// src/components/admin/editors/TechStackEditor.js
'use client'
import { useState } from 'react'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function TechStackEditor({ data, onUpdate }) {
  const [techStack, setTechStack] = useState(data.techStack || [])

  const handleTechChange = (index, field, value) => {
    const updatedTech = [...techStack]
    updatedTech[index] = { ...updatedTech[index], [field]: value }
    setTechStack(updatedTech)
    onUpdate('techStack', updatedTech)
  }

  const addTech = () => {
    const newTech = {
      name: 'Nueva Tecnología',
      level: 80,
      color: '#00FFFF'
    }
    const updatedTech = [...techStack, newTech]
    setTechStack(updatedTech)
    onUpdate('techStack', updatedTech)
  }

  const removeTech = (index) => {
    const updatedTech = techStack.filter((_, i) => i !== index)
    setTechStack(updatedTech)
    onUpdate('techStack', updatedTech)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Tech Stack</h3>
          <p className="text-gray-400">Gestiona las tecnologías que dominas</p>
        </div>
        <button
          onClick={addTech}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Agregar Tecnología</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techStack.map((tech, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-medium">{tech.name}</h4>
              <button
                onClick={() => removeTech(index)}
                className="text-red-400 hover:text-red-300"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={tech.name}
                  onChange={(e) => handleTechChange(index, 'name', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel (%) - {tech.level}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tech.level}
                  onChange={(e) => handleTechChange(index, 'level', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="mt-2 bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${tech.level}%`,
                      backgroundColor: tech.color
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tech.color}
                    onChange={(e) => handleTechChange(index, 'color', e.target.value)}
                    className="w-12 h-8 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={tech.color}
                    onChange={(e) => handleTechChange(index, 'color', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}