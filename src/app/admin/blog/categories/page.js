// src/app/admin/blog/categories/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    // Usuario autenticado, cargar categorías
    fetchCategories();
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Por ahora, categorías estáticas hasta que la API esté lista
      const defaultCategories = [
        { _id: '1', name: 'React', slug: 'react', postCount: 5 },
        { _id: '2', name: 'Next.js', slug: 'nextjs', postCount: 3 },
        { _id: '3', name: 'JavaScript', slug: 'javascript', postCount: 8 },
      ];
      setCategories(defaultCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Será redirigido
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white mb-8">
            Gestión de Categorías
          </h1>
          
          <div className="grid gap-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-semibold">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.postCount} posts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}