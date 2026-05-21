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
  const [demoSite, setDemoSite] = useState(null);

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
    fetchDemo();
  }, [params.id]);

  const fetchDemo = async () => {
    try {
      const res = await fetch(`/api/admin/leads/${params.id}/generate-demo`);
      const data = await res.json();
      if (data.success && data.demo) setDemoSite(data.demo);
    } catch {}
  };

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
      const res = await fetch('/api/templates?type=email');
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
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500 text-lg mb-4">Lead no encontrado</p>
        <Link href="/admin/leads" className="text-cyan-400 hover:text-cyan-300 text-sm">
          ← Volver a leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LeadHeader
        lead={lead}
        onDelete={deleteLead}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          <LeadContactInfo lead={lead} onRefresh={fetchLead} />
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
          demoSite={demoSite}
          onDemoGenerated={(demo) => setDemoSite(demo)}
        />
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
          demoSite={demoSite}
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