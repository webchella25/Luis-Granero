// src/app/admin/leads/[id]/components/LeadActionsSidebar.jsx
'use client';

export default function LeadActionsSidebar({
  lead,
  onStatusChange,
  onOpenEmail,
  onOpenWhatsApp,
  onOpenNote,
  onOpenEdit,
  onOpenEnroll
}) {
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
    <div className="space-y-6">
      
      {/* Cambiar estado */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          🎯 Cambiar Estado
        </h3>
        
        <div className="space-y-2">
          {['new', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition text-left ${
                lead.status === status
                  ? `${getStatusColor(status)} text-white`
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          ⚡ Acciones Rápidas
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onOpenEmail}
            disabled={!lead.possibleEmails?.[0]}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition shadow-lg shadow-cyan-500/50"
          >
            📧 Enviar Email
          </button>
          
          <button
            onClick={onOpenWhatsApp}
            disabled={!lead.phoneNumbers?.[0]}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition shadow-lg shadow-green-500/50"
          >
            💬 WhatsApp
          </button>
          
          <button
            onClick={onOpenNote}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition shadow-lg shadow-yellow-500/50"
          >
            📝 Añadir Nota
          </button>
          
          <button
            onClick={onOpenEdit}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold transition shadow-lg shadow-blue-500/50"
          >
            ✏️ Editar Datos
          </button>
          
          <button
            onClick={onOpenEnroll}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-lg shadow-purple-500/50"
          >
            🚀 Iniciar Secuencia
          </button>
        </div>
      </div>

      {/* Metadatos */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          ℹ️ Información
        </h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Creado</div>
            <div className="text-white">
              {new Date(lead.createdAt).toLocaleString('es-ES')}
            </div>
          </div>
          
          {lead.source && (
            <div>
              <div className="text-gray-400 mb-1">Fuente</div>
              <div className="text-white">{lead.source}</div>
            </div>
          )}
          
          {lead.campaign && (
            <div>
              <div className="text-gray-400 mb-1">Campaña</div>
              <div className="text-white">{lead.campaign}</div>
            </div>
          )}
          
          <div>
            <div className="text-gray-400 mb-1">ID</div>
            <div className="text-white font-mono text-xs break-all">{lead._id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}