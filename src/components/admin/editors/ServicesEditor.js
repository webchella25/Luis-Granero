// src/components/admin/editors/ServicesEditor.js (NUEVO COMPONENTE COMPLETO)
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ServicesEditor({ data, onUpdate }) {
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(data.selectedServices || []);
  const [sectionConfig, setSectionConfig] = useState({
    title: data.servicesTitle || 'Servicios Especializados',
    subtitle: data.servicesSubtitle || 'Desarrollo web moderno enfocado en resultados.',
    showViewAllButton: data.showViewAllButton !== false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableServices();
  }, []);

  const loadAvailableServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (response.ok) {
        const result = await response.json();
        setAvailableServices(result.services || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceSelection = (service) => {
    const isSelected = selectedServices.some(s => s._id === service._id);
    
    if (isSelected) {
      // Remover servicio
      const updated = selectedServices.filter(s => s._id !== service._id);
      setSelectedServices(updated);
      updateParent(updated);
    } else if (selectedServices.length < 6) {
      // Añadir servicio (máximo 6)
      const updated = [...selectedServices, service];
      setSelectedServices(updated);
      updateParent(updated);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedServices);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedServices(items);
    updateParent(items);
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

  return (
    <div className="space-y-8">
      
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
                      
                      {service.pricing?.startingPrice && (
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-400 font-medium">
                            {service.pricing.startingPrice}
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
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="services">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {selectedServices.map((service, index) => (
                    <Draggable key={service._id} draggableId={service._id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center space-x-3 p-3 bg-gray-800 border border-gray-600 rounded-lg ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="text-gray-400 cursor-grab">⋮⋮</div>
                          <div className="text-xl">{service.icon}</div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{service.title}</div>
                          </div>
                          <div className="text-gray-400 text-sm">#{index + 1}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}