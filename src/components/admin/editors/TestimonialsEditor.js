// src/components/admin/editors/TestimonialsEditor.js
'use client'
import { useState } from 'react'
import { PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function TestimonialsEditor({ data, onUpdate }) {
  const [testimonials, setTestimonials] = useState(data.testimonials || [])

  const handleTestimonialChange = (index, field, value) => {
    const updatedTestimonials = [...testimonials]
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value }
    setTestimonials(updatedTestimonials)
    onUpdate('testimonials', updatedTestimonials)
  }

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now(),
      name: 'Nombre del Cliente',
      company: 'Empresa',
      role: 'Cargo',
      content: 'Contenido del testimonio...',
      rating: 5,
      avatar: '/images/testimonials/default.jpg'
    }
    const updatedTestimonials = [...testimonials, newTestimonial]
    setTestimonials(updatedTestimonials)
    onUpdate('testimonials', updatedTestimonials)
  }

  const removeTestimonial = (index) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index)
    setTestimonials(updatedTestimonials)
    onUpdate('testimonials', updatedTestimonials)
  }

  const setRating = (testimonialIndex, rating) => {
    handleTestimonialChange(testimonialIndex, 'rating', rating)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Testimonios</h3>
          <p className="text-gray-400">Gestiona los testimonios de tus clientes</p>
        </div>
        <button
          onClick={addTestimonial}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Agregar Testimonio</span>
        </button>
      </div>

      <div className="space-y-6">
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-white font-medium">Testimonio {index + 1}</h4>
              <button
                onClick={() => removeTestimonial(index)}
                className="text-red-400 hover:text-red-300"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={testimonial.company}
                      onChange={(e) => handleTestimonialChange(index, 'company', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={testimonial.role}
                      onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar (URL)
                  </label>
                  <input
                    type="text"
                    value={testimonial.avatar}
                    onChange={(e) => handleTestimonialChange(index, 'avatar', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="/images/testimonials/cliente.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Calificación
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(index, star)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        {star <= testimonial.rating ? (
                          <StarIconSolid className="w-6 h-6" />
                        ) : (
                          <StarIcon className="w-6 h-6" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Testimonio
                  </label>
                  <textarea
                    rows={4}
                    value={testimonial.content}
                    onChange={(e) => handleTestimonialChange(index, 'content', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="Escribe el testimonio del cliente..."
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-300 mb-4">Vista Previa</h5>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role} en {testimonial.company}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className={`w-4 h-4 ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-300 text-sm italic">"{testimonial.content}"</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}