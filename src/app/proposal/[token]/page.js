// src/app/proposal/[token]/page.js — Propuesta pública
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import Lead from '@/models/Lead';
import { generateProposalHtml } from '@/lib/proposal-generator/index';
import ProposalTracker from './ProposalTracker';

export async function generateMetadata({ params }) {
  try {
    await dbConnect();
    const proposal = await Proposal.findOne({ token: params.token, isActive: true });
    if (!proposal) return { title: 'Propuesta no encontrada' };
    return {
      title: `Propuesta web para ${proposal.businessName} — Luis Granero`,
      description: 'Propuesta personalizada de desarrollo web',
      robots: 'noindex,nofollow'
    };
  } catch {
    return { title: 'Propuesta' };
  }
}

export default async function ProposalPage({ params }) {
  await dbConnect();

  const proposal = await Proposal.findOne({
    token: params.token,
    isActive: true
  });

  if (!proposal) notFound();

  const lead = await Lead.findById(proposal.leadId).lean();
  if (!lead) notFound();

  const html = generateProposalHtml(lead, {
    price: proposal.price,
    deliveryDays: proposal.deliveryDays
  });

  return (
    <>
      <ProposalTracker token={params.token} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
