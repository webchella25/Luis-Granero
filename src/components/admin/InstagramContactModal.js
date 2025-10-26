// src/components/admin/InstagramContactModal.js
'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function InstagramContactModal({ lead, isOpen, onClose, onSuccess }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate) {
      const message = personalizeMessage(selectedTemplate.message, lead);
      setPersonalizedMessage(message);
    }
  }, [selectedTemplate, lead]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates?activeOnly=true&targetSource=' + lead.source);
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  };

  const personalizeMessage = (message, lead) => {
    return message
      .replace(/{nombre}/g, lead.name || 'Hola')
      .replace(/{username}/g, lead.username || lead.name)
      .replace(/{categoria}/g, lead.category || 'tu negocio')
      .replace(/{ubicacion}/g, extractLocation(lead.bio || lead.address) || 'tu zona')
      .replace(/{followers}/g, formatNumber(lead.followers) || 'muchos')
      .replace(/{tu_nombre}/g, 'Luis Granero')
      .replace(/{tu_web}/g, 'luisgranero.com');
  };

  const extractLocation = (text) => {
    if (!text) return '';
    const locationRegex = /📍\s*([^\n]+)|🌍\s*([^\n]+)/;
    const match = text.match(locationRegex);
    return match ? (match[1] || match[2]).trim() : '';
  };

  const formatNumber = (num) => {
    if (!num) return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(personalizedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInstagram = () => {
    const username = lead.username?.replace('@', '') || lead.socialMedia?.instagram?.split('/').pop();
    if (username) {
      window.open(`https://www.instagram.com/${username}`, '_blank');
    }
  };

  const handleMarkAsSent = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/leads/${lead._id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'instagram_dm',
          channel: 'instagram',
          subject: selectedTemplate?.name || 'Mensaje Instagram',
          messageContent: personalizedMessage,
          templateId: selectedTemplate?._id,
          templateName: selectedTemplate?.name,
          notes: `Mensaje enviado usando plantilla: ${selectedTemplate?.name}`,
          outcome: 'follow_up'
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        alert('Error registrando contacto: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el contacto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              📸 Contactar por Instagram
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {lead.name} • @{lead.username?.replace('@', '')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Selector de plantilla */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Selecciona una plantilla:
            </label>
            {templates.length === 0 ? (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                ⚠️ No tienes plantillas creadas. <a href="/admin/templates" className="underline">Crear plantilla</a>
              </p>
            ) : (
              <select
                value={selectedTemplate?._id || ''}
                onChange={(e) => {
                  const template = templates.find(t => t._id === e.target.value);
                  setSelectedTemplate(template);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
              >
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vista previa del mensaje */}
          {selectedTemplate && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Vista previa personalizada:
              </label>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {personalizedMessage}
                </div>
              </div>

              {/* Variables usadas */}
              {selectedTemplate.availableVariables?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Variables usadas: {selectedTemplate.availableVariables.map(v => `{${v}}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info del lead */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Información del lead:
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lead.followers && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Seguidores:</span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    {formatNumber(lead.followers)}
                  </span>
                </div>
              )}
              {lead.category && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    {lead.category}
                  </span>
                </div>
              )}
              {lead.rating && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium">
                    ⭐ {lead.rating}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Acciones */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleCopyMessage}
            disabled={!selectedTemplate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5" />
                ¡Copiado!
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-5 h-5" />
                Copiar mensaje
              </>
            )}
          </button>

          <button
            onClick={handleOpenInstagram}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-colors"
          >
            📸 Abrir Instagram
          </button>
        </div>

        {/* Botón final */}
        <div className="px-6 py-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
            ¿Ya enviaste el mensaje en Instagram?
          </p>
          <button
            onClick={handleMarkAsSent}
            disabled={loading}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '⏳ Registrando...' : '✅ Sí, marcar como enviado'}
          </button>
        </div>
      </div>
    </div>
  );
}
