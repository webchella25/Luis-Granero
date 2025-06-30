// src/components/admin/forms/BlogPostForm.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogPostForm({ post = null, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || '',
    tags: post?.tags?.join(', ') || '',
    featuredImage: post?.featuredImage || '',
    difficulty: post?.difficulty || 'Intermedio',
    isFeatured: post?.isFeatured || false,
    isPinned: post?.isPinned || false,
    status: post?.status || 'draft',
    seo: {
      metaTitle: post?.seo?.metaTitle || '',
      metaDescription: post?.seo?.metaDescription || '',
      keywords: post?.seo?.keywords?.join(', ') || ''
    }
  });

  // Auto-generar slug cuando cambia el título
  useEffect(() => {
    if (formData.title && !isEdit) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.slug.trim()) newErrors.slug = 'El slug es requerido';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'El excerpt es requerido';
    if (!formData.content.trim()) newErrors.content = 'El contenido es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';
    
    if (formData.excerpt.length > 300) {
      newErrors.excerpt = 'El excerpt debe tener máximo 300 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.split(',').map(kw => kw.trim()).filter(kw => kw)
        }
      };
      
      const url = isEdit ? `/api/blog/${post.slug}` : '/api/blog';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar el post');
      }
      
      const result = await response.json();
      
      // Redirect to blog admin or post view
      router.push('/admin/blog');
      
    } catch (error) {
      console.error('Error saving post:', error);
      setErrors({ submit: 'Error al guardar el post' });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'React', 'Next.js', 'JavaScript', 'TypeScript', 'Node.js', 
    'CSS', 'HTML', 'Performance', 'SEO', 'DevOps', 'Tutorial', 'Opinión'
  ];

  const difficulties = ['Principiante', 'Intermedio', 'Avanzado'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {isEdit ? 'Editar Post' : 'Nuevo Post'}
          </h1>
          <p className="text-gray-400">
            {isEdit ? 'Modifica el contenido de tu post' : 'Crea un nuevo artículo para tu blog'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Título y Slug */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Título del post..."
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="url-del-post"
              />
              {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt (Resumen) *
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Breve descripción del post..."
              maxLength={300}
            />
            <div className="flex justify-between mt-1">
              {errors.excerpt && <p className="text-red-400 text-sm">{errors.excerpt}</p>}
              <span className="text-gray-400 text-sm">{formData.excerpt.length}/300</span>
            </div>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contenido *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={15}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              placeholder="Escribe tu artículo en Markdown..."
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
          </div>

          {/* Categoría y Dificultad */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dificultad
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags e Imagen */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (separados por comas)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="react, javascript, tutorial"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagen destacada (URL)
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">SEO</h3>
			<div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Título
            </label>
            <input
              type="text"
              name="seo.metaTitle"
              value={formData.seo.metaTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Título para SEO (máx. 60 caracteres)"
              maxLength={60}
            />
            <span className="text-gray-400 text-sm">{formData.seo.metaTitle.length}/60</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta Descripción
            </label>
            <textarea
              name="seo.metaDescription"
              value={formData.seo.metaDescription}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Descripción para SEO (máx. 160 caracteres)"
              maxLength={160}
            />
            <span className="text-gray-400 text-sm">{formData.seo.metaDescription.length}/160</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Keywords (separadas por comas)
            </label>
            <input
              type="text"
              name="seo.keywords"
              value={formData.seo.keywords}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="react, desarrollo web, tutorial"
            />
          </div>
        </div>
      </div>

      {/* Opciones */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Opciones</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <label className="text-gray-300">Post destacado</label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleInputChange}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <label className="text-gray-300">Fijar en la parte superior</label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Errores generales */}
      {errors.submit && (
        <div className="bg-red-500/10 border border-red-500 rounded-md p-4">
          <p className="text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Guardar borrador
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center space-x-2"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Publicar')}</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</div>