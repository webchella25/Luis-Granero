// src/lib/scraper/competitorAnalyzer.js
import { scrapeGoogleMaps } from '../scrapers/googleMapsScraper';
import { analyzeWebsite } from '../scrapers/websiteAnalyzer';
import { enhancedWebsiteAnalysis } from './enhancedWebsiteAnalyzer.js';
import { getGoogleReviews } from './googleReviewsAnalyzer.js';

/**
 * COMPETITOR ANALYZER
 * Analiza competencia para identificar ventajas competitivas
 */

/**
 * Analizar competencia de un negocio
 */
export async function analyzeCompetition(businessData, options = {}) {
  const {
    searchQuery = businessData.category || businessData.name,
    location = businessData.address || null,
    maxCompetitors = 5,
    includeWebAnalysis = true,
    includeReviews = true
  } = options;

  console.log('\n═══════════════════════════════════════');
  console.log('🎯 ANÁLISIS DE COMPETENCIA');
  console.log('═══════════════════════════════════════');
  console.log(`Negocio: ${businessData.name}`);
  console.log(`Búsqueda: ${searchQuery}`);
  console.log(`Ubicación: ${location || 'N/A'}\n`);

  try {
    // 1. Buscar competidores en Google Maps
    console.log('🔍 Buscando competidores...');
    const competitors = await scrapeGoogleMaps(searchQuery, location, maxCompetitors + 1);

    if (!competitors || competitors.length === 0) {
      console.log('⚠️ No se encontraron competidores');
      return null;
    }

    // Filtrar el negocio actual si aparece
    const filteredCompetitors = competitors
      .filter(c => c.name !== businessData.name)
      .slice(0, maxCompetitors);

    console.log(`✅ ${filteredCompetitors.length} competidores encontrados\n`);

    // 2. Enriquecer competidores con análisis web (si tienen website)
    const enrichedCompetitors = [];

    for (const competitor of filteredCompetitors) {
      console.log(`📊 Analizando: ${competitor.name}`);

      const enriched = {
        ...competitor,
        webAnalysis: null,
        reviewsAnalysis: null,
        opportunityScore: 0
      };

      // Análisis web
      if (includeWebAnalysis && competitor.website) {
        try {
          enriched.webAnalysis = await enhancedWebsiteAnalysis(competitor.website);
          console.log(`  ✅ Web analizada: Score ${enriched.webAnalysis?.finalScore || 'N/A'}`);
        } catch (err) {
          console.log(`  ⚠️ Error analizando web: ${err.message}`);
        }

        // Pequeña pausa
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (!competitor.website) {
        console.log(`  ⚠️ Sin website`);
      }

      // Análisis de reviews
      if (includeReviews && competitor.placeId) {
        try {
          enriched.reviewsAnalysis = await getGoogleReviews(competitor.placeId, 10);
          console.log(`  ✅ Reviews analizados: ${enriched.reviewsAnalysis?.totalReviews || 0} reviews`);
        } catch (err) {
          console.log(`  ⚠️ Error obteniendo reviews: ${err.message}`);
        }
      }

      enrichedCompetitors.push(enriched);
      console.log('');
    }

    // 3. Comparar con el negocio actual
    const comparison = compareWithBusiness(businessData, enrichedCompetitors);

    // 4. Identificar oportunidades
    const opportunities = identifyCompetitiveOpportunities(businessData, enrichedCompetitors);

    // 5. Generar recomendaciones
    const recommendations = generateCompetitiveRecommendations(comparison, opportunities);

    console.log('✅ ANÁLISIS COMPLETO');
    console.log('═══════════════════════════════════════\n');

    return {
      business: businessData.name,
      competitors: enrichedCompetitors,
      comparison,
      opportunities,
      recommendations,
      analyzedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Error en análisis de competencia:', error);
    return null;
  }
}

/**
 * Comparar negocio con competidores
 */
function compareWithBusiness(business, competitors) {
  const comparison = {
    rating: {
      business: business.rating || 0,
      competitors: {
        avg: 0,
        max: 0,
        min: 5
      },
      position: null // 'mejor', 'promedio', 'peor'
    },
    reviews: {
      business: business.reviewCount || 0,
      competitors: {
        avg: 0,
        max: 0,
        min: 0
      },
      position: null
    },
    website: {
      business: business.website ? 'Sí' : 'No',
      competitorsWithWebsite: 0,
      competitorsWithoutWebsite: 0,
      position: null
    },
    webQuality: {
      business: business.webAnalysis?.finalScore || 0,
      competitors: {
        avg: 0,
        max: 0,
        min: 100
      },
      position: null
    }
  };

  // Calcular promedios de competidores
  let totalRating = 0;
  let totalReviews = 0;
  let totalWebScore = 0;
  let websitesCount = 0;
  let webScoresCount = 0;

  competitors.forEach(comp => {
    // Rating
    if (comp.rating) {
      totalRating += comp.rating;
      comparison.rating.competitors.max = Math.max(comparison.rating.competitors.max, comp.rating);
      comparison.rating.competitors.min = Math.min(comparison.rating.competitors.min, comp.rating);
    }

    // Reviews
    if (comp.reviewCount) {
      totalReviews += comp.reviewCount;
      comparison.reviews.competitors.max = Math.max(comparison.reviews.competitors.max, comp.reviewCount);
      comparison.reviews.competitors.min = Math.min(comparison.reviews.competitors.min, comp.reviewCount);
    }

    // Website
    if (comp.website) {
      comparison.website.competitorsWithWebsite++;
      websitesCount++;
    } else {
      comparison.website.competitorsWithoutWebsite++;
    }

    // Web quality
    if (comp.webAnalysis?.finalScore) {
      totalWebScore += comp.webAnalysis.finalScore;
      webScoresCount++;
      comparison.webQuality.competitors.max = Math.max(comparison.webQuality.competitors.max, comp.webAnalysis.finalScore);
      comparison.webQuality.competitors.min = Math.min(comparison.webQuality.competitors.min, comp.webAnalysis.finalScore);
    }
  });

  // Promedios
  comparison.rating.competitors.avg = competitors.length > 0 ? (totalRating / competitors.length).toFixed(1) : 0;
  comparison.reviews.competitors.avg = competitors.length > 0 ? Math.round(totalReviews / competitors.length) : 0;
  comparison.webQuality.competitors.avg = webScoresCount > 0 ? Math.round(totalWebScore / webScoresCount) : 0;

  // Posiciones
  // Rating
  if (business.rating >= comparison.rating.competitors.avg) {
    comparison.rating.position = 'mejor';
  } else {
    comparison.rating.position = 'peor';
  }

  // Reviews
  if (business.reviewCount >= comparison.reviews.competitors.avg) {
    comparison.reviews.position = 'mejor';
  } else {
    comparison.reviews.position = 'peor';
  }

  // Website
  if (business.website && comparison.website.competitorsWithoutWebsite > 0) {
    comparison.website.position = 'mejor';
  } else if (!business.website && comparison.website.competitorsWithWebsite > 0) {
    comparison.website.position = 'peor';
  } else {
    comparison.website.position = 'promedio';
  }

  // Web quality
  if (business.webAnalysis?.finalScore) {
    if (business.webAnalysis.finalScore >= comparison.webQuality.competitors.avg) {
      comparison.webQuality.position = 'mejor';
    } else {
      comparison.webQuality.position = 'peor';
    }
  }

  return comparison;
}

/**
 * Identificar oportunidades competitivas
 */
function identifyCompetitiveOpportunities(business, competitors) {
  const opportunities = [];

  // 1. Competidores sin website
  const noWebsiteCount = competitors.filter(c => !c.website).length;
  if (noWebsiteCount > 0) {
    opportunities.push({
      type: 'market_gap',
      priority: 'high',
      message: `${noWebsiteCount}/${competitors.length} competidores no tienen website`,
      action: 'Ventaja competitiva: tener website profesional te diferencia'
    });
  }

  // 2. Websites de competidores con problemas
  const badWebsites = competitors.filter(c =>
    c.webAnalysis?.finalScore && c.webAnalysis.finalScore >= 60 // Score alto = muchos problemas
  );

  if (badWebsites.length > 0) {
    opportunities.push({
      type: 'weak_competition',
      priority: 'high',
      message: `${badWebsites.length} competidores tienen websites con problemas graves`,
      action: 'Oportunidad: website de calidad te dará ventaja inmediata'
    });
  }

  // 3. Competidores con pocos reviews
  const avgReviews = competitors.reduce((sum, c) => sum + (c.reviewCount || 0), 0) / competitors.length;
  if (avgReviews < 20) {
    opportunities.push({
      type: 'reputation_gap',
      priority: 'medium',
      message: 'Competencia tiene pocos reviews (promedio: ' + Math.round(avgReviews) + ')',
      action: 'Oportunidad: estrategia de reviews te puede posicionar rápido'
    });
  }

  // 4. Competidores con rating bajo
  const avgRating = competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.length;
  if (avgRating < 4.0) {
    opportunities.push({
      type: 'quality_gap',
      priority: 'medium',
      message: 'Rating promedio de competencia es bajo: ' + avgRating.toFixed(1),
      action: 'Oportunidad: servicio de calidad te destacará fácilmente'
    });
  }

  // 5. Tecnología obsoleta en competidores
  const obsoleteTech = competitors.filter(c =>
    c.webAnalysis?.techStack?.obsolete && c.webAnalysis.techStack.obsolete.length > 0
  );

  if (obsoleteTech.length > 0) {
    opportunities.push({
      type: 'tech_gap',
      priority: 'medium',
      message: `${obsoleteTech.length} competidores usan tecnología obsoleta`,
      action: 'Oportunidad: website moderno te dará imagen más profesional'
    });
  }

  // 6. Si tu negocio no tiene website y la competencia sí
  if (!business.website) {
    const withWebsite = competitors.filter(c => c.website).length;
    if (withWebsite > competitors.length / 2) {
      opportunities.push({
        type: 'critical_gap',
        priority: 'critical',
        message: `${withWebsite}/${competitors.length} competidores tienen website y tú no`,
        action: '🚨 URGENTE: Estás en desventaja competitiva'
      });
    }
  }

  return opportunities;
}

/**
 * Generar recomendaciones competitivas
 */
function generateCompetitiveRecommendations(comparison, opportunities) {
  const recommendations = [];

  // Basado en comparación de rating
  if (comparison.rating.position === 'peor') {
    recommendations.push({
      priority: 'high',
      category: 'reputation',
      message: 'Tu rating está por debajo de la competencia',
      action: 'Implementar estrategia de mejora de reviews y servicio al cliente'
    });
  }

  // Basado en reviews
  if (comparison.reviews.position === 'peor') {
    recommendations.push({
      priority: 'medium',
      category: 'reputation',
      message: 'Tienes menos reviews que la competencia',
      action: 'Implementar sistema automatizado de solicitud de reviews'
    });
  }

  // Basado en website
  if (comparison.website.position === 'peor') {
    recommendations.push({
      priority: 'critical',
      category: 'digital_presence',
      message: 'Competencia tiene website y tú no',
      action: 'Crear website profesional inmediatamente'
    });
  }

  // Basado en calidad web
  if (comparison.webQuality.position === 'peor') {
    recommendations.push({
      priority: 'high',
      category: 'web_quality',
      message: 'Tu website es de menor calidad que la competencia',
      action: 'Rediseño y optimización de website'
    });
  }

  // Agregar oportunidades como recomendaciones
  opportunities.forEach(opp => {
    if (opp.type === 'critical_gap') {
      recommendations.push({
        priority: 'critical',
        category: 'competitive_advantage',
        message: opp.message,
        action: opp.action
      });
    } else if (opp.type === 'market_gap' || opp.type === 'weak_competition') {
      recommendations.push({
        priority: 'high',
        category: 'competitive_advantage',
        message: opp.message,
        action: opp.action
      });
    }
  });

  // Ordenar por prioridad
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generar reporte de competencia
 */
export function generateCompetitionReport(analysisData) {
  if (!analysisData) return null;

  const { comparison, opportunities, recommendations } = analysisData;

  return {
    summary: {
      rating: `${comparison.rating.position} que competencia (${comparison.rating.business} vs ${comparison.rating.competitors.avg})`,
      reviews: `${comparison.reviews.position} que competencia (${comparison.reviews.business} vs ${comparison.reviews.competitors.avg})`,
      website: comparison.website.position,
      opportunities: opportunities.length
    },
    strengths: [],
    weaknesses: [],
    opportunities: opportunities.map(o => o.message),
    recommendations: recommendations.slice(0, 5) // Top 5
  };
}

/**
 * Calcular score de ventaja competitiva (0-100)
 * 100 = máxima ventaja, 0 = máxima desventaja
 */
export function calculateCompetitiveAdvantageScore(comparison) {
  let score = 50; // Base neutral

  // Rating
  if (comparison.rating.position === 'mejor') score += 15;
  else if (comparison.rating.position === 'peor') score -= 15;

  // Reviews
  if (comparison.reviews.position === 'mejor') score += 10;
  else if (comparison.reviews.position === 'peor') score -= 10;

  // Website
  if (comparison.website.position === 'mejor') score += 15;
  else if (comparison.website.position === 'peor') score -= 20;

  // Web quality
  if (comparison.webQuality.position === 'mejor') score += 10;
  else if (comparison.webQuality.position === 'peor') score -= 10;

  return Math.max(0, Math.min(100, score));
}
