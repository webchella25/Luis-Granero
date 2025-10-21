'use client';

import { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, Save, Clock } from 'lucide-react';

export default function AdminBudgetCalculator() {
  const [config, setConfig] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('config');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configRes, budgetsRes] = await Promise.all([
        fetch('/api/admin/contact-page'),
        fetch('/api/budget-requests')
      ]);
      
      const configData = await configRes.json();
      const budgetsData = await budgetsRes.json();
      
      setConfig(configData.budgetCalculator);
      setBudgets(budgetsData.budgets || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/contact-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetCalculator: config })
      });

      if (res.ok) {
        alert('✅ Guardado correctamente');
      } else {
        alert('❌ Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const addProjectType = () => {
    setConfig({
      ...config,
      projectTypes: [
        ...config.projectTypes,
        {
          id: `project-${Date.now()}`,
          name: 'Nuevo Proyecto',
          basePrice: 1000,
          description: 'Descripción',
          icon: 'file',
          order: config.projectTypes.length + 1
        }
      ]
    });
  };

  const updateProjectType = (id, field, value) => {
    setConfig({
      ...config,
      projectTypes: config.projectTypes.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const deleteProjectType = (id) => {
    if (confirm('¿Eliminar?')) {
      setConfig({
        ...config,
        projectTypes: config.projectTypes.filter(p => p.id !== id)
      });
    }
  };

  const addFeature = (category) => {
    setConfig({
      ...config,
      features: [
        ...config.features,
        {
          id: `feature-${Date.now()}`,
          name: 'Nueva Característica',
          price: 500,
          description: 'Descripción',
          category,
          order: config.features.filter(f => f.category === category).length + 1
        }
      ]
    });
  };

  const updateFeature = (id, field, value) => {
    setConfig({
      ...config,
      features: config.features.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  const deleteFeature = (id) => {
    if (confirm('¿Eliminar?')) {
      setConfig({
        ...config,
        features: config.features.filter(f => f.id !== id)
      });
    }
  };

  // FUNCIONES PARA PLAZOS (NUEVO)
  const addTimeline = () => {
    setConfig({
      ...config,
      timelines: [
        ...config.timelines,
        {
          id: `timeline-${Date.now()}`,
          name: 'Nuevo Plazo',
          multiplier: 1.0,
          days: 14,
          description: 'Descripción',
          order: config.timelines.length + 1
        }
      ]
    });
  };

  const updateTimeline = (id, field, value) => {
    setConfig({
      ...config,
      timelines: config.timelines.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    });
  };

  const deleteTimeline = (id) => {
    if (confirm('¿Eliminar este plazo?')) {
      setConfig({
        ...config,
        timelines: config.timelines.filter(t => t.id !== id)
      });
    }
  };

  const updateBudgetStatus = async (budgetId, status) => {
    try {
      const res = await fetch('/api/budget-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetId, status })
      });

      if (res.ok) {
        setBudgets(budgets.map(b => 
          b._id === budgetId ? { ...b, status } : b
        ));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calculator className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Gestión de Presupuestos</h1>
        </div>
        {activeTab === 'config' && (
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'config'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Configuración
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'requests'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Solicitudes ({budgets.length})
        </button>
      </div>

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="space-y-8">
          {/* Tipos de Proyecto */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Tipos de Proyecto</h2>
              <button
                onClick={addProjectType}
                className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>
            <div className="space-y-4">
              {config.projectTypes?.sort((a, b) => a.order - b.order).map((project) => (
                <div key={project.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProjectType(project.id, 'name', e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Nombre"
                    />
                    <input
                      type="number"
                      value={project.basePrice}
                      onChange={(e) => updateProjectType(project.id, 'basePrice', parseFloat(e.target.value))}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Precio"
                    />
                  </div>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProjectType(project.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white mb-4"
                    placeholder="Descripción"
                    rows={2}
                  />
                  <div className="flex justify-between items-center">
                    <input
                      type="number"
                      value={project.order}
                      onChange={(e) => updateProjectType(project.id, 'order', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      placeholder="Orden"
                    />
                    <button
                      onClick={() => deleteProjectType(project.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Características */}
          {['frontend', 'backend', 'seo', 'extra'].map(category => (
            <section key={category} className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white capitalize">
                  {category === 'frontend' ? 'Frontend' : 
                   category === 'backend' ? 'Backend' :
                   category === 'seo' ? 'SEO' : 'Extras'}
                </h2>
                <button
                  onClick={() => addFeature(category)}
                  className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
              <div className="space-y-4">
                {config.features?.filter(f => f.category === category).sort((a, b) => a.order - b.order).map((feature) => (
                  <div key={feature.id} className="bg-gray-900/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={feature.name}
                        onChange={(e) => updateFeature(feature.id, 'name', e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Nombre"
                      />
                      <input
                        type="number"
                        value={feature.price}
                        onChange={(e) => updateFeature(feature.id, 'price', parseFloat(e.target.value))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Precio"
                      />
                      <input
                        type="number"
                        value={feature.order}
                        onChange={(e) => updateFeature(feature.id, 'order', parseInt(e.target.value))}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Orden"
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                        placeholder="Descripción"
                      />
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* PLAZOS DE ENTREGA (NUEVO) */}
          <section className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Plazos de Entrega</h2>
              </div>
              <button
                onClick={addTimeline}
                className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir Plazo
              </button>
            </div>
            <div className="space-y-4">
              {config.timelines?.sort((a, b) => a.order - b.order).map((timeline) => (
                <div key={timeline.id} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={timeline.name}
                      onChange={(e) => updateTimeline(timeline.id, 'name', e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Nombre (ej: Normal, Urgente)"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={timeline.multiplier}
                      onChange={(e) => updateTimeline(timeline.id, 'multiplier', parseFloat(e.target.value))}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Multiplicador (ej: 1.5)"
                    />
                    <input
                      type="number"
                      value={timeline.days}
                      onChange={(e) => updateTimeline(timeline.id, 'days', parseInt(e.target.value))}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Días"
                    />
                    <input
                      type="number"
                      value={timeline.order}
                      onChange={(e) => updateTimeline(timeline.id, 'order', parseInt(e.target.value))}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Orden"
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={timeline.description}
                      onChange={(e) => updateTimeline(timeline.id, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      placeholder="Descripción (ej: Sin urgencia, mejor precio)"
                    />
                    <button
                      onClick={() => deleteTimeline(timeline.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    💡 Multiplicador: 0.9 = -10%, 1.0 = normal, 1.5 = +50%
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No hay solicitudes todavía
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget._id} className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {budget.clientInfo.name}
                    </h3>
                    <p className="text-gray-400">{budget.clientInfo.email}</p>
                    {budget.clientInfo.phone && (
                      <p className="text-gray-400">{budget.clientInfo.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">
                      {budget.budget.total}€
                    </div>
                    <select
                      value={budget.status}
                      onChange={(e) => updateBudgetStatus(budget._id, e.target.value)}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="reviewed">Revisado</option>
                      <option value="contacted">Contactado</option>
                      <option value="converted">Convertido</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Proyecto</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-gray-300">
                        <strong>Tipo:</strong> {budget.budget.projectType.name} ({budget.budget.projectType.basePrice}€)
                      </li>
                      <li className="text-gray-300">
                        <strong>Plazo:</strong> {budget.budget.timeline.name}
                      </li>
                      {budget.budget.selectedFeatures.length > 0 && (
                        <li className="text-gray-300">
                          <strong>Características:</strong>
                          <ul className="ml-4 mt-1">
                            {budget.budget.selectedFeatures.map((f, i) => (
                              <li key={i}>• {f.name} (+{f.price}€)</li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Desglose</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-gray-300">Subtotal: {budget.budget.subtotal}€</li>
                      {budget.budget.timelineAdjustment !== 0 && (
                        <li className="text-gray-300">
                          Ajuste: {budget.budget.timelineAdjustment > 0 ? '+' : ''}{Math.round(budget.budget.timelineAdjustment)}€
                        </li>
                      )}
                      {budget.budget.appliedDiscount && (
                        <li className="text-green-400">
                          Descuento: -{budget.budget.discount}€
                        </li>
                      )}
                      <li className="text-cyan-400 font-bold">Total: {budget.budget.total}€</li>
                    </ul>
                  </div>
                </div>

                {budget.message && (
                  <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-2">Mensaje</h4>
                    <p className="text-gray-300 text-sm">{budget.message}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
                  {new Date(budget.createdAt).toLocaleString('es-ES')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}