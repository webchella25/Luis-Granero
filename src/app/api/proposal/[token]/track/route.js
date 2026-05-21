// src/app/api/proposal/[token]/track/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Proposal from '@/models/Proposal';
import Notification from '@/models/Notification';
import Lead from '@/models/Lead';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const proposal = await Proposal.findOne({ token: params.token, isActive: true });
    if (!proposal) return NextResponse.json({ success: false }, { status: 404 });

    const now = new Date();
    const newCount = proposal.visitCount + 1;

    await Proposal.findByIdAndUpdate(proposal._id, {
      $inc: { visitCount: 1 },
      $set: { lastVisitedAt: now }
    });

    if (proposal.leadId) {
      await Lead.findByIdAndUpdate(proposal.leadId, {
        $set: { lastInteraction: now, lastInteractionType: 'demo_visited' }
      });

      await Notification.create({
        leadId: proposal.leadId,
        leadName: proposal.businessName,
        type: 'demo_visited',
        title: `📄 ${proposal.businessName} vio tu propuesta`,
        message: `Ha visitado la propuesta ${newCount} vez${newCount > 1 ? 'es' : ''}. Momento ideal para llamar.`,
        metadata: { token: params.token, visitCount: newCount }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
