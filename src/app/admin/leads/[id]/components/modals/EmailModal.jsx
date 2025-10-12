// src/app/admin/leads/[id]/components/modals/EmailModal.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function EmailModal({ lead, templates, onClose, onSuccess }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailPreview, setEmailPreview] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  const replaceShortcodes = (text) => {
    if (!text || !lead) return '';
    
    const now = new Date();
    const replacements = {
      '{{name}}': lead.name || '',
      '{{first_name}}': lead.name?.split(' ')[0] || '',
      '{{email}}': lead.possibleEmails?.[0] || '',
      '{{phone}}': lead.phoneNumbers?.[0] || '',
      '{{website}}': lead.website || 'tu sitio web',
      '{{company_name}}': lead.companyName || lead.name || '',
      '{{current_date}}': now.toLocaleDateString('es-ES'),
      '{{admin_name}}': 'Luis Granero',
      '{{admin_email}}': 'luis@luisgranero.dev',
      '{{admin_phone}}': '+34 698383610'
    };
    
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    
    return result;
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEmailPreview({
      subject: replaceShortcodes(template.subject),
      body: replaceShortcodes(template.body)
    });
  };

  const sendEmail = async () => {
    if (!selectedTemplate || !lead.possibleEmails?.[0]) {
      alert('No hay email disponible para este lead');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: lead.possibleEmails[0],
          subject: emailPreview.subject,
          html: emailPreview.body,
          leadId: lead._id,
          templateId: selectedTemplate.templateId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('✅ Email enviado correctamente');
        onSuccess();
        onClose();
      } else {
        alert('❌ Error al enviar email: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Error al enviar email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-lg p-8 max-w-4xl w-full border border-cyan-500/30 my-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          📧 Enviar Email a {lead.name}
        </h2>
        
        {/* Selector de template */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-3 font-semibold">
            Selecciona un template:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.templateId}
                onClick={() => handleTemplateSelect(template)}
                className={`text-left p-4 rounded-lg border-2 transition ${
                  selectedTemplate?.templateId === template.templateId
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="font-semibold text-white mb-1">
                  {template.name}
                </div>
                <div className="text-sm text-gray-400">
                  {template.category}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview del email */}
        {selectedTemplate && (
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-semibold">
              Preview:
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Asunto:</div>
                <div className="text-white font-semibold">
                  {emailPreview.subject}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Mensaje:</div>
                <div 
                  className="text-white prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailPreview.body }}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={sendEmail}
            disabled={!selectedTemplate || sending}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            {sending ? 'Enviando...' : '✉️ Enviar Email'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}