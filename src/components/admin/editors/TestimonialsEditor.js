// src/components/admin/editors/TestimonialsEditor.js
'use client'
import { useState } from 'react'

export default function TestimonialsEditor({ data, onChange }) {
  const [testimonials, setTestimonials] = useState(data || [
    {
      id: 1,
      name: "María González",
      company: "TechStartup",
      role: "CEO",
      content: "Luis transformó completamente nuestro e-commerce. El resultado superó todas nuestras expectativas.",
      rating: 5,
      image: "",
      project: "E-commerce Platform",
      date: "2024-01-15"
    }
  ])

  const [editingTestimonial, setEditingTestimonial] = useState(null)

  const updateTestimonials = (newTestimonials) => {
    setTestimonials(newTestimonials)
    onChange(newTestimonials)
  }

  const addTestimonial = () => {
    const newTestimonial = {
      id: Date.now(),
      name: "",
      company: "",
      role: "",
      content: "",
      rating: 5,
      image: "",
      project: "",
      date: new Date().toISOString().split('T')[0]
    }
    updateTestimonials([...testimonials, newTestimonial])
    setEditingTestimonial(newTestimonial.id)
  }

  const updateTestimonial = (id, field, value) => {
    const updatedTestimonials = testimonials.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    )
    updateTestimonials(updatedTestimonials)
  }

  const removeTestimonial = (id) => {
    const updatedTestimonials = testimonials.filter(t => t.id !== id)
    updateTestimonials(updatedTestimonials)
    setEditingTestimonial(null)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Testimonios de Clientes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Muestra la satisfacción de tus clientes
          </p>
        </div>
        <button
          onClick={addTestimonial}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          + Añadir Testimonio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Testimonios */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Gestionar Testimonios ({testimonials.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  editingTestimonial === testimonial.id
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                onClick={() => setEditingTestimonial(testimonial.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      {testimonial.name || 'Nuevo Testimonio'}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} {testimonial.company && `- ${testimonial.company}`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTestimonial(testimonial.id)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex items-center mb-2">
                  {renderStars(testimonial.rating)}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {testimonial.content || 'Sin contenido'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor del Testimonio Seleccionado */}
        <div className="space-y-4">
          {editingTestimonial ? (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Editar Testimonio
              </h4>
              
              {(() => {
                const testimonial = testimonials.find(t => t.id === editingTestimonial)
                if (!testimonial) return null

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={testimonial.company}
                          onChange={(e) => updateTestimonial(testimonial.id, 'company', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Nombre de la empresa"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="CEO, CTO, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Proyecto
                        </label>
                        <input
                          type="text"
                          value={testimonial.project}
                          onChange={(e) => updateTestimonial(testimonial.id, 'project', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                          placeholder="Nombre del proyecto"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Testimonio *
                      </label>
                      <textarea
                        rows={4}
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="Escribe el testimonio del cliente..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valoración
                        </label>
                        <select
                          value={testimonial.rating}
                          onChange={(e) => updateTestimonial(testimonial.id, 'rating', parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 estrellas)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 estrellas)</option>
                          <option value={3}>⭐⭐⭐ (3 estrellas)</option>
                          <option value={2}>⭐⭐ (2 estrellas)</option>
                          <option value={1}>⭐ (1 estrella)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={testimonial.date}
                          onChange={(e) => updateTestimonial(testimonial.id, 'date', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Foto del Cliente (URL)
                      </label>
                      <input
                        type="url"
                        value={testimonial.image}
                        onChange={(e) => updateTestimonial(testimonial.id, 'image', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                        placeholder="https://ejemplo.com/foto-cliente.jpg"
                      />
					  </div>

                   {/* Vista Previa del Testimonio */}
                   <div className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-200 dark:border-gray-500">
                     <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                       Vista Previa
                     </h5>
                     
                     <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg">
                       <div className="flex items-start space-x-3">
                         {testimonial.image ? (
                           <img 
                             src={testimonial.image} 
                             alt={testimonial.name}
                             className="w-12 h-12 rounded-full object-cover"
                             onError={(e) => {
                               e.target.style.display = 'none'
                             }}
                           />
                         ) : (
                           <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                             {testimonial.name.charAt(0) || '?'}
                           </div>
                         )}
                         
                         <div className="flex-1">
                           <div className="flex items-center mb-2">
                             {renderStars(testimonial.rating)}
                           </div>
                           
                           <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-3">
                             "{testimonial.content}"
                           </p>
                           
                           <div className="text-sm">
                             <p className="font-semibold text-gray-900 dark:text-gray-100">
                               {testimonial.name}
                             </p>
                             <p className="text-gray-600 dark:text-gray-400">
                               {testimonial.role} {testimonial.company && `- ${testimonial.company}`}
                             </p>
                             {testimonial.project && (
                               <p className="text-cyan-600 dark:text-cyan-400 text-xs">
                                 Proyecto: {testimonial.project}
                               </p>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               )
             })()}
           </div>
         ) : (
           <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
             <div className="text-4xl mb-4">💬</div>
             <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
               Selecciona un testimonio
             </h4>
             <p className="text-gray-600 dark:text-gray-400 text-sm">
               Haz clic en un testimonio de la lista para editarlo
             </p>
           </div>
         )}
       </div>
     </div>

     {/* Vista Previa General */}
     <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
       <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
         Vista Previa de la Sección
       </h4>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {testimonials.slice(0, 6).map((testimonial) => (
           <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
             <div className="flex items-center mb-3">
               {renderStars(testimonial.rating)}
             </div>
             
             <p className="text-gray-700 dark:text-gray-300 text-sm italic mb-4">
               "{testimonial.content.substring(0, 100)}{testimonial.content.length > 100 ? '...' : ''}"
             </p>
             
             <div className="flex items-center space-x-3">
               {testimonial.image ? (
                 <img 
                   src={testimonial.image} 
                   alt={testimonial.name}
                   className="w-10 h-10 rounded-full object-cover"
                   onError={(e) => {
                     e.target.style.display = 'none'
                   }}
                 />
               ) : (
                 <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                   {testimonial.name.charAt(0) || '?'}
                 </div>
               )}
               
               <div>
                 <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                   {testimonial.name}
                 </p>
                 <p className="text-gray-600 dark:text-gray-400 text-xs">
                   {testimonial.role} {testimonial.company && `- ${testimonial.company}`}
                 </p>
               </div>
             </div>
           </div>
         ))}
       </div>
       
       {testimonials.length === 0 && (
         <div className="text-center py-8">
           <div className="text-4xl mb-4">💬</div>
           <p className="text-gray-600 dark:text-gray-400">
             No hay testimonios configurados
           </p>
         </div>
       )}
     </div>
   </div>
 )
}