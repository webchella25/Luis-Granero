'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, MessageCircle, ExternalLink, Globe, Star, Copy } from 'lucide-react';

// Extrae ciudad del address
function extractCity(address) {
  if (!address) return '';
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 2].trim() : parts[0].trim();
}

// Normaliza teléfono español
function normalizePhone(phone) {
  const raw = phone || '';
  let clean = raw.replace(/\D/g, '');
  if (clean.startsWith('6') || clean.startsWith('7') || clean.startsWith('9')) {
    clean = '34' + clean;
  }
  return clean;
}

function buildTemplates(lead, demoSite, appUrl) {
  const firstName = lead.name?.split(' ')[0] || lead.name || '';
  const city = extractCity(lead.address);
  const cityTxt = city ? ` en ${city}` : '';
  const rating = lead.rating ? `${lead.rating}⭐` : '';
  const reviews = lead.reviewCount ? `${lead.reviewCount} reseñas` : '';
  const reviewLine = rating && reviews ? `${reviews} con ${rating}` : reviews || rating || '';
  const category = lead.category || 'tu negocio';
  const demoLink = demoSite?.url || `${appUrl}/contacto`;
  const hasWeb = !!lead.website;
  const hasGoodReviews = lead.reviewCount > 10;

  return [
    // 1 — Sin web + buenas reseñas (máxima conversión)
    {
      id: 'sin_web_reviews',
      label: hasGoodReviews ? '🔥 Sin web + reseñas' : '🌐 Sin web',
      badge: 'Recomendada',
      badgeColor: 'text-green-400 bg-green-500/10 border-green-500/30',
      show: !hasWeb || hasGoodReviews,
      text: `Hola ${firstName} 👋

Soy Luis, desarrollador web${city ? ` de Valencia` : ''}.

Encontré *${lead.name}* buscando ${category}${cityTxt}${reviewLine ? ` — ${reviewLine} es una pasada` : ''}, pero sin web propia perdéis clientes que buscan online antes de llamar.

He preparado una demo de cómo podría quedar vuestra web:
👉 ${demoLink}

¿Le echamos un vistazo rápido? Sin compromiso 🙌`
    },

    // 2 — Sin web, sector específico
    {
      id: 'sin_web_sector',
      label: '📍 Sin web, local',
      show: !hasWeb,
      text: `Hola ${firstName} 👋

Vi *${lead.name}* en Google Maps${cityTxt}. Tenéis muy buena pinta${reviewLine ? ` (${reviewLine})` : ''}, pero sin web os perdéis a los clientes que buscan "${category}${cityTxt}" en Google antes de decidirse.

Aquí una demo de lo que podría ser vuestra web en 48h:
👉 ${demoLink}

5 minutos de llamada y te lo explico, ¿cuándo te va bien? 📞`
    },

    // 3 — Web mejorable
    {
      id: 'web_mejorable',
      label: '⚡ Web mejorable',
      show: hasWeb,
      text: `Hola ${firstName} 👋

Soy Luis, desarrollador web. He analizado la web de *${lead.name}* y tiene algunos problemas técnicos (velocidad, SEO, adaptación móvil) que hacen que aparezcáis más abajo en Google.

He preparado un ejemplo de cómo podría quedar renovada:
👉 ${demoLink}

¿Te interesa que te cuente cómo podría mejorar? 🚀`
    },

    // 4 — Web abandonada
    {
      id: 'web_abandonada',
      label: '💤 Web desactualizada',
      show: hasWeb,
      text: `Hola ${firstName} 👋

Soy Luis, desarrollador web. He estado mirando la web de *${lead.name}* y lleva tiempo sin actualizarse. Una web desactualizada penaliza en Google y puede transmitir mala imagen a clientes nuevos.

He preparado una propuesta de renovación:
👉 ${demoLink}

¿Cuándo podemos hablar 5 minutos? Sin compromiso 📞`
    },

    // 5 — Seguimiento con demo
    {
      id: 'seguimiento_demo',
      label: '🔄 Seguimiento demo',
      show: !!demoSite,
      text: `Hola ${firstName} 👋

Te escribo de nuevo sobre *${lead.name}*.

¿Tuviste oportunidad de ver la demo web que te envié?
👉 ${demoLink}

Si tienes alguna duda o quieres ajustar algo, te lo explico en una llamada rápida 🙂

Un saludo,
Luis`
    },

    // 6 — Seguimiento simple
    {
      id: 'seguimiento',
      label: '🔄 Seguimiento',
      show: true,
      text: `Hola ${firstName} 👋

Soy Luis, te escribía hace unos días sobre *${lead.name}*.

¿Tuviste oportunidad de revisarlo? Cualquier pregunta que tengas, aquí estoy 🙌

Un saludo`
    },

    // 7 — Propuesta enviada
    {
      id: 'propuesta_enviada',
      label: '📄 Propuesta enviada',
      show: true,
      text: `Hola ${firstName} 👋

Acabo de enviarte al correo la propuesta para *${lead.name}*.

Incluye el presupuesto detallado y el plan de trabajo. Si tienes alguna duda, aquí estoy 🙌

¿Cuándo podemos hacer una llamada rápida para revisarla juntos? 📞

Luis`
    },

    // 8 — Personalizado
    {
      id: 'personalizado',
      label: '✏️ Personalizado',
      show: true,
      text: ''
    }
  ].filter(t => t.show !== false);
}

export default function WhatsAppModal({ lead, onClose, onSuccess, demoSite }) {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.luisgranero.com';

  const templates = buildTemplates(lead, demoSite, appUrl);
  const defaultTemplate = templates.find(t => t.badge) || templates[0];

  const [selectedId, setSelectedId] = useState(defaultTemplate?.id || templates[0]?.id);
  const [message, setMessage] = useState(defaultTemplate?.text || '');
  const [sending, setSending] = useState(false);

  const phone = normalizePhone(lead.phone || (lead.phoneNumbers && lead.phoneNumbers[0]) || '');

  const selectTemplate = (tmpl) => {
    setSelectedId(tmpl.id);
    setMessage(tmpl.text);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Mensaje copiado');
  };

  const handleSend = async () => {
    if (!phone) { toast.error('Sin teléfono disponible'); return; }
    if (!message.trim()) { toast.error('El mensaje está vacío'); return; }

    setSending(true);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

    try {
      await fetch(`/api/leads/${lead._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'whatsapp',
              channel: 'whatsapp',
              subject: `WhatsApp: ${templates.find(t => t.id === selectedId)?.label || selectedId}`,
              notes: message.substring(0, 300),
              outcome: 'follow_up'
            }
          },
          $set: {
            lastContactedAt: new Date(),
            status: lead.status === 'new' ? 'contacted' : lead.status
          }
        })
      });
      if (onSuccess) onSuccess();
    } catch {
      // silent
    } finally {
      setSending(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Enviar WhatsApp</h2>
              <p className="text-xs text-slate-500">{lead.name} · {phone ? `+${phone}` : 'Sin teléfono'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {demoSite && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Demo activa
              </span>
            )}
            {lead.rating > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> {lead.rating} · {lead.reviewCount} reseñas
              </span>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar de plantillas */}
          <div className="w-48 shrink-0 border-r border-slate-800 p-3 overflow-y-auto space-y-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider px-1 mb-2">Plantillas</p>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                  selectedId === t.id
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="block truncate">{t.label}</span>
                {t.badge && (
                  <span className={`text-[9px] px-1 py-0.5 rounded border mt-0.5 inline-block ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {demoSite && (
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/5 border border-orange-500/20 rounded-lg mb-3 text-xs">
                <Globe className="w-3 h-3 text-orange-400 shrink-0" />
                <a href={demoSite.url} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 truncate flex-1">
                  {demoSite.url}
                </a>
                <ExternalLink className="w-3 h-3 text-orange-400 shrink-0" />
              </div>
            )}

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={12}
              className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-green-500/50 focus:outline-none resize-none font-mono leading-relaxed"
              placeholder="Escribe o selecciona una plantilla..."
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-600">{message.length} caracteres</span>
              {!demoSite && (
                <span className="text-xs text-yellow-500/70">⚠ Genera la demo primero para incluir el link</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
          <button
            onClick={copyMessage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim() || !phone || sending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 rounded-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            {phone ? 'Abrir WhatsApp' : 'Sin teléfono'}
          </button>
        </div>
      </div>
    </div>
  );
}
