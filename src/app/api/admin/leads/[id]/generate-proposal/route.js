// src/app/api/admin/leads/[id]/generate-proposal/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import { generateProposalToken } from '@/lib/proposal-generator/index';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const lead = await Lead.findById(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { price, deliveryDays } = body;

    // Desactivar propuestas anteriores
    await Proposal.updateMany({ leadId: lead._id }, { $set: { isActive: false } });

    const token = generateProposalToken();

    const proposal = await Proposal.create({
      leadId: lead._id,
      token,
      businessName: lead.name,
      price: price || '1.500€ – 3.000€',
      deliveryDays: deliveryDays || 21
    });

    // Guardar token en el lead
    await Lead.findByIdAndUpdate(lead._id, { $set: { proposalToken: token } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.luisgranero.com';
    const proposalUrl = `${appUrl}/proposal/${token}`;

    return NextResponse.json({
      success: true,
      proposal: {
        token,
        url: proposalUrl,
        price: proposal.price,
        deliveryDays: proposal.deliveryDays,
        expiresAt: proposal.expiresAt
      }
    });

  } catch (error) {
    console.error('Error generando propuesta:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
