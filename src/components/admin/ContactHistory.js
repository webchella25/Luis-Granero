// src/components/admin/ContactHistory.js
'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const getChannelIcon = (channel) => {
  const icons = {
    instagram: '📸',
    email: '✉️',
    phone: '📞',
    whatsapp: '💬',
    in_person: '🤝',
    other: '📋'
  };
  return icons[channel] || '📋';
};

const getOutcomeColor = (outcome) => {
  const colors = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    interested: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    follow_up: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    no_response: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    not_interested: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  };
  return colors[outcome] || colors.other;
};

const getOutcomeLabel = (outcome) => {
  const labels = {
    success: 'Éxito',
    interested: 'Interesado',
    follow_up: 'Seguimiento',
    no_response: 'Sin respuesta',
    not_interested: 'No interesado',
    other: 'Otro'
  };
  return labels[outcome] || outcome;
};

export default function ContactHistory({ leadId, contacts = [], onUpdate }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          📭 Aún no hay contactos registrados con este lead
        </p>
      </div>
    );
  }

  // Ordenar por fecha (más recientes primero)
  const sortedContacts = [...contacts].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        📜 Historial de contactos ({contacts.length})
      </h3>

      <div className="space-y-3">
        {sortedContacts.map((contact, index) => (
          <div 
            key={contact._id || index}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getChannelIcon(contact.channel)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {contact.subject || 'Contacto'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(contact.date), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOutcomeColor(contact.outcome)}`}>
                {getOutcomeLabel(contact.outcome)}
              </span>
            </div>

            {contact.templateName && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium">
                  📝 Plantilla: {contact.templateName}
                </span>
              </div>
            )}

            {contact.messageContent && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 mb-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                  {contact.messageContent}
                </p>
              </div>
            )}

            {contact.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                💬 {contact.notes}
              </p>
            )}

            {contact.responded && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    ✅ Respondió
                  </span>
                  {contact.responseDate && (
                    <span className="text-gray-500 dark:text-gray-400">
                      • {formatDistanceToNow(new Date(contact.responseDate), { addSuffix: true, locale: es })}
                    </span>
                  )}
                </div>
                {contact.responseContent && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                    "{contact.responseContent}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
