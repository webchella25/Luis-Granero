// src/app/api/leads/stats/route.js - NUEV
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      newLeads,
      contacted,
      interested,
      highOpportunity,
      recentLeads
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
      Lead.countDocuments({ status: 'contacted' }),
      Lead.countDocuments({ status: 'interested' }),
      Lead.countDocuments({ opportunityScore: { $gte: 70 } }),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt category')
        .lean()
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        new: newLeads,
        contacted,
        interested,
        highOpportunity
      },
      recentLeads
    });

  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
