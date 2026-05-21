'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Mail, MessageCircle, StickyNote, Edit2, Zap,
  Globe, FileText, Copy, ExternalLink, Loader2
} from 'lucide-react';

const STATUSES = [
  { value: 'new',         label: 'Nuevo',       cls: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
  { value: 'contacted',   label: 'Contactado',  cls: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { value: 'interested',  label: 'Interesado',  cls: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' },
  { value: 'qualified',   label: 'Cualificado', cls: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { value: 'proposal',    label: 'Propuesta',   cls: 'border-orange-500/30 text-orange-400 bg-orange-500/10' },
  { value: 'negotiation', label: 'Negociación', cls: 'border-pink-500/30 text-pink-400 bg-pink-500/10' },
  { value: 'won',         label: 'Ganado',      cls: 'border-green-500/30 text-green-400 bg-green-500/10' },
  { value: 'lost',        label: 'Perdido',     cls: 'border-red-500/30 text-red-400 bg-red-500/10' },
];

export default function LeadActionsSidebar({
  lead, onStatusChange,
  onOpenEmail, onOpenWhatsApp, onOpenNote, onOpenEdit, onOpenEnroll,
  demoSite, onDemoGenerated
}) {
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [generatingProposal, setGeneratingProposal] = useState(false);

  const hasEmail = !!(lead.possibleEmails?.length || lead.webAnalysis?.emails?.length);
  const hasPhone = !!(lead.phone || lead.phoneNumbers?.length);

  const score = lead.opportunityScore ?? 0;
  const scoreColor = score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const scoreBarColor = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const handleGenerateDemo = async () => {
    setGeneratingDemo(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}/generate-demo`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.demo.isExisting ? 'Demo existente recuperada' : 'Demo generada');
        onDemoGenerated?.(data.demo);
      } else {
        toast.error('Error generando demo');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setGeneratingDemo(false); }
  };

  const handleGenerateProposal = async () => {
    setGeneratingProposal(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead._id}/generate-proposal`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Propuesta generada');
        window.open(data.proposal.url, '_blank');
      } else {
        toast.error('Error generando propuesta');
      }
    } catch { toast.error('Error de conexión'); }
    finally { setGeneratingProposal(false); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copiado'); };

  return (
    <div className="space-y-4">

      {/* Estado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Estado del Lead</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map((s) => {
            const active = lead.status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                  active ? s.cls : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Acciones</h3>
        <div className="space-y-2">
          <ActionBtn icon={Mail} label="Enviar Email" onClick={onOpenEmail} disabled={!hasEmail} color="cyan" />
          <ActionBtn icon={MessageCircle} label="WhatsApp" onClick={onOpenWhatsApp} disabled={!hasPhone} color="green" />
          <ActionBtn icon={StickyNote} label="Añadir Nota" onClick={onOpenNote} color="yellow" />
          <ActionBtn icon={Edit2} label="Editar Datos" onClick={onOpenEdit} color="blue" />
          <ActionBtn icon={Zap} label="Iniciar Secuencia" onClick={onOpenEnroll} color="purple" />
          <ActionBtn
            icon={generatingDemo ? Loader2 : Globe}
            label={generatingDemo ? 'Generando demo...' : 'Generar Demo Web'}
            onClick={handleGenerateDemo}
            disabled={generatingDemo}
            color="orange"
            spin={generatingDemo}
          />
          <ActionBtn
            icon={generatingProposal ? Loader2 : FileText}
            label={generatingProposal ? 'Generando...' : 'Generar Propuesta'}
            onClick={handleGenerateProposal}
            disabled={generatingProposal}
            color="teal"
            spin={generatingProposal}
          />
        </div>
      </div>

      {/* Demo activa */}
      {demoSite && (
        <div className="bg-slate-900 border border-orange-500/20 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demo Web Activa</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Sector</span>
              <span className="text-orange-400 capitalize font-medium">{demoSite.sector}</span>
            </div>
            {demoSite.visitCount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                <span className="text-green-400 font-semibold">{demoSite.visitCount} visita{demoSite.visitCount > 1 ? 's' : ''}</span>
                {demoSite.lastVisitedAt && (
                  <span className="text-slate-600 ml-auto">{new Date(demoSite.lastVisitedAt).toLocaleDateString('es-ES')}</span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <a
                href={demoSite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/20 transition-all"
              >
                <ExternalLink className="w-3 h-3" /> Ver demo
              </a>
              <button
                onClick={() => copy(demoSite.url)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg hover:text-slate-200 transition-all"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadatos */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Información</h3>
        <div className="space-y-2.5 text-xs">
          {/* Score */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">Score</span>
              <span className={`font-bold ${scoreColor}`}>{score}/100</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${scoreBarColor}`} style={{ width: `${score}%` }} />
            </div>
          </div>

          {lead.source && (
            <div className="flex justify-between">
              <span className="text-slate-500">Fuente</span>
              <span className="text-slate-300 capitalize">
                {lead.source === 'google_maps' ? 'Google Maps' : lead.source}
              </span>
            </div>
          )}
          {lead.category && (
            <div className="flex justify-between">
              <span className="text-slate-500">Categoría</span>
              <span className="text-slate-300 truncate max-w-[140px] text-right">{lead.category}</span>
            </div>
          )}
          {lead.searchQuery && (
            <div className="flex justify-between">
              <span className="text-slate-500">Búsqueda</span>
              <span className="text-slate-300 truncate max-w-[140px] text-right">{lead.searchQuery}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Creado</span>
            <span className="text-slate-400">{new Date(lead.createdAt).toLocaleDateString('es-ES')}</span>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-600">ID</span>
            <div className="font-mono text-[10px] text-slate-600 mt-1 break-all">{lead._id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, disabled, color, spin }) {
  const colors = {
    cyan:   'hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5',
    green:  'hover:border-green-500/40 hover:text-green-400 hover:bg-green-500/5',
    yellow: 'hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/5',
    blue:   'hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5',
    purple: 'hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5',
    orange: 'hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5',
    teal:   'hover:border-teal-500/40 hover:text-teal-400 hover:bg-teal-500/5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 border border-slate-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${colors[color] || ''}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${spin ? 'animate-spin' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
