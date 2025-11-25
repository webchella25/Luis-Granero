// src/lib/scraper/masterLeadEnrichment.js
import { enhancedWebsiteAnalysis } from './enhancedWebsiteAnalyzer.js';
import { findAndVerifyEmails } from './enhancedEmailFinder.js';
import { getGoogleReviews, generateReviewsPitch, calculateReviewsOpportunityScore } from './googleReviewsAnalyzer.js';
import { analyzeCompetition, generateCompetitionReport, calculateCompetitiveAdvantageScore } from './competitorAnalyzer.js';
import { analyzeFacebookPresence, generateFacebookPitch } from './facebookScraper.js';
import { analyzeLinkedInPresence, generateLinkedInPitch } from './linkedinScraper.js';
import { analyzeHiringActivity, generateJobPostingsPitch } from './jobPostingsScraper.js';

/**
 * MASTER LEAD ENRICHMENT
 * Sistema completo que integra todos los scrapers y analyzers
 */

/**
 * Enriquecimiento completo de un lead
 */
export async function masterEnrichLead(leadData, options = {}) {
  const {
    includeWebAnalysis = true,
    includeEmailFinding = true,
    includeReviews = true,
    includeCompetition = false, // Más lento
    includeSocialMedia = true,
    includeHiringActivity = false // Más lento
  } = options;

  console.log('\n═════════════════════════════════════════════');
  console.log('🚀 MASTER LEAD ENRICHMENT');
  console.log('═════════════════════════════════════════════');
  console.log(`Lead: ${leadData.name}`);
  console.log(`Website: ${leadData.website || 'N/A'}`);
  console.log('═════════════════════════════════════════════\n');

  const enrichment = {
    original: leadData,
    website: null,
    emails: null,
    reviews: null,
    competition: null,
    socialMedia: {
      facebook: null,
      linkedin: null
    },
    hiring: null,
    finalScore: 0,
    opportunities: [],
    recommendations: [],
    pitch: null,
    enrichedAt: new Date()
  };

  try {
    // 1. Análisis de website (si tiene)
    if (includeWebAnalysis && leadData.website) {
      console.log('🔍 1. Analizando website...');
      try {
        enrichment.website = await enhancedWebsiteAnalysis(leadData.website);
        console.log(`   ✅ Score: ${enrichment.website.finalScore}/100`);
        console.log(`   ✅ Oportunidad: ${enrichment.website.opportunityLevel}`);

        // Agregar oportunidades del website
        if (enrichment.website.pitch) {
          enrichment.opportunities.push({
            source: 'website',
            type: enrichment.website.opportunityLevel,
            message: enrichment.website.pitch.mainMessage
          });
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(1000);
    } else if (!leadData.website) {
      console.log('⚠️ 1. Sin website - ALTA OPORTUNIDAD');
      enrichment.opportunities.push({
        source: 'website',
        type: 'CRITICAL',
        message: 'No tiene website - necesidad crítica de presencia digital'
      });
    }

    // 2. Búsqueda y verificación de emails
    if (includeEmailFinding && leadData.website) {
      console.log('\n🔍 2. Buscando y verificando emails...');
      try {
        enrichment.emails = await findAndVerifyEmails(leadData.website, leadData.name);
        console.log(`   ✅ ${enrichment.emails.verified.length} emails válidos`);

        if (enrichment.emails.personal?.length > 0) {
          console.log(`   ✅ ${enrichment.emails.personal.length} emails personales`);
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(1000);
    }

    // 3. Análisis de reviews de Google
    if (includeReviews && leadData.placeId) {
      console.log('\n🔍 3. Analizando reviews de Google...');
      try {
        const reviewsData = await getGoogleReviews(leadData.placeId, 20);

        if (reviewsData) {
          enrichment.reviews = {
            ...reviewsData,
            opportunityScore: calculateReviewsOpportunityScore(reviewsData),
            pitch: generateReviewsPitch(reviewsData)
          };

          console.log(`   ✅ ${reviewsData.totalReviews} reviews analizados`);
          console.log(`   ✅ Rating: ${reviewsData.analysis.overall.avgRating}/5`);

          // Agregar oportunidades de reviews
          if (enrichment.reviews.pitch) {
            enrichment.opportunities.push({
              source: 'reviews',
              type: enrichment.reviews.opportunityScore >= 60 ? 'HIGH' : 'MEDIUM',
              message: enrichment.reviews.pitch.mainMessage
            });
          }
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(1000);
    }

    // 4. Análisis de competencia
    if (includeCompetition && leadData.category) {
      console.log('\n🔍 4. Analizando competencia...');
      try {
        const competitionData = await analyzeCompetition(leadData, {
          searchQuery: leadData.category,
          location: leadData.address,
          maxCompetitors: 3,
          includeWebAnalysis: true,
          includeReviews: false // Más rápido
        });

        if (competitionData) {
          enrichment.competition = {
            ...competitionData,
            report: generateCompetitionReport(competitionData),
            advantageScore: calculateCompetitiveAdvantageScore(competitionData.comparison)
          };

          console.log(`   ✅ ${competitionData.competitors.length} competidores analizados`);
          console.log(`   ✅ Ventaja competitiva: ${enrichment.competition.advantageScore}/100`);

          // Agregar oportunidades competitivas
          competitionData.opportunities.forEach(opp => {
            enrichment.opportunities.push({
              source: 'competition',
              type: opp.priority.toUpperCase(),
              message: opp.message
            });
          });
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(2000); // Pausa más larga
    }

    // 5. Análisis de redes sociales
    if (includeSocialMedia) {
      // Facebook
      console.log('\n🔍 5a. Analizando presencia en Facebook...');
      try {
        const fbAnalysis = await analyzeFacebookPresence(leadData.name);

        if (fbAnalysis.hasPresence) {
          enrichment.socialMedia.facebook = {
            ...fbAnalysis,
            pitch: generateFacebookPitch(fbAnalysis.page.facebookData || fbAnalysis.page)
          };

          console.log(`   ✅ Facebook encontrado: ${fbAnalysis.page?.likes || 0} likes`);

          // Agregar oportunidades de Facebook
          fbAnalysis.opportunities?.forEach(opp => {
            enrichment.opportunities.push({
              source: 'facebook',
              type: 'MEDIUM',
              message: opp
            });
          });
        } else {
          console.log('   ⚠️ Sin presencia en Facebook');
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(2000);

      // LinkedIn
      console.log('\n🔍 5b. Analizando presencia en LinkedIn...');
      try {
        const liAnalysis = await analyzeLinkedInPresence(leadData.name);

        if (liAnalysis.hasPresence) {
          enrichment.socialMedia.linkedin = {
            ...liAnalysis,
            pitch: generateLinkedInPitch(liAnalysis.company?.linkedInData || liAnalysis.company)
          };

          console.log(`   ✅ LinkedIn encontrado: ${liAnalysis.company?.followers || 'N/A'} followers`);

          // Agregar oportunidades de LinkedIn
          liAnalysis.opportunities?.forEach(opp => {
            enrichment.opportunities.push({
              source: 'linkedin',
              type: 'MEDIUM',
              message: opp
            });
          });
        } else {
          console.log('   ⚠️ Sin presencia en LinkedIn');
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }

      await pause(2000);
    }

    // 6. Análisis de actividad de contratación
    if (includeHiringActivity) {
      console.log('\n🔍 6. Analizando actividad de contratación...');
      try {
        const hiringAnalysis = await analyzeHiringActivity(leadData.name);

        if (hiringAnalysis.isHiring) {
          enrichment.hiring = {
            ...hiringAnalysis,
            pitch: generateJobPostingsPitch(hiringAnalysis)
          };

          console.log(`   ✅ ${hiringAnalysis.totalOpenings} posiciones abiertas`);
          console.log(`   ✅ Nivel de crecimiento: ${hiringAnalysis.growthLevel}`);

          // Agregar oportunidades de hiring
          hiringAnalysis.opportunities?.forEach(opp => {
            enrichment.opportunities.push({
              source: 'hiring',
              type: hiringAnalysis.growthLevel === 'high' ? 'HIGH' : 'MEDIUM',
              message: opp
            });
          });
        } else {
          console.log('   ⚠️ Sin actividad de contratación');
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }

    // 7. Calcular score final y generar pitch
    enrichment.finalScore = calculateMasterScore(enrichment);
    enrichment.recommendations = generateMasterRecommendations(enrichment);
    enrichment.pitch = generateMasterPitch(enrichment);

    console.log('\n═════════════════════════════════════════════');
    console.log('✅ ENRICHMENT COMPLETO');
    console.log('═════════════════════════════════════════════');
    console.log(`Score Final: ${enrichment.finalScore}/100`);
    console.log(`Oportunidades: ${enrichment.opportunities.length}`);
    console.log(`Recomendaciones: ${enrichment.recommendations.length}`);
    console.log('═════════════════════════════════════════════\n');

    return enrichment;

  } catch (error) {
    console.error('❌ Error en master enrichment:', error);
    return enrichment;
  }
}

/**
 * Calcular score final maestro
 */
function calculateMasterScore(enrichment) {
  let score = 50; // Base

  // Website analysis (30%)
  if (enrichment.website) {
    score += (enrichment.website.finalScore * 0.3);
  } else {
    score += 30; // Sin website = alta oportunidad
  }

  // Reviews (20%)
  if (enrichment.reviews) {
    score += (enrichment.reviews.opportunityScore * 0.2);
  }

  // Competition (20%)
  if (enrichment.competition) {
    // Score bajo de ventaja competitiva = alta oportunidad
    const competitionOpp = 100 - enrichment.competition.advantageScore;
    score += (competitionOpp * 0.2);
  }

  // Social media (15%)
  let socialScore = 0;
  if (enrichment.socialMedia.facebook?.issues?.length > 0) {
    socialScore += 50;
  }
  if (enrichment.socialMedia.linkedin?.issues?.length > 0) {
    socialScore += 50;
  }
  score += (socialScore * 0.15);

  // Hiring activity (15%)
  if (enrichment.hiring?.isHiring) {
    if (enrichment.hiring.growthLevel === 'high') {
      score += 15;
    } else if (enrichment.hiring.growthLevel === 'medium') {
      score += 10;
    } else {
      score += 5;
    }
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Generar recomendaciones maestras
 */
function generateMasterRecommendations(enrichment) {
  const recommendations = [];

  // Top 5 oportunidades más críticas
  const sortedOpps = enrichment.opportunities.sort((a, b) => {
    const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return priority[a.type] - priority[b.type];
  });

  sortedOpps.slice(0, 5).forEach(opp => {
    recommendations.push({
      priority: opp.type.toLowerCase(),
      source: opp.source,
      message: opp.message,
      action: generateActionForOpportunity(opp)
    });
  });

  // Recomendaciones específicas del website
  if (enrichment.website?.recommendations) {
    enrichment.website.recommendations.slice(0, 3).forEach(rec => {
      recommendations.push(rec);
    });
  }

  return recommendations.slice(0, 10); // Top 10
}

/**
 * Generar acción para una oportunidad
 */
function generateActionForOpportunity(opportunity) {
  const actions = {
    website: 'Proponer rediseño/creación de website moderno',
    reviews: 'Implementar gestión de reputación online',
    competition: 'Destacar ventajas competitivas en propuesta',
    facebook: 'Optimizar presencia en redes sociales',
    linkedin: 'Crear/optimizar presencia profesional B2B',
    hiring: 'Proponer solución escalable para empresa en crecimiento'
  };

  return actions[opportunity.source] || 'Contactar para discutir oportunidad';
}

/**
 * Generar pitch maestro
 */
function generateMasterPitch(enrichment) {
  const pitchPoints = [];

  // Agregar puntos de cada fuente
  if (enrichment.website?.pitch) {
    pitchPoints.push(enrichment.website.pitch.mainMessage);
  } else if (!enrichment.original.website) {
    pitchPoints.push('No tienes website - pierdes 80% de oportunidades online');
  }

  if (enrichment.reviews?.pitch) {
    pitchPoints.push(enrichment.reviews.pitch.mainMessage);
  }

  if (enrichment.socialMedia.facebook?.pitch) {
    pitchPoints.push(enrichment.socialMedia.facebook.pitch.mainMessage);
  }

  if (enrichment.hiring?.pitch) {
    pitchPoints.push(enrichment.hiring.pitch.mainMessage);
  }

  if (pitchPoints.length === 0) {
    pitchPoints.push('Tu presencia digital puede mejorar significativamente');
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1, 4), // Top 3 adicionales
    callToAction: generateCTA(enrichment),
    urgency: enrichment.finalScore >= 70 ? 'high' : enrichment.finalScore >= 50 ? 'medium' : 'low'
  };
}

/**
 * Generar CTA basado en enrichment
 */
function generateCTA(enrichment) {
  if (!enrichment.original.website) {
    return 'Creamos tu presencia digital desde cero con tecnología moderna';
  }

  if (enrichment.website?.finalScore >= 70) {
    return 'Modernizamos completamente tu website obsoleto';
  }

  if (enrichment.hiring?.isHiring && enrichment.hiring.growthLevel === 'high') {
    return 'Escalamos tu presencia digital al ritmo de tu crecimiento';
  }

  if (enrichment.reviews?.opportunityScore >= 60) {
    return 'Mejoramos tu reputación online y gestión de reviews';
  }

  return 'Optimizamos tu presencia digital de forma integral';
}

/**
 * Pausa helper
 */
function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enriquecer múltiples leads en batch
 */
export async function masterEnrichLeadsBatch(leads, options = {}) {
  console.log(`\n🔄 Master enrichment en batch: ${leads.length} leads\n`);

  const results = [];

  for (const lead of leads) {
    try {
      const enrichment = await masterEnrichLead(lead, options);
      results.push(enrichment);

      // Pausa entre leads
      await pause(3000);

    } catch (error) {
      console.error(`Error enriqueciendo ${lead.name}:`, error);
      results.push({
        original: lead,
        error: error.message,
        enrichedAt: new Date()
      });
    }
  }

  console.log('\n✅ Batch enrichment completo');

  return results;
}
