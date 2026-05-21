'use client';

import { Mail, MessageCircle, Phone, StickyNote, Calendar } from 'lucide-react';

const TYPE_MAP = {
  email:     { icon: Mail,           color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Email' },
  whatsapp:  { icon: MessageCircle,  color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'WhatsApp' },
  call:      { icon: Phone,          color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Llamada' },
  note:      { icon: StickyNote,     color: 'text-slate-400',  bg: 'bg-slate-700',     label: 'Nota' },
  meeting:   { icon: Calendar,       color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Reunión' },
};

export default function LeadContactHistory({ history }) {
  if (!history?.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Historial de Contacto</h2>
        <div className="text-center py-8 text-slate-600 text-sm">Sin historial de contacto todavía</div>
      </div>
    );
  }

  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Historial de Contacto
        <span className="ml-2 text-xs font-normal text-slate-600">({history.length})</span>
      </h2>

      <div className="space-y-2">
        {sorted.map((contact, i) => {
          const t = TYPE_MAP[contact.type] || TYPE_MAP.note;
          const Icon = t.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${t.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-300">{t.label}</span>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(contact.date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {contact.subject && <p className="text-xs text-cyan-400/80 truncate">{contact.subject}</p>}
                {contact.notes && <p className="text-xs text-slate-400 mt-0.5">{contact.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
