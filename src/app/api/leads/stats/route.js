// src/app/api/leads/stats/route.js - NUEV
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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