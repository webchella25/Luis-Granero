// src/app/api/email-analytics/route.js
import { NextResponse } from 'next/response';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d'; // 7d, 30d, all
    
    await dbConnect();
    
    // Calcular fecha de inicio según el rango
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Desde el inicio
    }
    
    // Query base
    const baseQuery = {
      status: { $in: ['sent', 'delivered', 'opened', 'clicked'] },
      sentAt: { $gte: startDate }
    };
    
    // Obtener métricas principales
    const [totalSent, totalOpened, totalClicked, recentEmails] = await Promise.all([
      EmailLog.countDocuments(baseQuery),
      EmailLog.countDocuments({ ...baseQuery, opened: true }),
      EmailLog.countDocuments({ ...baseQuery, clicked: true }),
      EmailLog.find(baseQuery)
        .sort({ sentAt: -1 })
        .limit(20)
        .populate('leadId', 'name')
        .lean()
    ]);
    
    // Calcular tasas
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const clickToOpenRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;
    
    // Calcular engagement score
    const engagementScore = Math.min(
      Math.round((openRate * 0.6) + (clickRate * 0.4)),
      100
    );
    
    // Obtener estadísticas por día
    const dailyStats = await EmailLog.aggregate([
      {
        $match: baseQuery
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
          },
          sent: { $sum: 1 },
          opened: {
            $sum: { $cond: ['$opened', 1, 0] }
          },
          clicked: {
            $sum: { $cond: ['$clicked', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 30
      },
      {
        $project: {
          date: '$_id',
          sent: 1,
          opened: 1,
          clicked: 1,
          _id: 0
        }
      }
    ]);
    
    // Top performers (emails con más engagement)
    const topPerformers = await EmailLog.find(baseQuery)
      .sort({ openCount: -1, clickCount: -1 })
      .limit(5)
      .populate('leadId', 'name')
      .lean();
    
    // Tiempo promedio hasta apertura
    const avgTimeToOpen = await EmailLog.aggregate([
      {
        $match: {
          ...baseQuery,
          timeToOpen: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgSeconds: { $avg: '$timeToOpen' }
        }
      }
    ]);
    
    const analytics = {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      clickToOpenRate,
      engagementScore,
      dailyStats: dailyStats.reverse(), // Ordenar cronológicamente
      topPerformers,
      avgTimeToOpen: avgTimeToOpen[0]?.avgSeconds 
        ? Math.round(avgTimeToOpen[0].avgSeconds / 60) 
        : null // En minutos
    };
    
    return NextResponse.json({
      success: true,
      analytics,
      recentEmails: recentEmails.map(email => ({
        _id: email._id,
        emailTo: email.emailTo,
        subject: email.subject,
        status: email.status,
        sentAt: email.sentAt,
        openedAt: email.openedAt,
        clickedAt: email.clickedAt,
        opened: email.opened,
        clicked: email.clicked,
        openCount: email.openCount,
        clickCount: email.clickCount,
        leadName: email.leadId?.name
      }))
    });
    
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener analytics' },
      { status: 500 }
    );
  }
}
