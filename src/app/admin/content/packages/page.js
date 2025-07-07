// src/app/admin/content/packages/page.js
'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

export default function PackagesAdmin() {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const colorOptions = [
    { value: 'from-cyan-400 to-blue-500', name: 'Cyan a Azul', preview: 'bg-gradient-to-r from-cyan-400 to-blue-500' },
    { value: 'from-green-400 to-emerald-500', name: 'Verde a Esmeralda', preview: 'bg-gradient-to-r from-green-400 to-emerald-500' },
    { value: 'from-purple-400 to-pink-500', name: 'Morado a Rosa', preview: 'bg-gradient-to-r from-purple-400 to-pink-500' },
    { value: 'from-orange-400 to-red-500', name: 'Naranja a Rojo', preview: 'bg-gradient-to-r from-orange-400 to-red-500' },
    { value: 'from-yellow-400 to-orange-500', name: 'Amarillo a Naranja', preview: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    { value: 'from-indigo-400 to-purple-500', name: 'Índigo a Morado', preview: 'bg-gradient-to-r from-indigo-400 to-purple-500' }
  ];

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/admin/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePackages = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        console.log('Paquetes guardados correctamente');
      }
    } catch (error) {
      console.error('Error saving packages:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPackage = () => {
    setEditingPackage({
      name: "",
      description: "",
      price: "",
      duration: "",
      color: "from-cyan-400 to-blue-500",
      popular: false,
      features: [""],
      technologies: [""],
      ideal: "",
      orderIndex: packages.length,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage({ ...pkg });
    setShowModal(true);
  };

  const handleSavePackage = () => {
    if (editingPackage._id) {
      // Edit existing
      setPackages(packages.map(p => p._id === editingPackage._id ? editingPackage : p));
    } else {
      // Add new
      setPackages([...packages, { ...editingPackage, _id: Date.now().toString() }]);
    }
    setShowModal(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = (id) => {
    if (confirm('¿Estás seguro de eliminar este paquete?')) {
      setPackages(packages.filter(p => p._id !== id));
    }
  };

  const togglePopular = (id) => {
    setPackages(packages.map(p => ({
      ...p,
      popular: p._id === id ? !p.popular : false
    })));
  };

  const updatePackageField = (field, value) => {
    setEditingPackage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    setEditingPackage(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const updateFeature = (index, value) => {
    setEditingPackage(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index) => {
    setEditingPackage(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTechnology = () => {
    setEditingPackage(prev => ({
      ...prev,
      technologies: [...prev.technologies, ""]
    }));
  };

  const updateTechnology = (index, value) => {
    setEditingPackage(prev => ({
      ...prev,
      technologies: prev.technologies.map((t, i) => i === index ? value : t)
    }));
  };

  const removeTechnology = (index) => {
    setEditingPackage(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando paquetes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Paquetes</h1>
          <p className="text-gray-400">Administra los paquetes de desarrollo que ofreces</p>
          {lastSaved && (
            <p className="text-sm text-green-400 mt-2">
              Guardado: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddPackage}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuevo Paquete</span>
          </button>
          <button
            onClick={savePackages}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className={`bg-gray-800 border rounded-lg p-6 hover:border-gray-600 transition-colors relative ${
              pkg.popular ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-700'
            }`}
          >
            {/* Popular Badge */}
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                  Más Popular
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${pkg.color}`}></div>
              <div className="flex space-x-2">
                <button
                  onClick={() => togglePopular(pkg._id)}
                  className={`p-1 ${pkg.popular ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                  title="Marcar como popular"
                >
                  <StarIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                  title="Editar paquete"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePackage(pkg._id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Eliminar paquete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

            <div className="mb-4">
              <div className="text-2xl font-bold text-white">{pkg.price}</div>
              <div className="text-gray-500 text-sm">{pkg.duration}</div>
            </div>

            {/* Features preview */}
            {pkg.features && pkg.features.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Características:</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-400 mr-1">✓</span>
                      {feature}
                    </li>
                  ))}
                  {pkg.features.length > 3 && (
                    <li className="text-gray-500">+{pkg.features.length - 3} más...</li>
                  )}
                </ul>
              </div>
            )}

            {/* Technologies preview */}
            <div className="flex flex-wrap gap-1">
              {pkg.technologies?.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-700 text-cyan-400 rounded"
                >
                  {tech}
                </span>
              ))}
              {pkg.technologies?.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-600 text-gray-400 rounded">
                  +{pkg.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingPackage._id ? 'Editar Paquete' : 'Nuevo Paquete'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nombre del Paquete</label>
                  <input
                    type="text"
                    value={editingPackage.name}
                    onChange={(e) => updatePackageField('name', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                    placeholder="ej: Starter, Business, Enterprise"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Descripción</label>
                  <textarea
                    value={editingPackage.description}
                    onChange={(e) => updatePackageField('description', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                    rows="3"
                    placeholder="Descripción del paquete..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Precio</label>
                    <input
                      type="text"
                      value={editingPackage.price}
                      onChange={(e) => updatePackageField('price', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                      placeholder="ej: 1,500€"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Duración</label>
                    <input
                      type="text"
                      value={editingPackage.duration}
                      onChange={(e) => updatePackageField('duration', e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                      placeholder="ej: 2-3 semanas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Color del Gradiente</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((color) => (
                      <label key={color.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="color"
                          value={color.value}
                          checked={editingPackage.color === color.value}
                          onChange={(e) => updatePackageField('color', e.target.value)}
                          className="hidden"
                        />
                        <div className={`w-6 h-6 rounded ${color.preview} ${
                          editingPackage.color === color.value ? 'ring-2 ring-white' : ''
                        }`}></div>
                        <span className="text-gray-300 text-sm">{color.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Ideal para</label>
                  <textarea
                    value={editingPackage.ideal}
                    onChange={(e) => updatePackageField('ideal', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"
                    rows="2"
                    placeholder="ej: Freelancers, consultores, pequeños servicios"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingPackage.popular}
                    onChange={(e) => updatePackageField('popular', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-white">Marcar como popular</label>
                </div>
              </div>

              {/* Features y Technologies */}
              <div className="space-y-4">
                {/* Features */}
                <div>
                  <label className="block text-white font-medium mb-2">Características</label>
                  <div className="space-y-2">
                    {editingPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md"
                          placeholder="Característica..."
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      + Agregar característica
                    </button>
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <label className="block text-white font-medium mb-2">Tecnologías</label>
                  <div className="space-y-2">
                    {editingPackage.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => updateTechnology(index, e.target.value)}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md"
                          placeholder="Tecnología..."
                        />
                        <button
                          onClick={() => removeTechnology(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addTechnology}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      + Agregar tecnología
                    </button>
                  </div>
                </div>
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
                onClick={handleSavePackage}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md"
              >
                Guardar Paquete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}