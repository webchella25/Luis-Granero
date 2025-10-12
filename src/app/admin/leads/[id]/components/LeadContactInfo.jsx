// src/app/admin/leads/[id]/components/LeadContactInfo.jsx
'use client';

import Link from 'next/link';

export default function LeadContactInfo({ lead }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">
        📋 Información de Contacto
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emails */}
        <div>
          <div className="text-gray-400 text-sm mb-2">Emails</div>
          {lead.possibleEmails?.length > 0 ? (
            <div className="space-y-2">
              {lead.possibleEmails.map((email, index) => (
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
          {lead.phoneNumbers?.length > 0 ? (
            <div className="space-y-2">
              {lead.phoneNumbers.map((phone, index) => (
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
            {lead.location || <span className="text-gray-500 italic">No disponible</span>}
          </div>
        </div>
      </div>
    </div>
  );
}