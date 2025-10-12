// src/app/admin/leads/[id]/components/modals/WhatsAppModal.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WhatsAppModal({ lead, onClose, onSuccess }) {
  const [whatsappMessage, setWhatsappMessage] = useState('');

  const replaceShortcodes = (text) => {
    if (!text || !lead) return '';
    
    const now = new Date();
    const replacements = {
      '{{name}}': lead.name || '',
      '{{first_name}}': lead.name?.split(' ')[0] || '',
      '{{website}}': lead.website || 'tu sitio web',
      '{{company_name}}': lead.companyName || lead.name || '',
      '{{current_date}}': now.toLocaleDateString('es-ES')
    };
    
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    
    return result;
  };

  const sendWhatsApp = async () => {
    if (!lead.phoneNumbers?.[0]) {
      alert('No hay teléfono disponible para este lead');
      return;
    }

    const phone = lead.phoneNumbers[0].replace(/\D/g, '');
    const message = replaceShortcodes(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Registrar en el historial
    try {
      await fetch(`/api/leads/${lead._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'whatsapp',
              notes: message
            }
          }
        })
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding to history:', error);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          💬 Mensaje de WhatsApp
        </h2>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">
            Mensaje para {lead.name}:
          </label>
          <textarea
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none h-32"
            placeholder="Escribe tu mensaje aquí..."
          />
          <div className="text-xs text-gray-400 mt-2">
            💡 Puedes usar: {'{{name}}'}, {'{{first_name}}'}, {'{{website}}'}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={sendWhatsApp}
            disabled={!whatsappMessage.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            Enviar
          </button>
        </div>
      </motion.div>
    </div>
  );
}