// src/lib/scraper/multiSourceEnrichment.js
import { scrapeGoogleMaps } from '@/lib/scrapers/googleMapsScraper';
import { scrapeGoogleSearch } from './googleSearchScraper';
import { scrapeInstagramHashtag } from './instagramScraper';
import { analyzeWebsite, guessBusinessEmails } from '@/lib/scrapers/websiteAnalyzer';

/**
 * MULTI-SOURCE ENRICHMENT
 * Combina datos de Google Maps + Instagram + Facebook para obtener leads completos
 */
export async function multiSourceEnrichment(query, location, options = {}) {
  const {
    maxResults = 20,
    includeInstagram = true,
    includeFacebook = true,
    analyzeWebsites = true
  } = options;

  console.log('\n═══════════════════════════════════════');
  console.log('🔄 MULTI-SOURCE ENRICHMENT');
  console.log('═══════════════════════════════════════');
  console.log(`Búsqueda: "${query}" en "${location}"`);
  console.log(`Instagram: ${includeInstagram ? '✅' : '❌'}`);
  console.log(`Facebook: ${includeFacebook ? '✅' : '❌'}`);
  console.log(`Análisis web: ${analyzeWebsites ? '✅' : '❌'}`);

  // PASO 1: Buscar en Google Maps (fuente principal)
  console.log('\n📍 PASO 1: Google Maps');
  const mapsLeads = await scrapeGoogleMaps(query, location, maxResults);
  console.log(`✅ ${mapsLeads.length} negocios encontrados en Maps`);

  // PASO 2: Enriquecer cada lead
  const enrichedLeads = [];

  for (let i = 0; i < mapsLeads.length; i++) {
    const lead = mapsLeads[i];
    console.log(`\n[${i + 1}/${mapsLeads.length}] Enriqueciendo: ${lead.name}`);

    let enrichedLead = { ...lead };

    // 2a. Si tiene website, analizarla
    if (lead.website && analyzeWebsites) {
      console.log(`  🌐 Analizando website: ${lead.website}`);
      try {
        const webAnalysis = await analyzeWebsite(lead.website);
        enrichedLead.webAnalysis = webAnalysis;

        // Extraer emails del análisis
        if (webAnalysis?.emails && webAnalysis.emails.length > 0) {
          enrichedLead.possibleEmails = webAnalysis.emails;
        } else {
          enrichedLead.possibleEmails = guessBusinessEmails(lead.name, lead.website);
        }

        console.log(`  ✅ Score web: ${webAnalysis?.score || 0}/100`);
      } catch (error) {
        console.log(`  ⚠️ Error analizando web: ${error.message}`);
      }
    }

    // 2b. Si NO tiene website, buscar en redes sociales
    if (!lead.website) {
      console.log(`  🔍 Sin website, buscando en redes sociales...`);

      // Buscar en Instagram
      if (includeInstagram) {
        try {
          const instagramHandle = await searchInstagramProfile(lead.name, location);
          if (instagramHandle) {
            enrichedLead.socialMedia = {
              ...enrichedLead.socialMedia,
              instagram: `https://instagram.com/${instagramHandle}`
            };
            enrichedLead.hasOnlySocialMedia = true;
            console.log(`  📸 Instagram encontrado: @${instagramHandle}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Error buscando Instagram: ${error.message}`);
        }
      }

      // Buscar en Facebook
      if (includeFacebook) {
        try {
          const facebookUrl = await searchFacebookPage(lead.name, location);
          if (facebookUrl) {
            enrichedLead.socialMedia = {
              ...enrichedLead.socialMedia,
              facebook: facebookUrl
            };
            enrichedLead.hasOnlySocialMedia = true;
            console.log(`  📘 Facebook encontrado: ${facebookUrl}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Error buscando Facebook: ${error.message}`);
        }
      }
    }

    // 2c. Calcular opportunity score
    enrichedLead.opportunityScore = calculateEnrichedScore(enrichedLead);

    // 2d. Clasificar tipo de lead
    enrichedLead.leadType = classifyLeadType(enrichedLead);

    enrichedLeads.push(enrichedLead);

    console.log(`  🎯 Score final: ${enrichedLead.opportunityScore}/100`);
    console.log(`  📊 Tipo: ${enrichedLead.leadType}`);
  }

  // PASO 3: Ordenar por score
  enrichedLeads.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // PASO 4: Generar estadísticas
  const stats = generateEnrichmentStats(enrichedLeads);

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESULTADOS FINALES');
  console.log('═══════════════════════════════════════');
  console.log(`Total leads: ${enrichedLeads.length}`);
  console.log(`Sin website: ${stats.noWebsite}`);
  console.log(`Solo redes sociales: ${stats.onlySocialMedia}`);
  console.log(`Web obsoleta: ${stats.outdatedWebsite}`);
  console.log(`Alta oportunidad (>70): ${stats.highOpportunity}`);
  console.log('═══════════════════════════════════════\n');

  return {
    leads: enrichedLeads,
    stats
  };
}

/**
 * Buscar perfil de Instagram mediante Google Search
 */
async function searchInstagramProfile(businessName, location) {
  try {
    // Buscar en Google: "businessName location instagram"
    const searchQuery = `${businessName} ${location} instagram`;
    const results = await scrapeGoogleSearch(searchQuery, 5);

    // Buscar resultado que sea de Instagram
    for (const result of results) {
      if (result.website && result.website.includes('instagram.com')) {
        // Extraer username del URL
        const match = result.website.match(/instagram\.com\/([^\/\?]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error buscando Instagram:', error);
    return null;
  }
}

/**
 * Buscar página de Facebook mediante Google Search
 */
async function searchFacebookPage(businessName, location) {
  try {
    // Buscar en Google: "businessName location facebook"
    const searchQuery = `${businessName} ${location} facebook`;
    const results = await scrapeGoogleSearch(searchQuery, 5);

    // Buscar resultado que sea de Facebook
    for (const result of results) {
      if (result.website && result.website.includes('facebook.com')) {
        // Verificar que no sea un post, sino una página
        if (result.website.includes('/pages/') ||
            !result.website.includes('/posts/')) {
          return result.website;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error buscando Facebook:', error);
    return null;
  }
}

/**
 * Calcular score con datos enriquecidos
 */
function calculateEnrichedScore(lead) {
  let score = 50; // Base

  // 1. SIN WEBSITE = MÁXIMA OPORTUNIDAD
  if (!lead.website) {
    score = 100;
    // Si tiene redes sociales, incluso mejor
    if (lead.hasOnlySocialMedia) {
      return 100;
    }
    return 95;
  }

  // 2. WEBSITE OBSOLETA
  if (lead.webAnalysis) {
    const webScore = lead.webAnalysis.score;

    if (webScore < 30) {
      score = 100; // Web muy mala = gran oportunidad
    } else if (webScore < 50) {
      score = 85;
    } else if (webScore < 70) {
      score = 70;
    } else {
      score = 50; // Web decente
    }

    // Bonus por problemas específicos
    if (lead.webAnalysis.issues) {
      if (lead.webAnalysis.issues.some(i => i.includes('obsoleto'))) score += 10;
      if (lead.webAnalysis.issues.some(i => i.includes('lenta'))) score += 5;
      if (!lead.webAnalysis.hasSSL) score += 10;
      if (!lead.webAnalysis.hasMobile) score += 15;
    }
  }

  // 3. RATING Y REVIEWS
  if (lead.rating) {
    if (lead.rating >= 4.5) score += 10;
    else if (lead.rating >= 4.0) score += 5;
  }

  if (lead.reviewCount) {
    if (lead.reviewCount > 100) score += 10; // Negocio establecido
    else if (lead.reviewCount > 50) score += 5;
  }

  // 4. TIENE REDES SOCIALES ACTIVAS
  if (lead.socialMedia) {
    const socialCount = Object.values(lead.socialMedia).filter(s => s).length;
    score += Math.min(socialCount * 3, 10); // Max +10
  }

  // 5. DATOS DE CONTACTO
  if (lead.phone) score += 5;
  if (lead.email || (lead.possibleEmails && lead.possibleEmails.length > 0)) score += 5;

  return Math.min(100, Math.max(0, score));
}

/**
 * Clasificar tipo de lead
 */
function classifyLeadType(lead) {
  // Sin web y sin redes
  if (!lead.website && !lead.hasOnlySocialMedia) {
    return 'URGENTE - Sin presencia online';
  }

  // Sin web pero con redes
  if (!lead.website && lead.hasOnlySocialMedia) {
    return 'ALTA PRIORIDAD - Solo redes sociales';
  }

  // Web obsoleta
  if (lead.webAnalysis && lead.webAnalysis.score < 30) {
    return 'ALTA PRIORIDAD - Web obsoleta';
  }

  // Web regular
  if (lead.webAnalysis && lead.webAnalysis.score < 60) {
    return 'MEDIA PRIORIDAD - Web mejorable';
  }

  // Web decente
  if (lead.webAnalysis && lead.webAnalysis.score >= 60) {
    return 'BAJA PRIORIDAD - Web aceptable';
  }

  return 'SIN CLASIFICAR';
}

/**
 * Generar estadísticas de enriquecimiento
 */
function generateEnrichmentStats(leads) {
  return {
    total: leads.length,
    noWebsite: leads.filter(l => !l.website).length,
    onlySocialMedia: leads.filter(l => l.hasOnlySocialMedia).length,
    outdatedWebsite: leads.filter(l => l.webAnalysis && l.webAnalysis.score < 40).length,
    highOpportunity: leads.filter(l => l.opportunityScore >= 70).length,
    withPhone: leads.filter(l => l.phone).length,
    withEmail: leads.filter(l => l.email || (l.possibleEmails && l.possibleEmails.length > 0)).length,
    byType: {
      urgent: leads.filter(l => l.leadType.includes('URGENTE')).length,
      high: leads.filter(l => l.leadType.includes('ALTA')).length,
      medium: leads.filter(l => l.leadType.includes('MEDIA')).length,
      low: leads.filter(l => l.leadType.includes('BAJA')).length
    }
  };
}
