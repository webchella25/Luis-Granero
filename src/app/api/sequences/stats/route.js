// src/app/api/sequences/stats/route.js - NUEVO
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Sequence from '@/models/Sequence';
import EmailLog from '@/models/EmailLog';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [
      totalSequences,
      activeSequences,
      emailsSent,
      emailsOpened
    ] = await Promise.all([
      Sequence.countDocuments(),
      Sequence.countDocuments({ isActive: true }),
      EmailLog.countDocuments({ status: 'sent' }),
      EmailLog.countDocuments({ opened: true })
    ]);

    const openRate = emailsSent > 0 
      ? Math.round((emailsOpened / emailsSent) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total: totalSequences,
        active: activeSequences,
        emailsSent,
        openRate
      }
    });

  } catch (error) {
    console.error('Error fetching sequence stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}