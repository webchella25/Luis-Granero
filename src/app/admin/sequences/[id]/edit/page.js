// src/app/admin/sequences/[id]/edit/page.js - NUEVO ARCHIVO
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EditSequencePage() {
  const params = useParams();
  const router = useRouter();
  const [sequence, setSequence] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    steps: []
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch sequence
      const seqRes = await fetch(`/api/sequences/${params.id}`);
      const seqData = await seqRes.json();
      
      if (seqData.success) {
        setSequence(seqData.sequence);
        setFormData({
          name: seqData.sequence.name,
          description: seqData.sequence.description || '',
          trigger: seqData.sequence.trigger,
          steps: seqData.sequence.steps || []
        });
      }
      
      // Fetch templates
      const tempRes = await fetch('/api/email-templates');
      const tempData = await tempRes.json();
      
      if (tempData.success) {
        setTemplates(tempData.templates);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          day: formData.steps.length === 0 ? 0 : 3,
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

  const moveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.steps.length - 1)
    ) {
      return;
    }
    
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    setFormData({
      ...formData,
      steps: newSteps
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/sequences/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push(`/admin/sequences/${params.id}`);
      } else {
        alert('Error al guardar la secuencia');
      }
    } catch (error) {
      console.error('Error saving sequence:', error);
      alert('Error al guardar la secuencia');
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
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/admin/sequences/${params.id}`}
            className="text-cyan-400 hover:text-cyan-300 mb-2 inline-block"
          >
            ← Volver a detalles
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            ✏️ Editar Secuencia
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Información básica */}
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              📋 Información Básica
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Nombre de la Secuencia
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="Ej: Prospección Web Lenta"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none h-24"
                  placeholder="Describe el objetivo de esta secuencia..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  Trigger de Activación
                </label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({...formData, trigger: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="manual">Manual (tú decides cuándo iniciar)</option>
                  <option value="auto_no_website">Auto - Leads sin website</option>
                  <option value="auto_slow_website">Auto - Website lento (&gt;3s)</option>
                  <option value="auto_no_ssl">Auto - Sin certificado SSL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pasos de la secuencia */}
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                📧 Pasos de la Secuencia
              </h2>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
              >
                ➕ Añadir Paso
              </button>
            </div>
            
            {formData.steps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-lg">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 mb-4">
                  No hay pasos en esta secuencia
                </p>
                <button
                  type="button"
                  onClick={addStep}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition"
                >
                  Añadir primer paso
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg p-5"
                  >
                    <div className="flex items-start gap-4">
                      
                      {/* Número de paso */}
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                        <span className="text-cyan-400 font-bold">{index + 1}</span>
                      </div>
                      
                      {/* Campos del paso */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-2">
                              Día de envío
                            </label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={step.day}
                              onChange={(e) => updateStep(index, 'day', parseInt(e.target.value))}
                              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              0 = inmediato, 1 = mañana, etc.
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-gray-300 text-sm mb-2">
                              Template de email
                            </label>
                            <select
                              required
                              value={step.templateId}
                              onChange={(e) => updateStep(index, 'templateId', e.target.value)}
                              className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                            >
                              <option value="">Selecciona un template...</option>
                              {templates.map((template) => (
                                <option key={template.templateId} value={template.templateId}>
                                  {template.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 text-sm mb-2">
                            Descripción (opcional)
                          </label>
                          <input
                            type="text"
                            value={step.description || ''}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                            placeholder="Ej: Email de seguimiento inicial"
                          />
                        </div>
                      </div>
                      
                      {/* Controles */}
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => moveStep(index, 'up')}
                          disabled={index === 0}
                          className={`p-2 rounded ${
                            index === 0 
                              ? 'bg-slate-600 text-gray-500 cursor-not-allowed' 
                              : 'bg-slate-600 hover:bg-slate-500 text-white'
                          }`}
                          title="Mover arriba"
                        >
                          ⬆️
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 'down')}
                          disabled={index === formData.steps.length - 1}
                          className={`p-2 rounded ${
                            index === formData.steps.length - 1
                              ? 'bg-slate-600 text-gray-500 cursor-not-allowed' 
                              : 'bg-slate-600 hover:bg-slate-500 text-white'
                          }`}
                          title="Mover abajo"
                        >
                          ⬇️
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded"
                          title="Eliminar paso"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <Link
              href={`/admin/sequences/${params.id}`}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white text-center rounded-lg font-semibold transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition shadow-lg shadow-cyan-500/50"
            >
              💾 Guardar Cambios
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}