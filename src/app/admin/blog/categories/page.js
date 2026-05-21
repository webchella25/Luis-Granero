// src/app/admin/blog/categories/page.js
'use client';

import { useState, useEffect } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Middleware handles auth, just load categories
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog/categories');
      if (!res.ok) throw new Error('Error fetching categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-8">
            Gestión de Categorías
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-gray-700 p-6 rounded-lg border border-gray-600 hover:border-cyan-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                      <p className="text-xs text-gray-400">{category.slug}</p>
                    </div>
                  </div>
                </div>
                {category.description && (
                  <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs text-gray-500">Color de categoría</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}