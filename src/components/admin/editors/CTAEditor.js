// src/components/admin/editors/CTAEditor.js
'use client'
import { useState } from 'react'

export default function CTAEditor({ data, onChange }) {
  const [cta, setCta] = useState(data || {
    title: "¿Listo para llevar tu proyecto al siguiente nivel?",
    subtitle: "Trabajemos juntos para crear algo increíble",
    description: "Con más de 10 años de experiencia, puedo ayudarte a transformar tu idea en una aplicación web exitosa.",
    primaryButton: {
      text: "Iniciar Proyecto",
      link: "/contacto",
      style: "primary"
    },
    secondaryButton: {
      text: "Ver Portfolio",
      link: "/portfolio",
      style: "secondary"
    },
    backgroundStyle: "gradient", // gradient, image, solid
    backgroundImage: "",
    backgroundColor: "#1F2937",
    showContactInfo: true,
    contactInfo: {
      email: "luis@luisgranero.com",
      phone: "+34 123 456 789",
      calendly: "https://calendly.com/luisgranero"
    },
    features: [
      "Consulta inicial gratuita",
      "Desarrollo personalizado",
      "Soporte post-lanzamiento",
      "Garantía de satisfacción"
    ],
    urgency: {
      enabled: false,
      text: "¡Solo quedan 3 slots para este mes!",
      countdown: false,
      date: ""
    }
  })

  const handleChange = (field, value) => {
    const updatedCta = { ...cta, [field]: value }
    setCta(updatedCta)
    onChange(updatedCta)
  }

  const handleNestedChange = (parent, field, value) => {
    const updatedCta = {
      ...cta,
      [parent]: {
        ...cta[parent],
        [field]: value
      }
    }
    setCta(updatedCta)
    onChange(updatedCta)
  }

  const updateFeature = (index, value) => {
    const updatedFeatures = cta.features.map((feature, i) => 
      i === index ? value : feature
    )
    handleChange('features', updatedFeatures)
  }

  const addFeature = () => {
    const updatedFeatures = [...cta.features, "Nueva característica"]
    handleChange('features', updatedFeatures)
  }

  const removeFeature = (index) => {
    const updatedFeatures = cta.features.filter((_, i) => i !== index)
    handleChange('features', updatedFeatures)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Call to Action
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Invita a los visitantes a contactarte
          </p>
        </div>
        <div className="text-2xl">🚀</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Contenido Principal */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contenido Principal
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título Principal *
                </label>
                <input
                  type="text"
                  value={cta.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="¿Listo para empezar?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={cta.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Trabajemos juntos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={cta.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Describe por qué deberían contactarte..."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Botones de Acción
            </h4>
            
            <div className="space-y-6">
              {/* Botón Principal */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Botón Principal
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cta.primaryButton.text}
                    onChange={(e) => handleNestedChange('primaryButton', 'text', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Texto del botón"
                  />
                  <input
                    type="text"
                    value={cta.primaryButton.link}
                    onChange={(e) => handleNestedChange('primaryButton', 'link', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="/contacto"
                  />
                </div>
              </div>

              {/* Botón Secundario */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Botón Secundario
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cta.secondaryButton.text}
                    onChange={(e) => handleNestedChange('secondaryButton', 'text', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Texto del botón"
                  />
                  <input
                    type="text"
                    value={cta.secondaryButton.link}
                    onChange={(e) => handleNestedChange('secondaryButton', 'link', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="/portfolio"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Características/Beneficios */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Características/Beneficios
              </h4>
              <button
                onClick={addFeature}
                className="text-cyan-600 hover:text-cyan-700 text-sm"
              >
                + Añadir
              </button>
            </div>
            
            <div className="space-y-2">
              {cta.features.map((feature, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                    placeholder="Beneficio o característica"
                  />
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="showContactInfo"
                checked={cta.showContactInfo}
                onChange={(e) => handleChange('showContactInfo', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showContactInfo" className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Mostrar Información de Contacto
              </label>
            </div>
            
            {cta.showContactInfo && (
              <div className="space-y-3">
                <input
                  type="email"
                  value={cta.contactInfo.email}
                  onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="tu@email.com"
                />
                <input
                  type="tel"
                  value={cta.contactInfo.phone}
                  onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="+34 123 456 789"
                />
                <input
                  type="url"
                  value={cta.contactInfo.calendly}
                  onChange={(e) => handleNestedChange('contactInfo', 'calendly', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="https://calendly.com/tu-usuario"
                />
              </div>
            )}
          </div>

          {/* Estilo de Fondo */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Estilo de Fondo
            </h4>
            
            <div className="space-y-3">
              <select
                value={cta.backgroundStyle}
                onChange={(e) => handleChange('backgroundStyle', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
              >
                <option value="gradient">Gradiente</option>
                <option value="solid">Color sólido</option>
                <option value="image">Imagen de fondo</option>
              </select>

              {cta.backgroundStyle === 'solid' && (
                <input
                  type="color"
                  value={cta.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded"
                />
              )}

              {cta.backgroundStyle === 'image' && (
                <input
                  type="url"
                  value={cta.backgroundImage}
                  onChange={(e) => handleChange('backgroundImage', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="https://ejemplo.com/imagen-fondo.jpg"
                />
              )}
            </div>
          </div>

          {/* Sentido de Urgencia */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableUrgency"
                checked={cta.urgency.enabled}
                onChange={(e) => handleNestedChange('urgency', 'enabled', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="enableUrgency" className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Añadir Sentido de Urgencia
              </label>
            </div>
            
            {cta.urgency.enabled && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={cta.urgency.text}
                  onChange={(e) => handleNestedChange('urgency', 'text', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="¡Solo quedan 3 slots para este mes!"
                />
              </div>
            )}
          </div>
        </div>

        {/* Vista Previa */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vista Previa
          </h4>
          
          <div 
            className={`rounded-lg p-8 text-white relative overflow-hidden ${
              cta.backgroundStyle === 'gradient' 
                ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900'
                : cta.backgroundStyle === 'solid'
                ? ''
                : 'bg-gray-900'
            }`}
            style={{
              backgroundColor: cta.backgroundStyle === 'solid' ? cta.backgroundColor : undefined,
              backgroundImage: cta.backgroundStyle === 'image' && cta.backgroundImage 
                ? `url(${cta.backgroundImage})` 
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay para legibilidad */}
            {cta.backgroundStyle === 'image' && (
              <div className="absolute inset-0 bg-black/60"></div>
            )}
            
            <div className="relative z-10 text-center">
              {/* Urgency Banner */}
              {cta.urgency.enabled && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 inline-block">
                  {cta.urgency.text}
                </div>
              )}
              
              {/* Main Content */}
              <h2 className="text-3xl font-bold mb-4">
                {cta.title}
              </h2>
              
              {cta.subtitle && (
                <p className="text-xl text-gray-200 mb-4">
                  {cta.subtitle}
                </p>
              )}
              
              {cta.description && (
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  {cta.description}
                </p>
              )}

              {/* Features */}
              {cta.features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-w-lg mx-auto">
                  {cta.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-200">
                      <span className="text-green-400 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                
                  href={cta.primaryButton.link}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  {cta.primaryButton.text}
                </a>
                
                
                  href={cta.secondaryButton.link}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
                >
                  {cta.secondaryButton.text}
                </a>
              </div>

              {/* Contact Info */}
              {cta.showContactInfo && (
                <div className="border-t border-gray-600 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-300">
                    {cta.contactInfo.email && (
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📧</span>
                        {cta.contactInfo.email}
                      </div>
                    )}
                    {cta.contactInfo.phone && (
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📞</span>
                        {cta.contactInfo.phone}
                      </div>
                    )}
                    {cta.contactInfo.calendly && (
                      <div className="flex items-center justify-center">
                        <span className="mr-2">📅</span>
                        Agenda una llamada
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}