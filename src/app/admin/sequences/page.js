// src/app/admin/sequences/page.js - NUEVO ARCHIVO
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SequencesPage() {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSequences();
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

  const deleteSequence = async (id) => {
    if (!confirm('¿Eliminar esta secuencia? Los enrollments activos se pausarán.')) return;
    
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
        <div className="text-cyan-400 text-xl">Cargando secuencias...</div>
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
              📊 Secuencias Automatizadas
            </h1>
            <p className="text-gray-400">
              Gestiona tus campañas de emails automáticos
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link 
              href="/admin"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              ← Volver
            </Link>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition shadow-lg shadow-cyan-500/50"
            >
              ➕ Nueva Secuencia
            </button>
          </div>
        </div>

        {/* Stats generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Total Secuencias</div>
            <div className="text-3xl font-bold text-white">{sequences.length}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Leads Activos</div>
            <div className="text-3xl font-bold text-green-400">
              {sequences.reduce((sum, s) => sum + (s.stats?.totalActive || 0), 0)}
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Completados</div>
            <div className="text-3xl font-bold text-blue-400">
              {sequences.reduce((sum, s) => sum + (s.stats?.totalCompleted || 0), 0)}
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-yellow-500/20 rounded-lg p-6">
            <div className="text-gray-400 text-sm mb-2">Pausados</div>
            <div className="text-3xl font-bold text-yellow-400">
              {sequences.reduce((sum, s) => sum + (s.stats?.totalPaused || 0), 0)}
            </div>
          </div>
        </div>

        {/* Lista de secuencias */}
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
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {sequence.name}
                    </h3>
                    {sequence.description && (
                      <p className="text-gray-400 mb-4">{sequence.description}</p>
                    )}
                    
                    {/* Stats de la secuencia */}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Iniciados:</span>
                        <span className="text-white ml-2 font-semibold">
                          {sequence.stats?.totalStarted || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Activos:</span>
                        <span className="text-green-400 ml-2 font-semibold">
                          {sequence.stats?.totalActive || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Completados:</span>
                        <span className="text-blue-400 ml-2 font-semibold">
                          {sequence.stats?.totalCompleted || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Pausados:</span>
                        <span className="text-yellow-400 ml-2 font-semibold">
                          {sequence.stats?.totalPaused || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/sequences/${sequence._id}`}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm"
                    >
                      📊 Ver Detalles
                    </Link>
                    
                    <Link
                      href={`/admin/sequences/${sequence._id}/edit`}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm"
                    >
                      ✏️ Editar
                    </Link>
                    
                    <button
                      onClick={() => deleteSequence(sequence._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Pasos de la secuencia */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-sm text-gray-400 mb-3">
                    Pasos de la secuencia ({sequence.steps?.length || 0}):
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sequence.steps?.map((step, index) => (
                      <div
                        key={index}
                        className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-cyan-400 font-semibold">
                            Día {step.day}
                          </span>
                          <span className="text-xs text-gray-500">
                            Paso {index + 1}
                          </span>
                        </div>
                        <div className="text-white text-sm font-medium mb-1">
                          {step.templateId}
                        </div>
                        {step.description && (
                          <div className="text-gray-400 text-xs">
                            {step.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>

      {/* Modal Crear Secuencia - lo haremos después */}
      {showCreateModal && (
        <CreateSequenceModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchSequences}
        />
      )}
    </div>
  );
}

// Modal simple para crear secuencia
function CreateSequenceModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'manual'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          steps: [] // De momento vacío, se editarán después
        })
      });
      
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (error) {
      console.error('Error creating sequence:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          ➕ Nueva Secuencia
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              placeholder="Ej: Prospección Web Lenta"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white h-24"
              placeholder="Describe el objetivo de esta secuencia..."
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Trigger</label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData({...formData, trigger: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="manual">Manual</option>
              <option value="auto_no_website">Auto - Sin website</option>
              <option value="auto_slow_website">Auto - Website lento</option>
              <option value="auto_no_ssl">Auto - Sin SSL</option>
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold"
            >
              Crear
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}