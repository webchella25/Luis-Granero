// src/app/admin/leads/[id]/components/LeadHeader.jsx
'use client';

import Link from 'next/link';

export default function LeadHeader({ lead, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      interested: 'bg-green-500',
      qualified: 'bg-purple-500',
      proposal: 'bg-orange-500',
      negotiation: 'bg-pink-500',
      won: 'bg-emerald-500',
      lost: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nuevo',
      contacted: 'Contactado',
      interested: 'Interesado',
      qualified: 'Cualificado',
      proposal: 'Propuesta',
      negotiation: 'Negociación',
      won: 'Ganado',
      lost: 'Perdido'
    };
    return labels[status] || status;
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Link 
          href="/admin/leads"
          className="text-cyan-400 hover:text-cyan-300 mb-2 inline-block"
        >
          ← Volver a leads
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">
          {lead.name}
        </h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.status)} text-white`}>
            {getStatusLabel(lead.status)}
          </span>
          {lead.website && (
            <a 
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              🔗 {lead.website}
            </a>
          )}
        </div>
      </div>
      
      <button
        onClick={onDelete}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
      >
        🗑️ Eliminar Lead
      </button>
    </div>
  );
}