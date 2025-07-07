// src/app/admin/content/addons/page.js
'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AddonsAdmin() {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const categories = [
    { value: 'seo', name: 'SEO & Marketing', color: 'bg-green-500' },
    { value: 'features', name: 'Funcionalidades', color: 'bg-blue-500' },
    { value: 'admin', name: 'Administración', color: 'bg-purple-500' },
    { value: 'integrations', name: 'Integraciones', color: 'bg-orange-500' },
    { value: 'mobile', name: 'Mobile & PWA', color: 'bg-pink-500' },
    { value: 'ecommerce', name: 'E-commerce', color: 'bg-yellow-500' },
    { value: 'support', name: 'Soporte', color: 'bg-gray-500' }
  ];

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      const response = await fetch('/api/admin/addons');
      if (response.ok) {
        const data = await response.json();
        setAddons(data.addons || []);
      }
    } catch (error) {
      console.error('Error loading addons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAddons = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addons })
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        console.log('Add-ons guardados correctamente');
      }
    } catch (error) {
      console.error('Error saving addons:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddon = () => {
    setEditingAddon({
      name: "",
      price: "",
      description: "",
      category: "features",
      orderIndex: addons.length,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditAddon = (addon) => {
    setEditingAddon({ ...addon });
    setShowModal(true);
  };

  const handleSaveAddon = () => {
    if (editingAddon._id) {
      // Edit existing
      setAddons(addons.map(a => a._id === editingAddon._id ? editingAddon : a));
    } else {
      // Add new
      setAddons([...addons, { ...editingAddon, _id: Date.now().toString() }]);
    }
    setShowModal(false);
    setEditingAddon(null);
  };

  const handleDeleteAddon = (id) => {
    if (confirm('¿Estás seguro de eliminar este add-on?')) {
      setAddons(addons.filter(a => a._id !== id));
    }
  };

  const updateAddonField = (field, value) => {
    setEditingAddon(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  const groupedAddons = categories.map(category => ({
    ...category,
    items: addons.filter(addon => addon.category === category.value)
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando add-ons...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Add-ons</h1>
          <p className="text-gray-400">Administra los servicios adicionales que ofreces</p>
          {lastSaved && (
            <p className="text-sm text-green-400 mt-2">
              Guardado: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddAddon}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Add-on</span>
          </button>
          <button
            onClick={saveAddons}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Addons by Category */}
      <div className="space-y-8">
        {groupedAddons.map((category) => (
          <div key={category.value} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-4 h-4 rounded ${category.color}`}></div>
              <h2 className="text-lg font-bold text-white">{category.name}</h2>
              <span className="text-gray-400 text-sm">({category.items.length})</span>
            </div>

            {category.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay add-ons en esta categoría
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((addon) => (
                  <div
                    key={addon._id}
                    className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white">{addon.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditAddon(addon)}
                          className="text-cyan-400 hover:text-cyan-300 p-1"
                          title="Editar add-on"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddon(addon._id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Eliminar add-on"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{addon.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">{addon.price}</span>
                      <span className={`px-2 py-1 text-xs rounded ${category.color} text-white`}>
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && editingAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingAddon._id ? 'Editar Add-on' : 'Nuevo Add-on'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Nombre del Add-on</label>
                <input
                  type="text"
                  value={editingAddon.name}
                  onChange={(e) => updateAddonField('name', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  placeholder="ej: SEO Avanzado"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Precio</label>
                <input
                  type="text"
                  value={editingAddon.price}
                  onChange={(e) => updateAddonField('price', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  placeholder="ej: +800€, +200€/mes"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Descripción</label>
                <textarea
                  value={editingAddon.description}
                  onChange={(e) => updateAddonField('description', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                  rows="3"
                  placeholder="Descripción del add-on..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Categoría</label>
                <select
                  value={editingAddon.category}
                  onChange={(e) => updateAddonField('category', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingAddon.isActive}
                  onChange={(e) => updateAddonField('isActive', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-white">Activo</label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAddon}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
              >
                Guardar Add-on
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}