// src/app/admin/leads/[id]/page.js - VERSIÓN REFACTORIZADA
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Componentes
import LeadHeader from './components/LeadHeader';
import LeadContactInfo from './components/LeadContactInfo';
import LeadWebAnalysis from './components/LeadWebAnalysis';
import LeadContactHistory from './components/LeadContactHistory';
import LeadActionsSidebar from './components/LeadActionsSidebar';
import LeadEnrichment from './components/LeadEnrichment';

// Modals
import EmailModal from './components/modals/EmailModal';
import WhatsAppModal from './components/modals/WhatsAppModal';
import NoteModal from './components/modals/NoteModal';
import EditLeadModal from './components/modals/EditLeadModal';
import EnrollSequenceModal from './components/modals/EnrollSequenceModal';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sequences, setSequences] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchLead();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteLead = async () => {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    try {
      const res = await fetch(`/api/leads/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/admin/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        <LeadHeader 
          lead={lead}
          onDelete={deleteLead}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-8">
            <LeadContactInfo lead={lead} />
            {lead.webAnalysis && <LeadWebAnalysis analysis={lead.webAnalysis} />}
            <LeadEnrichment lead={lead} onRefresh={fetchLead} />
            <LeadContactHistory history={lead.contactHistory} />
          </div>

          {/* Columna derecha */}
          <LeadActionsSidebar
            lead={lead}
            onStatusChange={updateStatus}
            onOpenEmail={() => setShowEmailModal(true)}
            onOpenWhatsApp={() => setShowWhatsAppModal(true)}
            onOpenNote={() => setShowNoteModal(true)}
            onOpenEdit={() => setShowEditModal(true)}
            onOpenEnroll={() => setShowEnrollModal(true)}
          />
        </div>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <EmailModal
          lead={lead}
          templates={templates}
          onClose={() => setShowEmailModal(false)}
          onSuccess={fetchLead}
        />
      )}

      {showWhatsAppModal && (
        <WhatsAppModal
          lead={lead}
          onClose={() => setShowWhatsAppModal(false)}
          onSuccess={fetchLead}
        />
      )}

      {showNoteModal && (
        <NoteModal
          leadId={params.id}
          onClose={() => setShowNoteModal(false)}
          onSuccess={fetchLead}
        />
      )}

      {showEditModal && (
        <EditLeadModal
          lead={lead}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchLead}
        />
      )}

      {showEnrollModal && (
        <EnrollSequenceModal
          lead={lead}
          sequences={sequences}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={fetchLead}
        />
      )}
    </div>
  );
}