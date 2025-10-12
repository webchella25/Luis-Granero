// src/app/admin/leads/[id]/components/LeadContactHistory.jsx
'use client';

import { motion } from 'framer-motion';

export default function LeadContactHistory({ history }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        📞 Historial de Contacto
      </h2>
      
      {history?.length > 0 ? (
        <div className="space-y-4">
          {history
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                  {contact.type === 'email' && '📧'}
                  {contact.type === 'whatsapp' && '💬'}
                  {contact.type === 'call' && '📞'}
                  {contact.type === 'note' && '📝'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold capitalize">
                      {contact.type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(contact.date).toLocaleString('es-ES')}
                    </span>
                  </div>
                  
                  {contact.subject && (
                    <div className="text-cyan-400 text-sm mb-1">
                      {contact.subject}
                    </div>
                  )}
                  
                  {contact.notes && (
                    <div className="text-gray-300 text-sm">
                      {contact.notes}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-gray-400">
            No hay historial de contacto todavía
          </div>
        </div>
      )}
    </div>
  );
}