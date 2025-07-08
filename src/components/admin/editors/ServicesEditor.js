// src/components/admin/editors/ServicesEditor.js (VERSIÓN FINAL - FUNCIONAL)
'use client';

import { useState, useEffect } from 'react';

export default function ServicesEditor({ data = {}, onUpdate = () => {} }) {
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(data.selectedServices || []);
  const [sectionConfig, setSectionConfig] = useState({
    title: data.servicesTitle || 'Servicios Especializados',
    subtitle: data.servicesSubtitle || 'Desarrollo web moderno enfocado en resultados.',
    showViewAllButton: data.showViewAllButton !== false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAvailableServices();
  }, []);

  const loadAvailableServices = async () => {
    try {
      console.log('🔍 Cargando servicios desde admin...');
      
      const response = await fetch('/api/admin/services');
      console.log(`📊 Response status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`📦 Data received:`, result);
        
        let services = [];
        
        // ✅ CORRECCIÓN: Manejar diferentes estructuras
        if (Array.isArray(result)) {
          services = result;
          console.log('✅ Direct array detected:', services.length);
        } else if (result.services && Array.isArray(result.services)) {
          services = result.services;
          console.log('✅ Services property detected:', services.length);
        }
        
        if (services.length > 0) {
          console.log(`✅ Found ${services.length} services:`, services.map(s => s.title));
          setAvailableServices(services);
        } else {
          console.log('⚠️ Using fallback services');
          setAvailableServices(getFallbackServices());
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Error loading services:', error);
      setError(error.message);
      setAvailableServices(getFallbackServices());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackServices = () => [
    {
      _id: 'fallback-1',
      title: 'Desarrollo Web Moderno',
      subtitle: 'React, Next.js, TypeScript',
      description: 'Aplicaciones web de última generación con tecnologías modernas.',
      icon: '💻',
      color: 'from-cyan-400 to-blue-500',
      pricing: { startingPrice: '1,500€' },
      deliveryTime: '2-4 semanas'
    },
    {
      _id: 'fallback-2',
      title: 'E-commerce Personalizado',
      subtitle: 'Sin plantillas genéricas',
      description: 'Tiendas online a medida con gestión avanzada.',
      icon: '🛒',
      color: 'from-green-400 to-emerald-500',
      pricing: { startingPrice: '3,500€' },
      deliveryTime: '4-8 semanas'
    },
    {
      _id: 'fallback-3',
      title: 'SEO & Optimización',
      subtitle: 'Performance & Rankings',
      description: 'Optimización técnica completa para mejorar rankings.',
      icon: '🚀',
      color: 'from-purple-400 to-pink-500',
      pricing: { startingPrice: '800€' },
      deliveryTime: '1-2 semanas'
    },
    {
      _id: 'fallback-4',
      title: 'APIs y Backend',
      subtitle: 'Node.js, Integración',
      description: 'Desarrollo de APIs robustas y backends escalables.',
      icon: '🔧',
      color: 'from-orange-400 to-red-500',
      pricing: { startingPrice: '1,800€' },
      deliveryTime: '2-5 semanas'
    },
    {
      _id: 'fallback-5',
      title: 'Aplicaciones Web Complejas',
      subtitle: 'SPA, PWA, Dashboards',
      description: 'Herramientas web específicas para tu negocio.',
      icon: '⚡',
      color: 'from-purple-400 to-pink-500',
      pricing: { startingPrice: '2,500€' },
      deliveryTime: '3-6 semanas'
    }
  ];

  const toggleServiceSelection = (service) => {
    const serviceId = service._id || service.id;
    const isSelected = selectedServices.some(s => (s._id || s.id) === serviceId);
    
    let updated;
    if (isSelected) {
      updated = selectedServices.filter(s => (s._id || s.id) !== serviceId);
    } else if (selectedServices.length < 6) {
      updated = [...selectedServices, service];
    } else {
      return; // Max 6 servicios
    }
    
    setSelectedServices(updated);
    onUpdate('selectedServices', updated);
  };

  const updateSectionConfig = (field, value) => {
    const updated = { ...sectionConfig, [field]: value };
    setSectionConfig(updated);
    onUpdate('servicesConfig', updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Debug info */}
      <div className="bg-gray-800 border border-gray-600 rounded p-3 text-xs">
        <div className="text-green-400">
          ✅ {availableServices.length} servicios disponibles | {selectedServices.length} seleccionados
        </div>
        <div className="text-gray-500 mt-1">
          Disponibles: {availableServices.map(s => s.title).join(', ')}
        </div>
      </div>

      {/* Servicios Disponibles */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-lg font-medium text-white">Servicios en Homepage</h3>
            <p className="text-gray-400 text-sm">Selecciona qué servicios mostrar en la página principal (máximo 6)</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4">
            Servicios Disponibles ({availableServices.length})
          </h4>
          
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {availableServices.map((service, index) => {
              const serviceId = service._id || service.id || `service-${index}`;
              const isSelected = selectedServices.some(s => (s._id || s.id) === serviceId);
              
              return (
                <div
                  key={serviceId}
                  onClick={() => toggleServiceSelection(service)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{service.icon || '🔧'}</div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{service.title}</h5>
                      {service.subtitle && (
                        <p className="text-cyan-400 text-sm mb-2">{service.subtitle}</p>
                      )}
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      
                      {(service.pricing?.startingPrice || service.startingPrice) && (
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-400 font-medium">
                            {service.pricing?.startingPrice || service.startingPrice}
                          </span>
                          {service.deliveryTime && (
                            <span className="text-gray-500">{service.deliveryTime}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-500' 
                        : 'border-gray-500'
                    }`}>
                      {isSelected && <span className="text-black text-sm">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vista Previa */}
      {selectedServices.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-4">
            Vista Previa ({selectedServices.length} seleccionados)
          </h4>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedServices.slice(0, 3).map((service) => (
                <div key={service._id || service.id} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <h5 className="text-white font-medium mb-1">{service.title}</h5>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {service.description}
                  </p>
                  <div className="text-cyan-400 text-sm mt-2">
                    {service.pricing?.startingPrice || service.startingPrice || 'Consultar'}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedServices.length > 3 && (
              <p className="text-gray-400 text-sm mt-4 text-center">
                Los primeros 3 se mostrarán en la homepage
              </p>
            )}
          </div>
        </div>
      )}

      {/* Configuración de Sección */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h4 className="text-white font-medium mb-4">Configuración de Sección</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título de la sección
            </label>
            <input
              type="text"
              value={sectionConfig.title}
              onChange={(e) => updateSectionConfig('title', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={sectionConfig.subtitle}
              onChange={(e) => updateSectionConfig('subtitle', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sectionConfig.showViewAllButton}
            onChange={(e) => updateSectionConfig('showViewAllButton', e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-300">
            Mostrar botón "Ver todos los servicios"
          </label>
        </div>
      </div>

      {/* Servicios Seleccionados */}
      {selectedServices.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4">Servicios Seleccionados ({selectedServices.length})</h4>
          
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div
                key={service._id || service.id}
                className="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-600 rounded-lg"
              >
                <div className="text-xl">{service.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{service.title}</div>
                  <div className="text-gray-400 text-sm">{service.subtitle}</div>
                </div>
                <div className="text-gray-400 text-sm">#{index + 1}</div>
                <button
                  onClick={() => toggleServiceSelection(service)}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setSelectedServices([]);
                onUpdate('selectedServices', []);
              }}
              className="text-gray-400 hover:text-red-400 text-sm"
            >
              Limpiar selección
            </button>
          </div>
        </div>
      )}
    </div>
  );
}