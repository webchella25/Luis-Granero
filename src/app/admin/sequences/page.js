// src/app/admin/sequences/page.js - ACTUALIZADO COMPLETO
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SequencesPage() {
  const [sequences, setSequences] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSequences();
    fetchTemplates();
  }, []);

  const fetchSequences = async () => {
    try {
      const res = await fetch('/api/sequences');
      const data = await res.json();
      if (data.success) {
        setSequences(data.sequences);
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates.filter(t => t.isActive));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const deleteSequence = async (id) => {
    if (!confirm('¿Eliminar esta secuencia?')) return;
    
    try {
      const res = await fetch(`/api/sequences/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchSequences();
      }
    } catch (error) {
      console.error('Error deleting sequence:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔄 Secuencias de Email
            </h1>
            <p className="text-gray-400">
              Automatiza tu outreach con secuencias de emails
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
          >
            ➕ Nueva Secuencia
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Total Secuencias</div>
            <div className="text-3xl font-bold text-white">{sequences.length}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Activas</div>
            <div className="text-3xl font-bold text-green-400">
              {sequences.filter(s => s.isActive).length}
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Leads Inscritos</div>
            <div className="text-3xl font-bold text-cyan-400">
              {sequences.reduce((sum, s) => sum + (s.stats?.totalActive || 0), 0)}
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-1">Emails Enviados</div>
            <div className="text-3xl font-bold text-blue-400">
              {sequences.reduce((sum, s) => sum + (s.stats?.totalSent || 0), 0)}
            </div>
          </div>
        </div>

        {/* Lista de Secuencias */}
        <div className="space-y-6">
          {sequences.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No hay secuencias creadas
              </h3>
              <p className="text-gray-400 mb-6">
                Crea tu primera secuencia automatizada para empezar a nutrir leads
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold"
              >
                Crear primera secuencia
              </button>
            </div>
          ) : (
            sequences.map((sequence) => (
              <motion.div
                key={sequence._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        {sequence.name}
                      </h3>
                      {sequence.isActive ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                          Activa
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                          Pausada
                        </span>
                      )}
                    </div>
                    {sequence.description && (
                      <p className="text-gray-400 mb-4">{sequence.description}</p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Inscritos:</span>
                        <span className="text-white ml-2 font-semibold">
                          {sequence.stats?.totalEnrolled || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Activos:</span>
                        <span className="text-cyan-400 ml-2 font-semibold">
                          {sequence.stats?.totalActive || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Completados:</span>
                        <span className="text-green-400 ml-2 font-semibold">
                          {sequence.stats?.totalCompleted || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/sequences/${sequence._id}`}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition text-sm"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/sequences/${sequence._id}/edit`}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => deleteSequence(sequence._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Pasos */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-sm text-gray-400 mb-3">
                    Pasos ({sequence.steps?.length || 0}):
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {sequence.steps?.map((step, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 font-semibold text-sm">
                            Día {step.day}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="text-white text-xs font-medium">
                          {step.templateId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>

      {/* Modal Mejorado */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSequenceModal 
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchSequences}
            templates={templates}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ✅ MODAL MEJORADO CON PASOS
function CreateSequenceModal({ onClose, onCreated, templates }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    steps: []
  });

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          day: formData.steps.length === 0 ? 0 : formData.steps[formData.steps.length - 1].day + 3,
          templateId: '',
          description: ''
        }
      ]
    });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData({
      ...formData,
      steps: newSteps
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onCreated();
        onClose();
      } else {
        alert('Error al crear la secuencia');
      }
    } catch (error) {
      console.error('Error creating sequence:', error);
      alert('Error al crear la secuencia');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-lg p-8 max-w-4xl w-full border border-cyan-500/30 my-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          ➕ Nueva Secuencia
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Ej: Prospección Restaurantes"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Trigger</label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="manual">Manual</option>
                <option value="auto_no_website">Auto - Sin website</option>
                <option value="auto_slow_website">Auto - Website lento</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              rows="2"
              placeholder="Describe el objetivo de esta secuencia..."
            />
          </div>

          {/* Pasos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-gray-300 font-semibold">
                Pasos de la Secuencia
              </label>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition"
              >
                ➕ Añadir Paso
              </button>
            </div>

            {formData.steps.length === 0 ? (
              <div className="bg-slate-700/30 border border-dashed border-slate-600 rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-4">No hay pasos añadidos</p>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Añadir primer paso →
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {formData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-cyan-400 font-semibold">
                        Paso {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">
                          Día de envío
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={step.day}
                          onChange={(e) => updateStep(index, 'day', parseInt(e.target.value))}
                          className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">
                          Template de email *
                        </label>
                        <select
                          required
                          value={step.templateId}
                          onChange={(e) => updateStep(index, 'templateId', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                        >
                          <option value="">Selecciona...</option>
                          {templates.map((template) => (
                            <option key={template.templateId} value={template.templateId}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-gray-400 text-sm mb-2">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={step.description || ''}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-white"
                        placeholder="Ej: Email de seguimiento"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition"
            >
              Crear Secuencia
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}