// src/components/admin/editors/AboutEditor.js
'use client'
import { useState } from 'react'

export default function AboutEditor({ data, onChange }) {
  const [about, setAbout] = useState(data || {
    title: "Sobre Mí",
    subtitle: "Desarrollador apasionado por crear soluciones web innovadoras",
    description: "Con más de 10 años de experiencia en desarrollo web, me especializo en crear aplicaciones modernas, escalables y de alto rendimiento.",
    highlights: [
      "10+ años de experiencia",
      "50+ proyectos completados",
      "Especialista en React/Next.js",
      "Enfoque en performance"
    ],
    image: "",
    skills: [
      { name: "React/Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Node.js", level: 85 },
      { name: "MongoDB", level: 80 }
    ],
    experience: [
      {
        company: "Freelance",
        role: "Desarrollador Full Stack",
        period: "2020 - Presente",
        description: "Desarrollo de aplicaciones web personalizadas para startups y empresas."
      }
    ]
  })

  const handleChange = (field, value) => {
    const updatedAbout = { ...about, [field]: value }
    setAbout(updatedAbout)
    onChange(updatedAbout)
  }

  const updateHighlight = (index, value) => {
    const updatedHighlights = about.highlights.map((highlight, i) => 
      i === index ? value : highlight
    )
    handleChange('highlights', updatedHighlights)
  }

  const addHighlight = () => {
    const updatedHighlights = [...about.highlights, "Nuevo logro"]
    handleChange('highlights', updatedHighlights)
  }

  const removeHighlight = (index) => {
    const updatedHighlights = about.highlights.filter((_, i) => i !== index)
    handleChange('highlights', updatedHighlights)
  }

  const updateSkill = (index, field, value) => {
    const updatedSkills = about.skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    )
    handleChange('skills', updatedSkills)
  }

  const addSkill = () => {
    const updatedSkills = [...about.skills, { name: "", level: 70 }]
    handleChange('skills', updatedSkills)
  }

  const removeSkill = (index) => {
    const updatedSkills = about.skills.filter((_, i) => i !== index)
    handleChange('skills', updatedSkills)
  }

  const updateExperience = (index, field, value) => {
    const updatedExperience = about.experience.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    )
    handleChange('experience', updatedExperience)
  }

  const addExperience = () => {
    const updatedExperience = [...about.experience, {
      company: "",
      role: "",
      period: "",
      description: ""
    }]
    handleChange('experience', updatedExperience)
  }

  const removeExperience = (index) => {
    const updatedExperience = about.experience.filter((_, i) => i !== index)
    handleChange('experience', updatedExperience)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sección Sobre Mí
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Cuenta tu historia y experiencia profesional
          </p>
        </div>
        <div className="text-2xl">👨‍💻</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Información Básica
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Sobre Mí"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={about.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Tu especialización"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={about.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen (URL)
                </label>
                <input
                  type="url"
                  value={about.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="https://ejemplo.com/tu-foto.jpg"
                />
              </div>
            </div>
          </div>

          {/* Logros Destacados */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Logros Destacados
              </h4>
              <button
                onClick={addHighlight}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir
              </button>
            </div>
            
            <div className="space-y-2">
              {about.highlights.map((highlight, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Logro destacado"
                  />
                  <button
                    onClick={() => removeHighlight(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Habilidades */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Habilidades Técnicas
              </h4>
              <button
                onClick={addSkill}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir
              </button>
            </div>
            
            <div className="space-y-3">
              {about.skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      placeholder="Nombre de la habilidad"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                      className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      placeholder="90"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experiencia */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Experiencia Profesional
              </h4>
              <button
                onClick={addExperience}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir
              </button>
            </div>
            
            <div className="space-y-4">
              {about.experience.map((exp, index) => (
                <div key={index} className="bg-white dark:bg-gray-600 p-4 rounded border border-gray-200 dark:border-gray-500">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Experiencia {index + 1}
                    </span>
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Empresa"
                    />
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Cargo"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => updateExperience(index, 'period', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-3"
                    placeholder="2020 - Presente"
                  />
                  
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Descripción del rol..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Vista Previa
          </h4>
          
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              {about.image && (
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-1">
                  <img 
                    src={about.image} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {about.title}
              </h2>
              <p className="text-cyan-600 dark:text-cyan-400 mb-4">
                {about.subtitle}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {about.description}
              </p>
            </div>

            {/* Highlights */}
            {about.highlights.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Logros Destacados
                </h5>
                <ul className="space-y-2">
                  {about.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-cyan-500 mr-2">✓</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {about.skills.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Habilidades
                </h5>
                <div className="space-y-3">
                  {about.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                        <span className="text-gray-500">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {about.experience.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Experiencia
                </h5>
                <div className="space-y-3">
                  {about.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-cyan-500 pl-4">
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {exp.role} - {exp.company}
                      </h6>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-1">
                        {exp.period}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}