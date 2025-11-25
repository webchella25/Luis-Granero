// src/lib/scraper/linkedinScraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * LINKEDIN SCRAPER
 * Método alternativo gratuito (sin API oficial)
 * Extrae información pública de perfiles y páginas de empresa
 */

/**
 * Buscar empresas en LinkedIn por Google Search
 * (LinkedIn limita mucho el scraping directo, usamos Google)
 */
export async function searchLinkedInCompanies(companyName, maxResults = 5) {
  console.log(`\n🔍 Buscando "${companyName}" en LinkedIn...`);

  try {
    // Buscar en Google con site:linkedin.com
    const searchQuery = `site:linkedin.com/company ${companyName}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    const response = await axios.get(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extraer URLs de LinkedIn de los resultados de Google
    $('a').each((i, el) => {
      const href = $(el).attr('href');

      if (href && href.includes('linkedin.com/company/')) {
        // Extraer URL limpia
        const match = href.match(/linkedin\.com\/company\/([^/&?]+)/);
        if (match && !results.includes(match[1])) {
          results.push(match[1]);
        }
      }
    });

    const companies = results.slice(0, maxResults).map(slug => ({
      name: companyName,
      slug: slug,
      url: `https://www.linkedin.com/company/${slug}`,
      source: 'linkedin_search'
    }));

    console.log(`✅ ${companies.length} perfiles encontrados`);

    return companies;

  } catch (error) {
    console.error('❌ Error buscando en LinkedIn:', error.message);
    return [];
  }
}

/**
 * Extraer información básica de una página de empresa de LinkedIn
 * NOTA: LinkedIn bloquea mucho scraping. Esta es una versión básica.
 */
export async function scrapeLinkedInCompanyBasic(companySlug) {
  console.log(`\n📊 Extrayendo info de: linkedin.com/company/${companySlug}`);

  try {
    const url = `https://www.linkedin.com/company/${companySlug}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extraer datos disponibles públicamente
    // NOTA: LinkedIn cambia su HTML frecuentemente, estos selectores pueden fallar
    const company = {
      slug: companySlug,
      url: url,
      name: null,
      industry: null,
      size: null,
      website: null,
      about: null,
      followers: null,
      employees: null,
      source: 'linkedin',
      scrapedAt: new Date()
    };

    // Intentar extraer nombre
    const titleTag = $('title').text();
    if (titleTag) {
      const match = titleTag.match(/^([^|]+)/);
      company.name = match ? match[1].trim() : null;
    }

    // Intentar extraer website (en meta tags)
    const websiteMeta = $('meta[property="og:url"]').attr('content');
    if (websiteMeta && !websiteMeta.includes('linkedin.com')) {
      company.website = websiteMeta;
    }

    // IMPORTANTE: LinkedIn requiere login para ver la mayoría de datos
    // Esta info es muy limitada sin autenticación

    console.log('⚠️ Datos limitados (LinkedIn requiere login para más info)');
    console.log(`   Nombre: ${company.name || 'N/A'}`);
    console.log(`   Website: ${company.website || 'N/A'}`);

    return company;

  } catch (error) {
    console.error('❌ Error scrapeando LinkedIn:', error.message);
    return null;
  }
}

/**
 * Método alternativo: Usar Apify para LinkedIn (de pago pero más efectivo)
 * Solo si el usuario configura APIFY_API_TOKEN
 */
export async function scrapeLinkedInWithApify(companyName, maxResults = 5) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;

  if (!API_TOKEN) {
    console.warn('⚠️ APIFY_API_TOKEN no configurada');
    console.log('💡 Usando método gratuito alternativo...');
    return await searchLinkedInCompanies(companyName, maxResults);
  }

  console.log(`\n📊 Buscando empresas en LinkedIn (Apify): ${companyName}`);

  try {
    const { ApifyClient } = await import('apify-client');
    const client = new ApifyClient({ token: API_TOKEN });

    const input = {
      searchUrls: [`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(companyName)}`],
      maxResults: maxResults
    };

    // Usar actor de LinkedIn Companies
    const run = await client.actor('apify/linkedin-company-scraper').call(input, {
      waitSecs: 120
    });

    if (run.status !== 'SUCCEEDED') {
      throw new Error(`Actor falló: ${run.status}`);
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`✅ ${items.length} empresas obtenidas`);

    return items.map(item => ({
      name: item.name,
      slug: item.linkedInUrl ? extractSlugFromUrl(item.linkedInUrl) : null,
      url: item.linkedInUrl,
      website: item.website,
      industry: item.industry,
      size: item.companySize,
      followers: item.followers,
      about: item.description,
      headquarters: item.headquarters,
      founded: item.founded,
      source: 'linkedin_apify',
      scrapedAt: new Date()
    }));

  } catch (error) {
    console.error('❌ Error con Apify LinkedIn:', error.message);
    console.log('💡 Cayendo a método gratuito...');
    return await searchLinkedInCompanies(companyName, maxResults);
  }
}

/**
 * Extraer slug de URL de LinkedIn
 */
function extractSlugFromUrl(url) {
  if (!url) return null;

  const match = url.match(/linkedin\.com\/company\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Generar email pattern basado en nombre de empresa
 * (útil cuando no encontramos el email directamente)
 */
export function generateLinkedInEmailPatterns(companyName, domain) {
  if (!domain) return [];

  // Normalizar nombre de empresa
  const normalized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const patterns = [
    `info@${domain}`,
    `contact@${domain}`,
    `hello@${domain}`,
    `careers@${domain}`,
    `jobs@${domain}`,
    `hr@${domain}`,
    `recruiting@${domain}`,
    `talent@${domain}`
  ];

  return patterns;
}

/**
 * Analizar presencia de LinkedIn de un negocio
 */
export async function analyzeLinkedInPresence(businessName) {
  console.log(`\n🔍 Analizando presencia en LinkedIn: ${businessName}`);

  try {
    // Intentar con Apify primero, luego fall back a búsqueda gratuita
    const companies = await scrapeLinkedInWithApify(businessName, 3);

    if (companies.length === 0) {
      return {
        hasPresence: false,
        analysis: {
          message: 'No se encontró presencia en LinkedIn',
          opportunity: 'MEDIA - Crear página de empresa en LinkedIn',
          priority: 'medium',
          benefits: [
            'Aumentar credibilidad B2B',
            'Atraer talento',
            'Networking profesional',
            'Generar leads corporativos'
          ]
        }
      };
    }

    // Buscar mejor coincidencia
    const exactMatch = companies.find(c =>
      c.name?.toLowerCase() === businessName.toLowerCase()
    );

    const bestMatch = exactMatch || companies[0];

    // Analizar
    const analysis = {
      hasPresence: true,
      company: bestMatch,
      metrics: {
        followers: bestMatch.followers || 'N/A',
        employees: bestMatch.size || 'N/A',
        industry: bestMatch.industry || 'N/A'
      },
      issues: [],
      opportunities: []
    };

    // Identificar problemas
    if (!bestMatch.website) {
      analysis.issues.push({
        severity: 'medium',
        message: 'No tiene website en su perfil de LinkedIn',
        impact: 'Pierden tráfico B2B potencial'
      });
      analysis.opportunities.push('Agregar website a LinkedIn');
    }

    if (!bestMatch.about || bestMatch.about.length < 100) {
      analysis.issues.push({
        severity: 'low',
        message: 'Descripción de empresa incompleta o vacía',
        impact: 'Menor credibilidad profesional'
      });
      analysis.opportunities.push('Completar descripción de empresa');
    }

    if (!bestMatch.followers || bestMatch.followers < 100) {
      analysis.issues.push({
        severity: 'low',
        message: 'Pocos seguidores en LinkedIn',
        impact: 'Baja visibilidad en comunidad profesional'
      });
      analysis.opportunities.push('Estrategia de crecimiento en LinkedIn');
    }

    return analysis;

  } catch (error) {
    console.error('❌ Error analizando LinkedIn:', error);
    return {
      hasPresence: false,
      error: error.message
    };
  }
}

/**
 * Generar leads de LinkedIn
 */
export async function generateLinkedInLeads(keyword, maxResults = 10) {
  console.log('\n═══════════════════════════════════════');
  console.log('💼 GENERACIÓN DE LEADS DESDE LINKEDIN');
  console.log('═══════════════════════════════════════');
  console.log(`Keyword: ${keyword}`);
  console.log(`Max resultados: ${maxResults}\n`);

  try {
    const companies = await scrapeLinkedInWithApify(keyword, maxResults);

    // Convertir a formato de leads
    const leads = companies.map(company => {
      // Extraer dominio del website si existe
      let domain = null;
      if (company.website) {
        try {
          const url = new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`);
          domain = url.hostname.replace('www.', '');
        } catch (e) {
          // Ignorar
        }
      }

      return {
        name: company.name,
        website: company.website,
        domain: domain,

        // Email patterns (no emails reales sin Hunter.io)
        possibleEmails: domain ? generateLinkedInEmailPatterns(company.name, domain) : [],

        socialMedia: {
          linkedin: company.url,
          facebook: null,
          instagram: null,
          twitter: null
        },

        category: company.industry,
        description: company.about,

        source: 'linkedin',
        searchQuery: keyword,
        opportunityScore: calculateLinkedInScore(company),

        // Metadata específica de LinkedIn
        linkedInData: {
          slug: company.slug,
          followers: company.followers,
          size: company.size,
          headquarters: company.headquarters,
          founded: company.founded
        }
      };
    });

    console.log(`✅ ${leads.length} leads generados desde LinkedIn`);
    console.log('═══════════════════════════════════════\n');

    return leads;

  } catch (error) {
    console.error('❌ Error generando leads de LinkedIn:', error);
    return [];
  }
}

/**
 * Calcular opportunity score para LinkedIn
 */
function calculateLinkedInScore(company) {
  let score = 40; // Base más bajo (LinkedIn es B2B, menor urgencia)

  // Sin website = oportunidad
  if (!company.website) {
    score += 30;
  }

  // Descripción vacía/corta
  if (!company.about || company.about.length < 100) {
    score += 15;
  }

  // Pocos followers
  if (!company.followers || company.followers < 100) {
    score += 10;
  }

  // Empresa pequeña (más accesible)
  if (company.size && (company.size.includes('1-10') || company.size.includes('11-50'))) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Generar pitch para leads de LinkedIn
 */
export function generateLinkedInPitch(linkedInData) {
  const pitchPoints = [];

  if (!linkedInData.website) {
    pitchPoints.push('Tu empresa no tiene website listado en LinkedIn - pierdes credibilidad B2B');
  }

  if (!linkedInData.about || linkedInData.about.length < 100) {
    pitchPoints.push('Descripción incompleta en LinkedIn - menor credibilidad profesional');
  }

  if (linkedInData.followers && linkedInData.followers < 100) {
    pitchPoints.push(`Solo ${linkedInData.followers} seguidores en LinkedIn - baja visibilidad profesional`);
  }

  if (linkedInData.size && (linkedInData.size.includes('1-10') || linkedInData.size.includes('11-50'))) {
    pitchPoints.push('Como empresa pequeña, una presencia digital fuerte te ayudará a competir');
  }

  if (pitchPoints.length === 0) {
    pitchPoints.push('Tu presencia en LinkedIn puede optimizarse para generar más leads B2B');
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: 'Optimizamos tu presencia digital B2B: website profesional + LinkedIn optimizado'
  };
}
