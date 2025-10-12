// src/app/admin/leads/[id]/components/modals/EnrollSequenceModal.jsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EnrollSequenceModal({ lead, sequences, onClose, onSuccess }) {
  const enrollInSequence = async (sequenceId) => {
    try {
      const res = await fetch(`/api/sequences/${sequenceId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead._id })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ ' + data.message);
        onSuccess();
        onClose();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('Error enrolling in sequence:', error);
      alert('❌ Error al inscribir en la secuencia');
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
          🚀 Inscribir en Secuencia
        </h2>
        
        <p className="text-gray-400 mb-6">
          Selecciona la secuencia de emails automáticos para <strong className="text-white">{lead.name}</strong>
        </p>
        
        {sequences.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No hay secuencias activas</p>
            <Link
              href="/admin/sequences"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Crear una secuencia →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {sequences.map((sequence) => (
              <button
                key={sequence._id}
                onClick={() => enrollInSequence(sequence._id)}
                className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500/50 rounded-lg transition"
              >
                <div className="font-semibold text-white mb-1">
                  {sequence.name}
                </div>
                <div className="text-sm text-gray-400">
                  {sequence.steps?.length || 0} emails • {sequence.stats?.totalActive || 0} activos
                </div>
              </button>
            ))}
          </div>
        )}
        
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}