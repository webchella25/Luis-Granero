// src/app/admin/leads/[id]/page.js - ARCHIVO COMPLETO CON MEJORAS
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [sequences, setSequences] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailPreview, setEmailPreview] = useState({ subject: '', body: '' });
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchLead();
    fetchTemplates();
    fetchSequences();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setLead(data.lead);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchSequences = async () => {
    try {
      const res = await fetch('/api/sequences');
      const data = await res.json();
      if (data.success) {
        setSequences(data.sequences.filter(s => s.isActive));
      }
    } catch (error) {
      console.error('Error fetching sequences:', error);
    }
  };

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
      '{{admin_phone}}': '+34 XXX XXX XXX'
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
          leadId: params.id,
          templateId: selectedTemplate.templateId
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert('✅ Email enviado correctamente');
        setShowEmailModal(false);
        setSelectedTemplate(null);
        fetchLead(); // Refresh para ver el historial actualizado
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

  const sendWhatsApp = () => {
    if (!lead.phoneNumbers?.[0]) {
      alert('No hay teléfono disponible para este lead');
      return;
    }

    const phone = lead.phoneNumbers[0].replace(/\D/g, '');
    const message = replaceShortcodes(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Registrar en el historial
    addContactHistory('whatsapp', message);
    setShowWhatsAppModal(false);
    setWhatsappMessage('');
  };

  const addNote = async () => {
    if (!note.trim()) return;

    try {
      await addContactHistory('note', note);
      setShowNoteModal(false);
      setNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const addContactHistory = async (type, notes) => {
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          $push: {
            contactHistory: {
              date: new Date(),
              type,
              notes
            }
          }
        })
      });

      if (res.ok) {
        fetchLead();
      }
    } catch (error) {
      console.error('Error adding contact history:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchLead();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteLead = async () => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;

    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/admin/leads');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const enrollInSequence = async (sequenceId) => {
    try {
      const res = await fetch(`/api/sequences/${sequenceId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: params.id })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ ' + data.message);
        setShowEnrollModal(false);
        fetchLead();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('Error enrolling in sequence:', error);
      alert('❌ Error al inscribir en la secuencia');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Cargando lead...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-white text-2xl mb-4">Lead no encontrado</div>
          <Link href="/admin/leads" className="text-cyan-400 hover:text-cyan-300">
            ← Volver a leads
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500',
      contacted: 'bg-yellow-500',
      interested: 'bg-green-500',
      qualified: 'bg-purple-500',
      proposal: 'bg-orange-500',
      negotiation: 'bg-pink-500',
      won: 'bg-emerald-500',
      lost: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nuevo',
      contacted: 'Contactado',
      interested: 'Interesado',
      qualified: 'Cualificado',
      proposal: 'Propuesta',
      negotiation: 'Negociación',
      won: 'Ganado',
      lost: 'Perdido'
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin/leads"
              className="text-cyan-400 hover:text-cyan-300 mb-2 inline-block"
            >
              ← Volver a leads
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              {lead.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(lead.status)} text-white`}>
                {getStatusLabel(lead.status)}
              </span>
              {lead.website && (
                <a 
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  🔗 {lead.website}
                </a>
              )}
            </div>
          </div>
          
          <button
            onClick={deleteLead}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            🗑️ Eliminar Lead
          </button>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Info del lead */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Información de contacto */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                📋 Información de Contacto
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div>
                  <div className="text-gray-400 text-sm mb-2">Redes Sociales</div>
                  {lead.socialMedia && Object.keys(lead.socialMedia).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(lead.socialMedia).map(([platform, url]) => (
                        
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                        >
                          {platform}: {url}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No disponible</div>
                  )}
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm mb-2">Ubicación</div>
                  <div className="text-white">
                    {lead.location || <span className="text-gray-500 italic">No disponible</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Análisis Web */}
            {lead.webAnalysis && (
              <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  🔍 Análisis Web
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Velocidad de carga</div>
                    <div className={`text-2xl font-bold ${
                      lead.webAnalysis.loadTime > 3000 ? 'text-red-400' :
                      lead.webAnalysis.loadTime > 1500 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {lead.webAnalysis.loadTime}ms
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm mb-2">SSL/HTTPS</div>
                    <div className={`text-2xl font-bold ${
                      lead.webAnalysis.hasSSL ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lead.webAnalysis.hasSSL ? '✅ Sí' : '❌ No'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm mb-2">Responsive</div>
                    <div className={`text-2xl font-bold ${
                      lead.webAnalysis.isResponsive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {lead.webAnalysis.isResponsive ? '✅ Sí' : '❌ No'}
                    </div>
                  </div>
                </div>
                
                {lead.webAnalysis.technologies?.length > 0 && (
                  <div className="mt-6">
                    <div className="text-gray-400 text-sm mb-3">Tecnologías detectadas</div>
                    <div className="flex flex-wrap gap-2">
                      {lead.webAnalysis.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lead.webAnalysis.issues?.length > 0 && (
                  <div className="mt-6">
                    <div className="text-gray-400 text-sm mb-3">Problemas detectados</div>
                    <div className="space-y-2">
                      {lead.webAnalysis.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                        >
                          ⚠️ {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historial de contacto */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                📞 Historial de Contacto
              </h2>
              
              {lead.contactHistory?.length > 0 ? (
                <div className="space-y-4">
                  {lead.contactHistory
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((contact, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/50">
                          {contact.type === 'email' && '📧'}
                          {contact.type === 'whatsapp' && '💬'}
                          {contact.type === 'call' && '📞'}
                          {contact.type === 'note' && '📝'}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold capitalize">
                              {contact.type}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {new Date(contact.date).toLocaleString('es-ES')}
                            </span>
                          </div>
                          
                          {contact.subject && (
                            <div className="text-cyan-400 text-sm mb-1">
                              {contact.subject}
                            </div>
                          )}
                          
                          {contact.notes && (
                            <div className="text-gray-300 text-sm">
                              {contact.notes}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📭</div>
                  <div className="text-gray-400">
                    No hay historial de contacto todavía
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Acciones */}
          <div className="space-y-6">
            
            {/* Cambiar estado */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🎯 Cambiar Estado
              </h3>
              
              <div className="space-y-2">
                {['new', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition text-left ${
                      lead.status === status
                        ? `${getStatusColor(status)} text-white`
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                ⚡ Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowEmailModal(true)}
                  disabled={!lead.possibleEmails?.[0]}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition shadow-lg shadow-cyan-500/50"
                >
                  📧 Enviar Email
                </button>
                
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  disabled={!lead.phoneNumbers?.[0]}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition shadow-lg shadow-green-500/50"
                >
                  💬 WhatsApp
                </button>
                
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition shadow-lg shadow-yellow-500/50"
                >
                  📝 Añadir Nota
                </button>
                
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition shadow-lg shadow-purple-500/50"
                >
                  🚀 Iniciar Secuencia
                </button>
              </div>
            </div>

            {/* Metadatos */}
            <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                ℹ️ Información
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Creado</div>
                  <div className="text-white">
                    {new Date(lead.createdAt).toLocaleString('es-ES')}
                  </div>
                </div>
                
                {lead.source && (
                  <div>
                    <div className="text-gray-400 mb-1">Fuente</div>
                    <div className="text-white">{lead.source}</div>
                  </div>
                )}
                
                {lead.campaign && (
                  <div>
                    <div className="text-gray-400 mb-1">Campaña</div>
                    <div className="text-white">{lead.campaign}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-gray-400 mb-1">ID</div>
                  <div className="text-white font-mono text-xs">{lead._id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Enviar Email */}
      {showEmailModal && (
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
                onClick={() => {
                  setShowEmailModal(false);
                  setSelectedTemplate(null);
                }}
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
      )}

      {/* Modal WhatsApp */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              💬 Mensaje de WhatsApp
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Mensaje para {lead.name}:
              </label>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none h-32"
                placeholder="Escribe tu mensaje aquí..."
              />
              <div className="text-xs text-gray-400 mt-2">
                💡 Puedes usar: {'{{'}}name{'}}'}, {'{{'}}first_name{'}}'}, {'{{'}}website{'}}'}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappMessage('');
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={sendWhatsApp}
                disabled={!whatsappMessage.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold transition"
              >
                Enviar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Añadir Nota */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              📝 Añadir Nota
            </h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Nota:
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none h-32"
                placeholder="Escribe tu nota aquí..."
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNote('');
                }}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={addNote}
                disabled={!note.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold transition"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Inscribir en Secuencia */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-lg p-8 max-w-md w-full border border-cyan-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              🚀 Inscribir en Secuencia
            </h2>
            
            <p className="text-gray-400 mb-6">
              Selecciona la secuencia de emails automáticos para <strong className="text-white">{lead.name}</strong>
            </p>
            
            {sequences.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No hay secuencias activas</p>
                <Link
                  href="/admin/sequences"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Crear una secuencia →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {sequences.map((sequence) => (
                  <button
                    key={sequence._id}
                    onClick={() => enrollInSequence(sequence._id)}
                    className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500/50 rounded-lg transition"
                  >
                    <div className="font-semibold text-white mb-1">
                      {sequence.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {sequence.steps?.length || 0} emails • {sequence.stats?.totalActive || 0} activos
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowEnrollModal(false)}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}