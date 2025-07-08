// src/components/admin/editors/ServicesEditor.js (CON DEBUG)
'use client';

import { useState, useEffect } from 'react';

export default function ServicesEditor({ data, onUpdate }) {
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
      
      // Intentar desde múltiples fuentes
      const endpoints = [
        '/api/admin/services',
        '/api/homepage',
        '/api/public/services'
      ];

      let servicesLoaded = false;

      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Probando endpoint: ${endpoint}`);
          const response = await fetch(endpoint);
          console.log(`📊 Response status: ${response.status}`);
          
          if (response.ok) {
            const result = await response.json();
            console.log(`📦 Data received from ${endpoint}:`, result);
            
            // Intentar diferentes estructuras de respuesta
            let services = result.services || result.data?.services || [];
            
            if (services.length > 0) {
              console.log(`✅ Found ${services.length} services from ${endpoint}`);
              setAvailableServices(services);
              servicesLoaded = true;
              break;
            }
          }
        } catch (endpointError) {
          console.error(`❌ Error with ${endpoint}:`, endpointError);
        }
      }

      if (!servicesLoaded) {
        console.log('⚠️ No services found, using fallback');
        setAvailableServices(getFallbackServices());
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
      slug: 'desarrollo-web',
      title: 'Desarrollo Web Moderno',
      subtitle: 'React, Next.js, TypeScript',
      description: 'Aplicaciones web de última generación con tecnologías modernas.',
      icon: '💻',
      color: 'from-cyan-400 to-blue-500',
      features: ['React 18+', 'Next.js 14', 'TypeScript', 'Responsive'],
      technologies: ['React', 'Next.js', 'TypeScript'],
      pricing: { startingPrice: '1,500€' },
      deliveryTime: '2-4 semanas',
      isActive: true
    },
    {
      _id: 'fallback-2',
      slug: 'ecommerce',
      title: 'E-commerce Personalizado',
      subtitle: 'Sin plantillas genéricas',
      description: 'Tiendas online a medida con gestión avanzada.',
      icon: '🛒',
      color: 'from-green-400 to-emerald-500',
      features: ['Catálogo avanzado', 'Múltiples pagos', 'Panel admin'],
      technologies: ['E-commerce', 'Stripe', 'MongoDB'],
      pricing: { startingPrice: '3,500€' },
      deliveryTime: '4-8 semanas',
      isActive: true
    },
    {
      _id: 'fallback-3',
      slug: 'seo-optimizacion',
      title: 'SEO & Optimización',
      subtitle: 'Performance & Rankings',
      description: 'Optimización técnica completa para mejorar rankings.',
      icon: '🚀',
      color: 'from-purple-400 to-pink-500',
      features: ['Auditoría técnica', 'Core Web Vitals', 'Technical SEO'],
      technologies: ['SEO', 'Performance', 'Analytics'],
      pricing: { startingPrice: '800€' },
      deliveryTime: '1-2 semanas',
      isActive: true
    }
  ];

  const toggleServiceSelection = (service) => {
    const isSelected = selectedServices.some(s => s._id === service._id);
    
    if (isSelected) {
      const updated = selectedServices.filter(s => s._id !== service._id);
      setSelectedServices(updated);
      updateParent(updated);
    } else if (selectedServices.length < 6) {
      const updated = [...selectedServices, service];
      setSelectedServices(updated);
      updateParent(updated);
    }
  };

  const updateSectionConfig = (field, value) => {
    const updated = { ...sectionConfig, [field]: value };
    setSectionConfig(updated);
    onUpdate('servicesConfig', updated);
  };

  const updateParent = (services) => {
    onUpdate('selectedServices', services);
    onUpdate('servicesConfig', sectionConfig);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Cargando servicios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
        <div className="text-red-400 font-medium">Error cargando servicios:</div>
        <div className="text-red-300 text-sm">{error}</div>
        <button 
          onClick={loadAvailableServices}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Debug info */}
      <div className="bg-gray-800 border border-gray-600 rounded p-3 text-xs">
        <div className="text-gray-400">
          Debug: {availableServices.length} servicios cargados
        </div>
        {availableServices.length > 0 && (
          <div className="text-gray-500 mt-1">
            Servicios: {availableServices.map(s => s.title).join(', ')}
          </div>
        )}
      </div>

      {/* Servicios Disponibles */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-lg font-medium text-white">Servicios en Homepage</h3>
            <p className="text-gray-400 text-sm">Selecciona qué servicios mostrar en la página principal</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4">
            Servicios Disponibles ({availableServices.length})
          </h4>
          
          {availableServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">No hay servicios disponibles</div>
              <button 
                onClick={loadAvailableServices}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
              >
                Recargar servicios
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {availableServices.map((service) => {
                const isSelected = selectedServices.some(s => s._id === service._id);
                
                return (
                  <div
                    key={service._id}
                    onClick={() => toggleServiceSelection(service)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{service.icon}</div>
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
                              <span className="text-gray-500">
                                {service.deliveryTime}
                              </span>
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
          )}
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
                <div key={service._id} className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <div className="text-2xl mb-2">{service.icon}</div>
                  <h5 className="text-white font-medium mb-1">{service.title}</h5>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {service.description}
                  </p>
                  <div className="text-cyan-400 text-sm mt-2">Desde</div>
                </div>
              ))}
            </div>
            
            {selectedServices.length > 3 && (
              <p className="text-gray-400 text-sm mt-4 text-center">
                +{selectedServices.length - 3} servicios más se mostrarán en rotación
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

      {/* Orden de Visualización */}
      {selectedServices.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h4 className="text-white font-medium mb-4">Orden de Visualización</h4>
          <p className="text-gray-400 text-sm mb-4">
            Arrastra para reordenar los servicios:
          </p>
          
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div
                key={service._id}
                className="flex items-center space-x-3 p-3 bg-gray-800 border border-gray-600 rounded-lg"
              >
                <div className="text-gray-400">⋮⋮</div>
                <div className="text-xl">{service.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{service.title}</div>
                </div>
                <div className="text-gray-400 text-sm">#{index + 1}</div>
                <button
                  onClick={() => toggleServiceSelection(service)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}