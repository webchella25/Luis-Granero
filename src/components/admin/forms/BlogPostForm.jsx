// src/components/admin/forms/BlogPostForm.jsx
'use client';

import { useState, useEffect } from 'react';

export default function BlogPostForm({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  categories = [],
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
    isFeatured: false,
    difficulty: 'beginner',
    readingTime: 5,
    codeExamples: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        featuredImage: initialData.featuredImage || '',
        metaTitle: initialData.seo?.metaTitle || '',
        metaDescription: initialData.seo?.metaDescription || '',
        isPublished: initialData.isPublished || false,
        isFeatured: initialData.isFeatured || false,
        difficulty: initialData.difficulty || 'beginner',
        readingTime: initialData.readingTime || 5,
        codeExamples: initialData.codeExamples || []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es requerido';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'El excerpt es requerido';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription
        }
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error al guardar el post. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const addCodeExample = () => {
    setFormData(prev => ({
      ...prev,
      codeExamples: [...prev.codeExamples, { language: 'javascript', code: '', description: '' }]
    }));
  };

  const removeCodeExample = (index) => {
    setFormData(prev => ({
      ...prev,
      codeExamples: prev.codeExamples.filter((_, i) => i !== index)
    }));
  };

  const updateCodeExample = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      codeExamples: prev.codeExamples.map((example, i) => 
        i === index ? { ...example, [field]: value } : example
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isEditing ? 'Editar Post' : 'Nuevo Post'}
        </h2>
        <p className="text-gray-400">
          {isEditing ? 'Modifica los datos del post' : 'Crea un nuevo post para el blog'}
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Título del post"
          />
          {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.slug ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="slug-del-post"
          />
          {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Excerpt *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.excerpt ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Breve descripción del post"
          />
          {errors.excerpt && <p className="mt-1 text-sm text-red-400">{errors.excerpt}</p>}
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
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              errors.content ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Contenido del post en Markdown"
          />
          {errors.content && <p className="mt-1 text-sm text-red-400">{errors.content}</p>}
        </div>

        {/* Categoría y Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                errors.category ? 'border-red-500' : 'border-gray-600'
              }`}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="react, javascript, tutorial (separados por comas)"
            />
          </div>
        </div>

        {/* Imagen destacada */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagen destacada (URL)
          </label>
          <input
            type="url"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Configuraciones adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Dificultad
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiempo de lectura (min)
            </label>
            <input
              type="number"
              name="readingTime"
              value={formData.readingTime}
              onChange={handleInputChange}
              min="1"
              max="60"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="mr-2 text-cyan-500"
              />
              <label className="text-sm text-gray-300">Publicado</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="mr-2 text-cyan-500"
              />
              <label className="text-sm text-gray-300">Destacado</label>
            </div>
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
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Título para SEO (máx. 60 caracteres)"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaTitle.length}/60 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Descripción
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Descripción para SEO (máx. 160 caracteres)"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Post' : 'Crear Post')}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}