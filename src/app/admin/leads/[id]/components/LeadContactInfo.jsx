'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeadContactInfo({ lead, onRefresh }) {
  const phones = lead.phoneNumbers?.length ? lead.phoneNumbers : lead.phone ? [lead.phone] : [];
  const emails = lead.possibleEmails?.length ? lead.possibleEmails :
                 lead.webAnalysis?.emails?.length ? lead.webAnalysis.emails : [];

  const [removingPlatform, setRemovingPlatform] = useState(null);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado');
  };

  const removeSocialMedia = async (platform) => {
    if (!confirm(`¿Eliminar la URL de ${platform} y marcarla como no encontrada?`)) return;
    setRemovingPlatform(platform);
    try {
      const res = await fetch(`/api/leads/${lead._id}/social-media?platform=${platform}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`${platform} eliminado`);
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setRemovingPlatform(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Información de Contacto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Emails */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <Mail className="w-3.5 h-3.5" /> Emails
          </div>
          {emails.length > 0 ? (
            <div className="space-y-1.5">
              {emails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm">{email}</span>
                  <button onClick={() => copy(email)} className="text-slate-600 hover:text-cyan-400 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-600 text-sm italic">No disponible</span>
          )}
        </div>

        {/* Teléfonos */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <Phone className="w-3.5 h-3.5" /> Teléfonos
          </div>
          {phones.length > 0 ? (
            <div className="space-y-1.5">
              {phones.map((phone, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm">{phone}</span>
                  <button onClick={() => copy(phone)} className="text-slate-600 hover:text-cyan-400 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-slate-600 text-sm italic">No disponible</span>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
            <MapPin className="w-3.5 h-3.5" /> Ubicación
          </div>
          <span className="text-slate-300 text-sm">
            {lead.location || lead.address || <span className="text-slate-600 italic">No disponible</span>}
          </span>
        </div>

        {/* Redes sociales */}
        {lead.socialMedia && Object.keys(lead.socialMedia).filter(k => lead.socialMedia[k]).length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
              <Globe className="w-3.5 h-3.5" /> Redes Sociales
            </div>
            <div className="space-y-1.5">
              {Object.entries(lead.socialMedia)
                .filter(([, url]) => url)
                .map(([platform, url]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Link
                      href={String(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-400/70 hover:text-cyan-400 text-xs transition-colors"
                    >
                      <span className="capitalize">{platform}</span>
                    </Link>
                    <button
                      onClick={() => removeSocialMedia(platform)}
                      disabled={removingPlatform === platform}
                      title="Eliminar URL incorrecta"
                      className="text-slate-700 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {removingPlatform === platform
                        ? <span className="text-[10px] text-slate-500">...</span>
                        : <Trash2 className="w-3 h-3" />
                      }
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating si tiene */}
      {(lead.rating || lead.reviewCount) && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4 text-sm">
          {lead.rating && (
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">★</span>
              <span className="text-slate-300 font-semibold">{lead.rating.toFixed(1)}</span>
            </div>
          )}
          {lead.reviewCount && (
            <span className="text-slate-500">{lead.reviewCount} reseñas</span>
          )}
        </div>
      )}
    </div>
  );
}
