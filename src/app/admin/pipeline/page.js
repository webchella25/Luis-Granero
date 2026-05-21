'use client';
// src/app/admin/pipeline/page.js — Vista Kanban del pipeline de ventas
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'new', label: 'Nuevo', color: 'blue', emoji: '🆕' },
  { id: 'contacted', label: 'Contactado', color: 'yellow', emoji: '📨' },
  { id: 'qualified', label: 'Cualificado', color: 'purple', emoji: '✅' },
  { id: 'proposal', label: 'Propuesta', color: 'orange', emoji: '📄' },
  { id: 'negotiation', label: 'Negociación', color: 'pink', emoji: '🤝' },
  { id: 'won', label: 'Ganado', color: 'emerald', emoji: '🏆' },
  { id: 'lost', label: 'Perdido', color: 'red', emoji: '❌' }
];

const COLOR_MAP = {
  blue: 'border-blue-500/40 bg-blue-500/5',
  yellow: 'border-yellow-500/40 bg-yellow-500/5',
  purple: 'border-purple-500/40 bg-purple-500/5',
  orange: 'border-orange-500/40 bg-orange-500/5',
  pink: 'border-pink-500/40 bg-pink-500/5',
  emerald: 'border-emerald-500/40 bg-emerald-500/5',
  red: 'border-red-500/40 bg-red-500/5'
};

const BADGE_MAP = {
  blue: 'bg-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/20 text-pink-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  red: 'bg-red-500/20 text-red-400'
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function LeadCard({ lead, onDragStart }) {
  const days = daysSince(lead.lastContactedAt || lead.updatedAt);
  const isStale = days > 7 && !['won', 'lost', 'new'].includes(lead.status);
  const hasPhone = lead.phone || (lead.phoneNumbers && lead.phoneNumbers[0]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead._id)}
      className={`bg-slate-800/80 border rounded-lg p-3 cursor-grab active:cursor-grabbing select-none hover:bg-slate-700/80 transition-colors ${
        isStale ? 'border-yellow-500/40' : 'border-slate-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/admin/leads/${lead._id}`}
          className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors line-clamp-1 flex-1"
          onClick={e => e.stopPropagation()}
          draggable={false}
        >
          {lead.name}
        </Link>
        {lead.opportunityScore >= 70 && (
          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex-shrink-0">
            🔥 {lead.opportunityScore}
          </span>
        )}
      </div>

      {lead.category && (
        <div className="text-xs text-slate-500 mb-2 truncate">{lead.category}</div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex gap-2">
          {hasPhone && <span title="Tiene teléfono">📞</span>}
          {(lead.possibleEmails?.length > 0 || lead.email) && <span title="Tiene email">✉️</span>}
          {lead.rating && <span>⭐ {lead.rating}</span>}
        </div>
        {isStale && days ? (
          <span className="text-yellow-500 text-xs">⏰ {days}d sin actividad</span>
        ) : days !== null ? (
          <span>{days}d</span>
        ) : null}
      </div>
    </div>
  );
}

function KanbanColumn({ column, leads, stats, onDrop, onDragOver, onDragLeave, isDragOver, onDragStart }) {
  const totalLeads = leads.length;

  return (
    <div
      className={`flex-shrink-0 w-64 border rounded-xl transition-all ${COLOR_MAP[column.color]} ${
        isDragOver ? 'ring-2 ring-cyan-500/50 scale-[1.02]' : ''
      }`}
      onDrop={(e) => onDrop(e, column.id)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Column header */}
      <div className="px-3 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{column.emoji}</span>
            <span className="text-sm font-semibold text-slate-200">{column.label}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_MAP[column.color]}`}>
            {totalLeads}
          </span>
        </div>
        {stats?.staleCount > 0 && (
          <div className="text-xs text-yellow-500 mt-1">
            ⏰ {stats.staleCount} con +7d sin actividad
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="p-2 flex flex-col gap-2 min-h-[200px]">
        {leads.length === 0 && (
          <div className="text-center text-slate-600 text-xs py-8">
            Arrastra leads aquí
          </div>
        )}
        {leads.map(lead => (
          <LeadCard key={lead._id} lead={lead} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const dragLeadId = useRef(null);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await fetch('/api/admin/pipeline');
      const data = await res.json();
      if (data.success) {
        setPipeline(data.pipeline);
        setStats(data.stats);
      }
    } catch {
      toast.error('Error cargando el pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, leadId) => {
    dragLeadId.current = leadId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const leadId = dragLeadId.current;
    if (!leadId) return;

    // Encontrar en qué columna estaba
    let oldStatus = null;
    for (const [status, leads] of Object.entries(pipeline)) {
      if (leads.find(l => l._id === leadId)) {
        oldStatus = status;
        break;
      }
    }

    if (oldStatus === newStatus) return;

    // Actualizar UI optimisticamente
    setPipeline(prev => {
      const lead = prev[oldStatus]?.find(l => l._id === leadId);
      if (!lead) return prev;
      return {
        ...prev,
        [oldStatus]: prev[oldStatus].filter(l => l._id !== leadId),
        [newStatus]: [{ ...lead, status: newStatus }, ...(prev[newStatus] || [])]
      };
    });

    // Llamar API
    const res = await fetch('/api/admin/pipeline', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, newStatus })
    });

    const data = await res.json();
    if (!data.success) {
      toast.error('Error actualizando estado');
      fetchPipeline(); // Recargar en caso de error
    } else {
      const col = COLUMNS.find(c => c.id === newStatus);
      toast.success(`Lead movido a "${col?.label}"`);
    }

    dragLeadId.current = null;
  };

  // Totales del pipeline
  const totalLeads = Object.values(pipeline).reduce((acc, col) => acc + (col?.length || 0), 0);
  const wonLeads = pipeline.won?.length || 0;
  const proposalLeads = pipeline.proposal?.length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Cargando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pipeline de Ventas</h1>
          <p className="text-slate-400 mt-1">Arrastra los leads para cambiar su estado</p>
        </div>
        <button
          onClick={fetchPipeline}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total leads', value: totalLeads, icon: '👥', color: 'text-blue-400' },
          { label: 'En propuesta', value: proposalLeads, icon: '📄', color: 'text-orange-400' },
          { label: 'Cerrados', value: wonLeads, icon: '🏆', color: 'text-emerald-400' },
          { label: 'Conversión', value: `${conversionRate}%`, icon: '📈', color: 'text-cyan-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-slate-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban board — scroll horizontal */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              leads={pipeline[column.id] || []}
              stats={stats[column.id]}
              isDragOver={dragOverColumn === column.id}
              onDrop={handleDrop}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
