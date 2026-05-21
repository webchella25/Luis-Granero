// src/app/api/admin/pipeline/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

const PIPELINE_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export async function GET() {
  try {
    await dbConnect();

    const leads = await Lead.find({
      status: { $in: PIPELINE_STATUSES }
    })
      .select('name status category sector rating reviewCount phone email possibleEmails opportunityScore lastContactedAt lastInteraction lastInteractionType updatedAt createdAt address')
      .sort({ updatedAt: -1 })
      .lean();

    // Agrupar por estado
    const pipeline = {};
    for (const status of PIPELINE_STATUSES) {
      pipeline[status] = leads.filter(l => l.status === status);
    }

    // Stats por columna
    const stats = {};
    for (const status of PIPELINE_STATUSES) {
      const col = pipeline[status];
      stats[status] = {
        count: col.length,
        staleCount: col.filter(l => {
          const lastActivity = l.lastContactedAt || l.updatedAt || l.createdAt;
          const daysSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince > 7 && !['won', 'lost', 'new'].includes(status);
        }).length
      };
    }

    return NextResponse.json({ success: true, pipeline, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH — cambiar estado de un lead
export async function PATCH(request) {
  try {
    await dbConnect();

    const { leadId, newStatus } = await request.json();

    if (!leadId || !PIPELINE_STATUSES.includes(newStatus)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos' }, { status: 400 });
    }

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { $set: { status: newStatus, updatedAt: new Date() } },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: { _id: lead._id, status: lead.status } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
