// src/app/api/analytics/dashboard/route.js
import { NextResponse } from 'next/server';
import {
  getCompleteDashboard,
  getKeyKPIs,
  getRecommendations,
  getGeneralStats,
  getTimeTrends,
  getSourceAnalysis,
  getTopOpportunities,
  getLeadsNeedingFollowUp,
  getCategoryPerformance,
  getContactActivity
} from '@/lib/analytics/dashboardAnalytics';

/**
 * GET /api/analytics/dashboard
 * Retorna analytics completo del CRM
 *
 * Query params:
 * - type: 'full' | 'kpis' | 'recommendations' | 'stats' | 'trends' | 'sources' | 'opportunities' | 'followups' | 'categories' | 'contacts'
 * - days: número de días para trends (default: 30)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'full';
    const days = parseInt(searchParams.get('days')) || 30;

    let data;

    switch (type) {
      case 'kpis':
        data = await getKeyKPIs();
        break;

      case 'recommendations':
        data = await getRecommendations();
        break;

      case 'stats':
        data = await getGeneralStats();
        break;

      case 'trends':
        data = await getTimeTrends(days);
        break;

      case 'sources':
        data = await getSourceAnalysis();
        break;

      case 'opportunities':
        const limit = parseInt(searchParams.get('limit')) || 10;
        data = await getTopOpportunities(limit);
        break;

      case 'followups':
        data = await getLeadsNeedingFollowUp();
        break;

      case 'categories':
        data = await getCategoryPerformance();
        break;

      case 'contacts':
        data = await getContactActivity();
        break;

      case 'full':
      default:
        data = await getCompleteDashboard();
        break;
    }

    return NextResponse.json({
      success: true,
      type,
      data
    });

  } catch (error) {
    console.error('Error en analytics dashboard:', error);

    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
