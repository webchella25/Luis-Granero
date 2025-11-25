// src/lib/scraper/facebookScraper.js
import { ApifyClient } from 'apify-client';

/**
 * FACEBOOK SCRAPER
 * Usa Apify para extraer datos de páginas de Facebook
 * Costo: $5 gratis/mes en Apify
 */

const API_TOKEN = process.env.APIFY_API_TOKEN;

/**
 * Buscar páginas de Facebook por keyword
 */
export async function scrapeFacebookPages(keyword, maxResults = 20) {
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`\n📘 Iniciando búsqueda en Facebook: "${keyword}"`);

  try {
    const client = new ApifyClient({ token: API_TOKEN });

    // Configuración del input para el actor de Facebook
    const input = {
      searchKeywords: [keyword],
      maxResults: maxResults,
      scrapeAbout: true,
      scrapeReviews: true,
      scrapeServices: true,
      scrapePosts: false, // No necesitamos posts, solo info de negocio
      maxReviews: 10
    };

    console.log('📝 Input configurado:', input);
    console.log('🚀 Iniciando Actor de Facebook...');

    // Usar el actor público de Facebook
    // Hay varios disponibles: apify/facebook-pages-scraper es uno popular
    const run = await client.actor('apify/facebook-pages-scraper').call(input, {
      waitSecs: 120 // Esperar máximo 2 minutos
    });

    console.log(`✅ Actor finalizado con status: ${run.status}`);

    if (run.status !== 'SUCCEEDED') {
      throw new Error(`Actor falló con status: ${run.status}`);
    }

    // Obtener resultados
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📊 ${items.length} páginas obtenidas`);

    if (items.length === 0) {
      console.warn('⚠️ No se encontraron páginas');
      return [];
    }

    // Procesar resultados
    const pages = items.map(item => processPage(item, keyword));

    console.log(`✅ ${pages.length} páginas procesadas`);

    return pages;

  } catch (error) {
    console.error('❌ Error en Facebook scraping:', error.message);
    throw error;
  }
}

/**
 * Buscar una página específica de Facebook por URL
 */
export async function scrapeFacebookPageByUrl(pageUrl) {
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`\n📘 Analizando página de Facebook: ${pageUrl}`);

  try {
    const client = new ApifyClient({ token: API_TOKEN });

    const input = {
      startUrls: [{ url: pageUrl }],
      maxResults: 1,
      scrapeAbout: true,
      scrapeReviews: true,
      scrapeServices: true,
      scrapePosts: false,
      maxReviews: 20
    };

    const run = await client.actor('apify/facebook-pages-scraper').call(input, {
      waitSecs: 120
    });

    if (run.status !== 'SUCCEEDED') {
      throw new Error(`Actor falló con status: ${run.status}`);
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items.length === 0) {
      console.warn('⚠️ No se pudo extraer información de la página');
      return null;
    }

    const page = processPage(items[0], null);
    console.log(`✅ Página procesada: ${page.name}`);

    return page;

  } catch (error) {
    console.error('❌ Error scrapeando página de Facebook:', error.message);
    return null;
  }
}

/**
 * Procesar datos de una página de Facebook
 */
function processPage(item, searchQuery) {
  return {
    name: item.name || item.title || 'Sin nombre',
    username: item.username || extractUsernameFromUrl(item.url),
    url: item.url || null,
    category: item.categories ? item.categories[0] : null,
    allCategories: item.categories || [],

    // Contacto
    website: item.website || null,
    email: item.email || null,
    phone: item.phone || null,
    address: item.address?.full || item.address || null,

    // Ubicación
    city: item.address?.city || null,
    state: item.address?.state || null,
    country: item.address?.country || null,
    zipCode: item.address?.zipCode || null,

    // Métricas
    likes: item.likes || item.pageViews || 0,
    followers: item.followers || 0,
    checkins: item.checkins || 0,
    rating: item.rating || 0,
    reviewCount: item.reviewsCount || item.reviews?.length || 0,

    // Info adicional
    about: item.about || item.description || null,
    services: item.services || [],
    priceRange: item.priceRange || null,
    hours: item.hours || null,

    // Reviews
    reviews: item.reviews ? item.reviews.slice(0, 5).map(r => ({
      author: r.author || 'Anónimo',
      rating: r.rating || 0,
      text: r.text || '',
      date: r.date || null
    })) : [],

    // Verificación
    isVerified: item.verified || false,

    // Metadata
    source: 'facebook',
    searchQuery: searchQuery,
    scrapedAt: new Date(),

    // Opportunity score
    opportunityScore: calculateFacebookScore(item)
  };
}

/**
 * Extraer username de URL de Facebook
 */
function extractUsernameFromUrl(url) {
  if (!url) return null;

  try {
    const match = url.match(/facebook\.com\/([^/?]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Calcular opportunity score basado en datos de Facebook
 */
function calculateFacebookScore(page) {
  let score = 50; // Base

  // Sin website = alta oportunidad
  if (!page.website) {
    score += 30;
  }

  // Pocos likes/followers = necesitan presencia mejor
  if (page.likes < 500) {
    score += 15;
  }

  // Sin email público = difícil contactarlos
  if (!page.email) {
    score += 10;
  }

  // Rating bajo = problemas de servicio
  if (page.rating && page.rating < 4.0) {
    score += 15;
  }

  // Pocos reviews = poca presencia
  if (page.reviewsCount < 20) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Analizar presencia de Facebook de un negocio
 */
export async function analyzeFacebookPresence(businessName) {
  console.log(`\n🔍 Analizando presencia en Facebook: ${businessName}`);

  try {
    const pages = await scrapeFacebookPages(businessName, 5);

    if (pages.length === 0) {
      return {
        hasPresence: false,
        analysis: {
          message: 'No se encontró presencia en Facebook',
          opportunity: 'ALTA - Crear página de Facebook',
          priority: 'high'
        }
      };
    }

    // Buscar coincidencia exacta o mejor match
    const exactMatch = pages.find(p =>
      p.name.toLowerCase() === businessName.toLowerCase()
    );

    const bestMatch = exactMatch || pages[0];

    // Analizar la página
    const analysis = {
      hasPresence: true,
      page: bestMatch,
      metrics: {
        likes: bestMatch.likes,
        followers: bestMatch.followers,
        rating: bestMatch.rating,
        reviews: bestMatch.reviewCount
      },
      issues: [],
      opportunities: []
    };

    // Identificar problemas
    if (!bestMatch.website) {
      analysis.issues.push({
        severity: 'high',
        message: 'No tiene website en su página de Facebook',
        impact: 'Pierden tráfico potencial'
      });
      analysis.opportunities.push('Agregar website a Facebook para aumentar tráfico');
    }

    if (!bestMatch.email) {
      analysis.issues.push({
        severity: 'medium',
        message: 'No tiene email público',
        impact: 'Dificulta contacto de clientes'
      });
    }

    if (bestMatch.likes < 500) {
      analysis.issues.push({
        severity: 'medium',
        message: `Solo ${bestMatch.likes} likes`,
        impact: 'Baja presencia en redes sociales'
      });
      analysis.opportunities.push('Campaña de crecimiento en Facebook');
    }

    if (bestMatch.rating < 4.0) {
      analysis.issues.push({
        severity: 'high',
        message: `Rating bajo: ${bestMatch.rating}/5`,
        impact: 'Afecta reputación online'
      });
      analysis.opportunities.push('Mejorar servicio y gestionar reviews');
    }

    if (bestMatch.reviewCount < 20) {
      analysis.issues.push({
        severity: 'low',
        message: `Solo ${bestMatch.reviewCount} reviews`,
        impact: 'Poca prueba social'
      });
      analysis.opportunities.push('Solicitar más reviews a clientes');
    }

    return analysis;

  } catch (error) {
    console.error('❌ Error analizando Facebook:', error);
    return {
      hasPresence: false,
      error: error.message
    };
  }
}

/**
 * Generar leads de Facebook
 */
export async function generateFacebookLeads(keyword, maxResults = 20) {
  console.log('\n═══════════════════════════════════════');
  console.log('📘 GENERACIÓN DE LEADS DESDE FACEBOOK');
  console.log('═══════════════════════════════════════');
  console.log(`Keyword: ${keyword}`);
  console.log(`Max resultados: ${maxResults}\n`);

  try {
    const pages = await scrapeFacebookPages(keyword, maxResults);

    // Convertir a formato de leads
    const leads = pages.map(page => ({
      name: page.name,
      website: page.website,
      email: page.email,
      phone: page.phone,
      address: page.address,

      socialMedia: {
        facebook: page.url,
        instagram: null,
        twitter: null,
        linkedin: null
      },

      category: page.category,
      rating: page.rating,
      reviewCount: page.reviewCount,

      source: 'facebook',
      searchQuery: keyword,
      opportunityScore: page.opportunityScore,

      // Metadata específica de Facebook
      facebookData: {
        username: page.username,
        likes: page.likes,
        followers: page.followers,
        checkins: page.checkins,
        isVerified: page.isVerified,
        about: page.about,
        services: page.services,
        priceRange: page.priceRange
      }
    }));

    console.log(`✅ ${leads.length} leads generados desde Facebook`);
    console.log('═══════════════════════════════════════\n');

    return leads;

  } catch (error) {
    console.error('❌ Error generando leads de Facebook:', error);
    return [];
  }
}

/**
 * Generar pitch para leads de Facebook sin website
 */
export function generateFacebookPitch(facebookData) {
  const pitchPoints = [];

  if (!facebookData.website) {
    pitchPoints.push('Solo tienes Facebook pero no website - pierdes 70% de tráfico potencial');
  }

  if (facebookData.likes < 500) {
    pitchPoints.push(`Solo ${facebookData.likes} likes en Facebook - baja presencia online`);
  }

  if (facebookData.rating && facebookData.rating < 4.0) {
    pitchPoints.push(`Rating de ${facebookData.rating}/5 en Facebook está afectando tu reputación`);
  }

  if (facebookData.reviewCount < 20) {
    pitchPoints.push('Pocos reviews en Facebook - falta prueba social');
  }

  if (!facebookData.email) {
    pitchPoints.push('No tienes email público - dificultas que te contacten');
  }

  if (pitchPoints.length === 0) {
    pitchPoints.push('Tu presencia en Facebook puede mejorar significativamente');
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: 'Creamos tu presencia digital completa: website + optimización de redes sociales'
  };
}
