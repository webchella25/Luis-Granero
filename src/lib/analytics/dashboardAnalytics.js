// src/lib/analytics/dashboardAnalytics.js
import Lead from '@/models/Lead';
import { connectDB } from '@/lib/mongodb';

/**
 * DASHBOARD ANALYTICS
 * Analytics completo para el admin panel del CRM
 */

/**
 * Obtener estadísticas generales del CRM
 */
export async function getGeneralStats() {
  await connectDB();

  const stats = {
    // Totales
    totalLeads: 0,
    newLeads: 0, // Últimos 7 días
    activeLeads: 0, // Status != lost, won

    // Por estado
    byStatus: {},

    // Por fuente
    bySource: {},

    // Opportunity scores
    highOpportunity: 0, // Score >= 70
    mediumOpportunity: 0, // Score 40-69
    lowOpportunity: 0, // Score < 40

    // Contacto
    contacted: 0,
    notContacted: 0,

    // Emails
    withEmail: 0,
    withoutEmail: 0,

    // Website
    withWebsite: 0,
    withoutWebsite: 0,

    // Tiempo
    avgResponseTime: null,
    lastUpdate: null
  };

  try {
    // Total de leads
    stats.totalLeads = await Lead.countDocuments();

    // Leads nuevos (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    stats.newLeads = await Lead.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Leads activos
    stats.activeLeads = await Lead.countDocuments({
      status: { $nin: ['lost', 'won'] }
    });

    // Por status
    const statusAgg = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    statusAgg.forEach(item => {
      stats.byStatus[item._id] = item.count;
    });

    // Por fuente
    const sourceAgg = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    sourceAgg.forEach(item => {
      stats.bySource[item._id] = item.count;
    });

    // Opportunity scores
    stats.highOpportunity = await Lead.countDocuments({
      opportunityScore: { $gte: 70 }
    });

    stats.mediumOpportunity = await Lead.countDocuments({
      opportunityScore: { $gte: 40, $lt: 70 }
    });

    stats.lowOpportunity = await Lead.countDocuments({
      opportunityScore: { $lt: 40 }
    });

    // Contactados vs no contactados
    stats.contacted = await Lead.countDocuments({
      lastContactedAt: { $exists: true, $ne: null }
    });

    stats.notContacted = stats.totalLeads - stats.contacted;

    // Con/sin email
    stats.withEmail = await Lead.countDocuments({
      $or: [
        { email: { $exists: true, $ne: null } },
        { possibleEmails: { $exists: true, $ne: [] } }
      ]
    });

    stats.withoutEmail = stats.totalLeads - stats.withEmail;

    // Con/sin website
    stats.withWebsite = await Lead.countDocuments({
      website: { $exists: true, $ne: null, $ne: '' }
    });

    stats.withoutWebsite = stats.totalLeads - stats.withWebsite;

    // Última actualización
    const lastLead = await Lead.findOne().sort({ updatedAt: -1 });
    stats.lastUpdate = lastLead?.updatedAt || null;

    return stats;

  } catch (error) {
    console.error('Error obteniendo stats generales:', error);
    return stats;
  }
}

/**
 * Obtener tendencias en el tiempo
 */
export async function getTimeTrends(days = 30) {
  await connectDB();

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Leads por día
    const dailyLeads = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Conversiones por día (status = won)
    const dailyConversions = await Lead.aggregate([
      {
        $match: {
          status: 'won',
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return {
      period: `${days} días`,
      dailyLeads: dailyLeads.map(d => ({
        date: d._id,
        count: d.count
      })),
      dailyConversions: dailyConversions.map(d => ({
        date: d._id,
        count: d.count
      }))
    };

  } catch (error) {
    console.error('Error obteniendo tendencias:', error);
    return { dailyLeads: [], dailyConversions: [] };
  }
}

/**
 * Análisis de fuentes de leads
 */
export async function getSourceAnalysis() {
  await connectDB();

  try {
    const analysis = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          avgOpportunityScore: { $avg: '$opportunityScore' },
          contacted: {
            $sum: {
              $cond: [{ $ne: ['$lastContactedAt', null] }, 1, 0]
            }
          },
          converted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'won'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          contactRate: {
            $multiply: [{ $divide: ['$contacted', '$count'] }, 100]
          },
          conversionRate: {
            $multiply: [{ $divide: ['$converted', '$count'] }, 100]
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return analysis.map(source => ({
      source: source._id,
      totalLeads: source.count,
      avgOpportunityScore: Math.round(source.avgOpportunityScore || 0),
      contacted: source.contacted,
      contactRate: source.contactRate.toFixed(1) + '%',
      converted: source.converted,
      conversionRate: source.conversionRate.toFixed(1) + '%'
    }));

  } catch (error) {
    console.error('Error analizando fuentes:', error);
    return [];
  }
}

/**
 * Top leads por opportunity score
 */
export async function getTopOpportunities(limit = 10) {
  await connectDB();

  try {
    const topLeads = await Lead.find({
      status: { $in: ['new', 'contacted', 'qualified'] }
    })
      .sort({ opportunityScore: -1 })
      .limit(limit)
      .select('name opportunityScore source website category status createdAt')
      .lean();

    return topLeads;

  } catch (error) {
    console.error('Error obteniendo top opportunities:', error);
    return [];
  }
}

/**
 * Leads que requieren seguimiento
 */
export async function getLeadsNeedingFollowUp() {
  await connectDB();

  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Leads contactados hace más de 7 días sin respuesta
    const needFollowUp = await Lead.find({
      status: { $in: ['contacted', 'qualified', 'proposal'] },
      lastContactedAt: { $lte: sevenDaysAgo }
    })
      .sort({ lastContactedAt: 1 })
      .limit(20)
      .select('name status lastContactedAt opportunityScore source')
      .lean();

    return needFollowUp.map(lead => ({
      ...lead,
      daysSinceContact: Math.floor((now - lead.lastContactedAt) / (1000 * 60 * 60 * 24))
    }));

  } catch (error) {
    console.error('Error obteniendo leads para seguimiento:', error);
    return [];
  }
}

/**
 * Análisis de conversión por categoría
 */
export async function getCategoryPerformance() {
  await connectDB();

  try {
    const performance = await Lead.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          won: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
          },
          avgOpportunityScore: { $avg: '$opportunityScore' }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $multiply: [{ $divide: ['$won', '$total'] }, 100]
          }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 15
      }
    ]);

    return performance.map(cat => ({
      category: cat._id,
      totalLeads: cat.total,
      converted: cat.won,
      conversionRate: cat.conversionRate.toFixed(1) + '%',
      avgOpportunityScore: Math.round(cat.avgOpportunityScore || 0)
    }));

  } catch (error) {
    console.error('Error analizando categorías:', error);
    return [];
  }
}

/**
 * Análisis de actividad de contacto
 */
export async function getContactActivity() {
  await connectDB();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Contactos por tipo
    const byType = await Lead.aggregate([
      {
        $match: {
          'contactHistory': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$contactHistory'
      },
      {
        $match: {
          'contactHistory.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$contactHistory.type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Contactos por canal
    const byChannel = await Lead.aggregate([
      {
        $match: {
          'contactHistory': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$contactHistory'
      },
      {
        $match: {
          'contactHistory.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$contactHistory.channel',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Tasa de respuesta
    const responseRate = await Lead.aggregate([
      {
        $match: {
          'contactHistory': { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$contactHistory'
      },
      {
        $match: {
          'contactHistory.date': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          responded: {
            $sum: { $cond: ['$contactHistory.responded', 1, 0] }
          }
        }
      }
    ]);

    const responseData = responseRate[0] || { total: 0, responded: 0 };

    return {
      period: '30 días',
      byType: byType.map(t => ({ type: t._id, count: t.count })),
      byChannel: byChannel.map(c => ({ channel: c._id, count: c.count })),
      totalContacts: responseData.total,
      responsesReceived: responseData.responded,
      responseRate: responseData.total > 0
        ? ((responseData.responded / responseData.total) * 100).toFixed(1) + '%'
        : '0%'
    };

  } catch (error) {
    console.error('Error analizando actividad de contacto:', error);
    return {
      byType: [],
      byChannel: [],
      responseRate: '0%'
    };
  }
}

/**
 * Dashboard completo
 */
export async function getCompleteDashboard() {
  console.log('\n📊 Generando dashboard completo...');

  try {
    const [
      generalStats,
      trends,
      sourceAnalysis,
      topOpportunities,
      followUps,
      categoryPerformance,
      contactActivity
    ] = await Promise.all([
      getGeneralStats(),
      getTimeTrends(30),
      getSourceAnalysis(),
      getTopOpportunities(10),
      getLeadsNeedingFollowUp(),
      getCategoryPerformance(),
      getContactActivity()
    ]);

    const dashboard = {
      generatedAt: new Date(),
      general: generalStats,
      trends,
      sources: sourceAnalysis,
      topOpportunities,
      followUps,
      categories: categoryPerformance,
      contactActivity
    };

    console.log('✅ Dashboard generado exitosamente');

    return dashboard;

  } catch (error) {
    console.error('❌ Error generando dashboard:', error);
    throw error;
  }
}

/**
 * KPIs clave para vista rápida
 */
export async function getKeyKPIs() {
  await connectDB();

  try {
    const stats = await getGeneralStats();

    const kpis = {
      // Lead generation rate (últimos 7 días vs 7 días anteriores)
      leadGrowth: null,

      // Conversion rate (won / total)
      conversionRate: stats.byStatus.won
        ? ((stats.byStatus.won / stats.totalLeads) * 100).toFixed(1) + '%'
        : '0%',

      // Contact rate
      contactRate: ((stats.contacted / stats.totalLeads) * 100).toFixed(1) + '%',

      // High opportunity leads
      highOpportunityLeads: stats.highOpportunity,

      // Average opportunity score
      avgOpportunityScore: null,

      // Leads needing follow up
      needsFollowUp: null
    };

    // Calcular lead growth
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const lastWeek = await Lead.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const previousWeek = await Lead.countDocuments({
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });

    if (previousWeek > 0) {
      const growth = ((lastWeek - previousWeek) / previousWeek) * 100;
      kpis.leadGrowth = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
    } else {
      kpis.leadGrowth = lastWeek > 0 ? '+100%' : '0%';
    }

    // Average opportunity score
    const avgScore = await Lead.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$opportunityScore' }
        }
      }
    ]);

    kpis.avgOpportunityScore = avgScore[0]
      ? Math.round(avgScore[0].avg)
      : 0;

    // Leads needing follow up
    const followUps = await getLeadsNeedingFollowUp();
    kpis.needsFollowUp = followUps.length;

    return kpis;

  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    return {};
  }
}

/**
 * Recomendaciones basadas en analytics
 */
export async function getRecommendations() {
  const stats = await getGeneralStats();
  const sourceAnalysis = await getSourceAnalysis();
  const followUps = await getLeadsNeedingFollowUp();

  const recommendations = [];

  // Leads sin contactar
  if (stats.notContacted > stats.contacted) {
    recommendations.push({
      priority: 'high',
      category: 'contact',
      message: `${stats.notContacted} leads sin contactar`,
      action: 'Implementar flujo automatizado de primer contacto'
    });
  }

  // Leads sin email
  if (stats.withoutEmail > stats.totalLeads * 0.3) {
    recommendations.push({
      priority: 'medium',
      category: 'data_quality',
      message: `${stats.withoutEmail} leads sin email`,
      action: 'Ejecutar búsqueda de emails en batch'
    });
  }

  // Seguimientos pendientes
  if (followUps.length > 10) {
    recommendations.push({
      priority: 'high',
      category: 'follow_up',
      message: `${followUps.length} leads requieren seguimiento`,
      action: 'Programar seguimientos inmediatamente'
    });
  }

  // Alta oportunidad sin contactar
  const highOppNotContacted = await Lead.countDocuments({
      opportunityScore: { $gte: 70 },
      lastContactedAt: null
  });

  if (highOppNotContacted > 5) {
    recommendations.push({
      priority: 'critical',
      category: 'opportunity',
      message: `${highOppNotContacted} leads de alta oportunidad sin contactar`,
      action: 'URGENTE: Contactar estos leads inmediatamente'
    });
  }

  // Fuente más efectiva
  const bestSource = sourceAnalysis.sort((a, b) =>
    parseFloat(b.conversionRate) - parseFloat(a.conversionRate)
  )[0];

  if (bestSource) {
    recommendations.push({
      priority: 'medium',
      category: 'strategy',
      message: `Fuente más efectiva: ${bestSource.source} (${bestSource.conversionRate} conversión)`,
      action: `Invertir más recursos en ${bestSource.source}`
    });
  }

  return recommendations;
}
