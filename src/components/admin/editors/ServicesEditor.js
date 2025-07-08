// src/components/admin/editors/ServicesEditor.js (CORREGIDO CON MÁS DEBUG)
'use client';

import { useState, useEffect } from 'react';

export default function ServicesEditor({ data = {}, onUpdate }) {
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
        console.log(`📦 Data received from admin services:`, result);
        
        // DEBUG: Inspeccionar la estructura exacta
        console.log('🔬 Debug - tipo de result:', typeof result);
        console.log('🔬 Debug - result.services existe?', !!result.services);
        console.log('🔬 Debug - result.services tipo:', typeof result.services);
        console.log('🔬 Debug - result.services es array?', Array.isArray(result.services));
        
        if (result.services) {
          console.log('🔬 Debug - result.services length:', result.services.length);
          console.log('🔬 Debug - primer servicio:', result.services[0]);
        }
        
        let services = result.services || [];
        
        // Verificar estructura de datos MÁS específicamente
        if (Array.isArray(services) && services.length > 0) {
          console.log(`✅ Found ${services.length} services from admin`);
          console.log('📋 Services list:', services.map(s => ({
            id: s._id || s.id,
            title: s.title,
            icon: s.icon,
            hasTitle: !!s.title
          })));
          
          setAvailableServices(services);
        } else {
          console.log('⚠️ No valid services in admin response, using fallback');
          console.log('🔬 Debug - services variable:', services);
          setAvailableServices(getFallbackServices());
        }
      } else {
        console.error(`❌ Admin services API error: ${response.status}`);
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
      deliveryTime: '2-4 semanas',
      isActive: true
    },
    {
      _id: 'fallback-2',
      title: 'E-commerce Personalizado',
      subtitle: 'Sin plantillas genéricas',
      description: 'Tiendas online a medida con gestión avanzada.',
      icon: '🛒',
      color: 'from-green-400 to-emerald-500',
      pricing: { startingPrice: '3,500€' },
      deliveryTime: '4-8 semanas',
      isActive: true
    },
    {
      _id: 'fallback-3',
      title: 'SEO & Optimización',
      subtitle: 'Performance & Rankings',
      description: 'Optimización técnica completa para mejorar rankings.',
      icon: '🚀',
      color: 'from-purple-400 to-pink-500',
      pricing: { startingPrice: '800€' },
      deliveryTime: '1-2 semanas',
      isActive: true
    },
    {
      _id: 'fallback-4',
      title: 'APIs y Backend',
      subtitle: 'Node.js, Integración',
      description: 'Desarrollo de APIs robustas y backends escalables.',
      icon: '🔧',
      color: 'from-orange-400 to-red-500',
      pricing: { startingPrice: '1,800€' },
      deliveryTime: '2-5 semanas',
      isActive: true
    },
    {
      _id: 'fallback-5',
      title: 'Aplicaciones Web Complejas',
      subtitle: 'SPA, PWA, Dashboards',
      description: 'Herramientas web específicas para tu negocio.',
      icon: '⚡',
      color: 'from-purple-400 to-pink-500',
      pricing: { startingPrice: '2,500€' },
      deliveryTime: '3-6 semanas',
      isActive: true
    }
  ];

  const toggleServiceSelection = (service) => {
    console.log('🖱️ Toggle service clicked:', service.title);
    console.log('🔧 onUpdate function:', typeof onUpdate);
    
    try {
      const serviceId = service._id || service.id;
      const isSelected = selectedServices.some(s => (s._id || s.id) === serviceId);
      
      let updated;
      if (isSelected) {
        updated = selectedServices.filter(s => (s._id || s.id) !== serviceId);
        console.log('➖ Removing service:', service.title);
      } else if (selectedServices.length < 6) {
        updated = [...selectedServices, service];
        console.log('➕ Adding service:', service.title);
      } else {
        console.log('⚠️ Max services reached (6)');
        return;
      }
      
      setSelectedServices(updated);
      updateParent(updated);
    } catch (err) {
      console.error('❌ Error in toggleServiceSelection:', err);
    }
  };

  const updateSectionConfig = (field, value) => {
    console.log('🔧 Updating section config:', field, value);
    
    try {
      const updated = { ...sectionConfig, [field]: value };
      setSectionConfig(updated);
      
      if (typeof onUpdate === 'function') {
        onUpdate('servicesConfig', updated);
      } else {
        console.warn('⚠️ onUpdate is not a function:', typeof onUpdate);
      }
    } catch (err) {
      console.error('❌ Error in updateSectionConfig:', err);
    }
  };

  const updateParent = (services) => {
    console.log('📤 Updating parent with services:', services.length);
    
    try {
      if (typeof onUpdate === 'function') {
        onUpdate('selectedServices', services);
        onUpdate('servicesConfig', sectionConfig);
      } else {
        console.warn('⚠️ onUpdate is not a function:', typeof onUpdate);
      }
    } catch (err) {
      console.error('❌ Error in updateParent:', err);
    }
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
        <div className="text-gray-500 mt-1">
          onUpdate type: {typeof onUpdate}
        </div>
        <div className="text-gray-500 mt-1">
          data received: {JSON.stringify(Object.keys(data))}
        </div>
        {availableServices.length > 0 && (
          <div className="text-gray-500 mt-1">
            Primer servicio: {availableServices[0]?.title || 'Sin título'}
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
                        <h5 className="text-white font-medium">{service.title || 'Sin título'}</h5>
                        {service.subtitle && (
                          <p className="text-cyan-400 text-sm mb-2">{service.subtitle}</p>
                        )}
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {service.description || 'Sin descripción'}
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

      {/* Resto del componente igual... */}
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
    </div>
  );
}