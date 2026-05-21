'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';

const STATUS_MAP = {
  new:         { label: 'Nuevo',       cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  contacted:   { label: 'Contactado',  cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  interested:  { label: 'Interesado',  cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  qualified:   { label: 'Cualificado', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  proposal:    { label: 'Propuesta',   cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  negotiation: { label: 'Negociación', cls: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
  won:         { label: 'Ganado',      cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
  lost:        { label: 'Perdido',     cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function LeadHeader({ lead, onDelete }) {
  const status = STATUS_MAP[lead.status] || { label: lead.status, cls: 'bg-slate-700 text-slate-400 border-slate-600' };

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-400 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a leads
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-100">{lead.name}</h1>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${status.cls}`}>
            {status.label}
          </span>
          {lead.source === 'google_maps' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">Maps</span>
          )}
          {lead.source === 'instagram' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 font-mono">Instagram</span>
          )}
        </div>

        {lead.category && (
          <p className="text-slate-500 text-sm mt-1">{lead.category}</p>
        )}

        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-500/70 hover:text-cyan-400 mt-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {lead.website}
          </a>
        )}
      </div>

      <button
        onClick={onDelete}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 transition-all shrink-0"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </div>
  );
}
