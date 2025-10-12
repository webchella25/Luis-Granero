// src/app/admin/leads/[id]/components/modals/NoteModal.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NoteModal({ leadId, onClose, onSuccess }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const addNote = async () => {
    if (!note.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'note',
              notes: note
            }
          }
        })
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSaving(false);
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
          📝 Añadir Nota
        </h2>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">
            Nota:
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none h-32"
            placeholder="Escribe tu nota aquí..."
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={addNote}
            disabled={!note.trim() || saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}