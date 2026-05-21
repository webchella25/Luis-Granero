// src/app/api/admin/sales-stats/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import EmailLog from '@/models/EmailLog';
import Appointment from '@/models/Appointment';
import DemoSite from '@/models/DemoSite';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await dbConnect();

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);

    // --- PIPELINE STATS ---
    const pipelineAgg = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const pipeline = {};
    pipelineAgg.forEach(p => { pipeline[p._id] = p.count; });

    const totalLeads = Object.values(pipeline).reduce((a, b) => a + b, 0);
    const wonLeads = pipeline.won || 0;
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    // --- EMAIL STATS (últimos 30 días) ---
    const emailStats = await EmailLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          opened: { $sum: { $cond: ['$opened', 1, 0] } },
          clicked: { $sum: { $cond: ['$clicked', 1, 0] } }
        }
      }
    ]);

    const email = emailStats[0] || { total: 0, sent: 0, opened: 0, clicked: 0 };
    const openRate = email.sent > 0 ? ((email.opened / email.sent) * 100).toFixed(1) : 0;
    const clickRate = email.opened > 0 ? ((email.clicked / email.opened) * 100).toFixed(1) : 0;

    // --- DEMO STATS ---
    const demoStats = await DemoSite.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withVisits: { $sum: { $cond: [{ $gt: ['$visitCount', 0] }, 1, 0] } },
          totalVisits: { $sum: '$visitCount' }
        }
      }
    ]);
    const demos = demoStats[0] || { total: 0, withVisits: 0, totalVisits: 0 };
    const demoConversionRate = demos.total > 0 ? ((demos.withVisits / demos.total) * 100).toFixed(1) : 0;

    // --- APPOINTMENTS STATS ---
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    const appointments = {};
    appointmentStats.forEach(a => { appointments[a._id] = a.count; });

    const totalAppointments = Object.values(appointments).reduce((a, b) => a + b, 0);
    const completedAppointments = appointments.completed || 0;
    const appointmentToClose = completedAppointments > 0 && wonLeads > 0
      ? ((wonLeads / completedAppointments) * 100).toFixed(1) : 0;

    // --- POR SECTOR ---
    const sectorAgg = await Lead.aggregate([
      { $match: { sector: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$sector',
          total: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          avgScore: { $avg: '$opportunityScore' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // --- LEADS POR MES (últimos 6 meses) ---
    const sixMonthsAgo = new Date(now - 180 * 24 * 60 * 60 * 1000);
    const leadsPerMonth = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // --- SOURCE STATS ---
    const sourceAgg = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 }, won: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    // --- LEADS RECIENTES (30 días) ---
    const recentLeads = await Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const recentContacted = await Lead.countDocuments({
      lastContactedAt: { $gte: thirtyDaysAgo }
    });

    return NextResponse.json({
      success: true,
      stats: {
        pipeline,
        totalLeads,
        wonLeads,
        conversionRate: parseFloat(conversionRate),
        email: {
          ...email,
          openRate: parseFloat(openRate),
          clickRate: parseFloat(clickRate)
        },
        demos: {
          ...demos,
          conversionRate: parseFloat(demoConversionRate)
        },
        appointments: {
          ...appointments,
          total: totalAppointments,
          completed: completedAppointments,
          closeRate: parseFloat(appointmentToClose)
        },
        sectors: sectorAgg,
        leadsPerMonth,
        sources: sourceAgg,
        activity: {
          recentLeads,
          recentContacted
        }
      }
    });

  } catch (error) {
    console.error('Error stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
