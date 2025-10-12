// src/app/admin/leads/[id]/components/LeadContactInfo.jsx - CORREGIDO
'use client';

import Link from 'next/link';

export default function LeadContactInfo({ lead }) {
  // ← FUNCIÓN HELPER PARA NORMALIZAR TELÉFONOS
  const getPhoneNumbers = () => {
    // Priorizar phoneNumbers (array) si existe
    if (lead.phoneNumbers && lead.phoneNumbers.length > 0) {
      return lead.phoneNumbers;
    }
    // Fallback a phone (singular)
    if (lead.phone) {
      return [lead.phone];
    }
    return [];
  };

  // ← FUNCIÓN HELPER PARA NORMALIZAR EMAILS
  const getEmails = () => {
    if (lead.possibleEmails && lead.possibleEmails.length > 0) {
      return lead.possibleEmails;
    }
    // Fallback a webAnalysis.emails si existen
    if (lead.webAnalysis?.emails && lead.webAnalysis.emails.length > 0) {
      return lead.webAnalysis.emails;
    }
    return [];
  };

  const phoneNumbers = getPhoneNumbers();
  const emails = getEmails();

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        📋 Información de Contacto
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emails */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Emails</div>
          {emails.length > 0 ? (
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white">{email}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(email)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs"
                    title="Copiar email"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No disponible</div>
          )}
        </div>
        
        {/* Teléfonos */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Teléfonos</div>
          {phoneNumbers.length > 0 ? (
            <div className="space-y-2">
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white">{phone}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(phone)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs"
                    title="Copiar teléfono"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No disponible</div>
          )}
        </div>
        
        {/* Redes Sociales */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Redes Sociales</div>
          {lead.socialMedia && Object.keys(lead.socialMedia).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(lead.socialMedia).map(([platform, url]) => (
                <Link
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                >
                  {platform}: {url}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No disponible</div>
          )}
        </div>
        
        {/* Ubicación */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Ubicación</div>
          <div className="text-white">
            {lead.location || lead.address || <span className="text-gray-500 italic">No disponible</span>}
          </div>
        </div>
      </div>
    </div>
  );
}