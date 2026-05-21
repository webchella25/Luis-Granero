'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { X, Mail, Eye, Code2, Send, AlertCircle } from 'lucide-react';

function replaceShortcodes(text, lead) {
  if (!text || !lead) return '';
  const firstName = lead.name?.split(' ')[0] || lead.name || '';
  const replacements = {
    '{{name}}': lead.name || '',
    '{{first_name}}': firstName,
    '{{email}}': lead.possibleEmails?.[0] || lead.email || '',
    '{{phone}}': lead.phone || lead.phoneNumbers?.[0] || '',
    '{{website}}': lead.website || 'tu sitio web',
    '{{company_name}}': lead.name || '',
    '{{current_date}}': new Date().toLocaleDateString('es-ES'),
    '{{admin_name}}': 'Luis Granero',
    '{{admin_email}}': 'luis@luisgranero.dev',
    '{{admin_phone}}': '+34 698 38 36 10',
    '{{demo_url}}': lead.demoSiteUrl || 'https://www.luisgranero.com/contacto',
    '{{category}}': lead.category || 'tu negocio',
    '{{rating}}': lead.rating ? `${lead.rating} estrellas` : '',
    '{{review_count}}': lead.reviewCount ? `${lead.reviewCount} reseñas` : '',
  };
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  return result;
}

export default function EmailModal({ lead, templates, onClose, onSuccess }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.templateId || null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [preview, setPreview] = useState(true); // true = HTML preview, false = source
  const [sending, setSending] = useState(false);

  const email = lead.possibleEmails?.[0] || lead.email || '';

  const selectTemplate = (tmpl) => {
    setSelectedId(tmpl.templateId);
    setSubject(replaceShortcodes(tmpl.subject, lead));
    setBodyHtml(replaceShortcodes(tmpl.body, lead));
  };

  // Auto-select first template on mount
  useMemo(() => {
    if (templates.length > 0 && !bodyHtml) {
      selectTemplate(templates[0]);
    }
  }, [templates]);

  const handleSend = async () => {
    if (!email) { toast.error('Sin email disponible'); return; }
    if (!subject.trim() || !bodyHtml.trim()) { toast.error('Asunto o cuerpo vacío'); return; }

    setSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject,
          html: bodyHtml,
          leadId: lead._id,
          templateId: selectedId
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email enviado');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Error: ' + (data.error || 'Fallo al enviar'));
      }
    } catch {
      toast.error('Error de red al enviar');
    } finally {
      setSending(false);
    }
  };

  const CATEGORY_COLORS = {
    prospecting: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    followup: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    proposal: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    closing: 'text-green-400 bg-green-500/10 border-green-500/30',
    default: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const getCategoryColor = (cat) =>
    CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Enviar Email</h2>
              <p className="text-xs text-slate-500">
                {lead.name}
                {email ? ` · ${email}` : ' · Sin email'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar plantillas */}
          <div className="w-52 shrink-0 border-r border-slate-800 p-3 overflow-y-auto space-y-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider px-1 mb-2">Plantillas</p>
            {templates.length === 0 && (
              <p className="text-xs text-slate-600 px-2">Sin plantillas cargadas</p>
            )}
            {templates.map((t) => (
              <button
                key={t.templateId}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-2.5 py-2.5 rounded-lg text-xs transition-all ${
                  selectedId === t.templateId
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="block font-medium truncate">{t.name}</span>
                {t.category && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border mt-1 inline-block ${getCategoryColor(t.category)}`}>
                    {t.category}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Editor + Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Asunto */}
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/60">
              <label className="text-[10px] text-slate-600 uppercase tracking-wider block mb-1">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none"
                placeholder="Asunto del email..."
              />
            </div>

            {/* Tabs preview/source */}
            <div className="flex items-center gap-1 px-4 pt-3 pb-1">
              <button
                onClick={() => setPreview(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                  preview ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Eye className="w-3 h-3" /> Preview
              </button>
              <button
                onClick={() => setPreview(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                  !preview ? 'bg-slate-700 text-slate-300 border border-slate-600' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Code2 className="w-3 h-3" /> HTML
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 px-4 pb-2 overflow-hidden">
              {preview ? (
                <iframe
                  srcDoc={bodyHtml || '<p style="color:#666;font-family:sans-serif;padding:20px">Selecciona una plantilla para ver el preview</p>'}
                  className="w-full h-full bg-white rounded-lg border border-slate-800"
                  sandbox="allow-same-origin"
                  title="Email preview"
                />
              ) : (
                <textarea
                  value={bodyHtml}
                  onChange={e => setBodyHtml(e.target.value)}
                  className="w-full h-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none resize-none font-mono leading-relaxed"
                  placeholder="HTML del email..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-3">
          {!email && (
            <div className="flex items-center gap-1.5 text-xs text-yellow-500/70">
              <AlertCircle className="w-3.5 h-3.5" />
              Sin email detectado para este lead
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!email || !subject.trim() || !bodyHtml.trim() || sending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Enviar Email'}
          </button>
        </div>
      </div>
    </div>
  );
}
