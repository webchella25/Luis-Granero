// src/lib/scraper/jobPostingsScraper.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * JOB POSTINGS SCRAPER
 * Busca empresas que están contratando = señal de crecimiento
 * Método gratuito: scraping directo de portales de empleo
 */

/**
 * Buscar ofertas de empleo en Indeed
 */
export async function scrapeIndeedJobs(location, keyword = '', maxResults = 20) {
  console.log(`\n💼 Buscando ofertas en Indeed: ${keyword || 'todas'} en ${location}`);

  try {
    const baseUrl = 'https://www.indeed.com/jobs';
    const params = new URLSearchParams({
      q: keyword,
      l: location,
      limit: 50
    });

    const url = `${baseUrl}?${params}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const jobs = [];

    // Indeed cambia selectores frecuentemente, estos son aproximados
    $('.job_seen_beacon, .jobsearch-SerpJobCard, .resultContent').each((i, el) => {
      if (jobs.length >= maxResults) return;

      const $job = $(el);

      const job = {
        title: $job.find('.jobTitle, h2.jobTitle').text().trim(),
        company: $job.find('.companyName, [data-testid="company-name"]').text().trim(),
        location: $job.find('.companyLocation, [data-testid="text-location"]').text().trim(),
        summary: $job.find('.job-snippet, .summary').text().trim().substring(0, 200),
        salary: $job.find('.salaryText, .salary-snippet').text().trim() || null,
        jobType: $job.find('.metadata, .attribute_snippet').text().trim() || null,
        postedDate: $job.find('.date, .date-a11y').text().trim() || null,
        url: null,
        source: 'indeed'
      };

      // Extraer URL
      const jobLink = $job.find('a[data-jk], h2.jobTitle a').attr('href');
      if (jobLink) {
        job.url = jobLink.startsWith('http') ? jobLink : `https://www.indeed.com${jobLink}`;
      }

      if (job.title && job.company) {
        jobs.push(job);
      }
    });

    console.log(`✅ ${jobs.length} ofertas encontradas en Indeed`);

    return jobs;

  } catch (error) {
    console.error('❌ Error scrapeando Indeed:', error.message);
    return [];
  }
}

/**
 * Buscar ofertas en InfoJobs (España)
 */
export async function scrapeInfoJobsOffers(keyword, location = 'espana', maxResults = 20) {
  console.log(`\n💼 Buscando ofertas en InfoJobs: ${keyword} en ${location}`);

  try {
    // InfoJobs tiene API pero requiere registro
    // Aquí usamos scraping directo (método básico)
    const searchUrl = `https://www.infojobs.net/ofertas-trabajo/${keyword}/${location}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const jobs = [];

    // Selectores aproximados para InfoJobs
    $('article, .offer-item, .job-item').each((i, el) => {
      if (jobs.length >= maxResults) return;

      const $job = $(el);

      const job = {
        title: $job.find('h2, .title, .offer-title').text().trim(),
        company: $job.find('.company-name, .company').text().trim(),
        location: $job.find('.location, .job-location').text().trim(),
        summary: $job.find('.description, .job-description').text().trim().substring(0, 200),
        salary: $job.find('.salary').text().trim() || null,
        contractType: $job.find('.contract-type, .job-type').text().trim() || null,
        postedDate: $job.find('.date, .posted-date').text().trim() || null,
        url: null,
        source: 'infojobs'
      };

      const jobLink = $job.find('a').first().attr('href');
      if (jobLink) {
        job.url = jobLink.startsWith('http') ? jobLink : `https://www.infojobs.net${jobLink}`;
      }

      if (job.title && job.company) {
        jobs.push(job);
      }
    });

    console.log(`✅ ${jobs.length} ofertas encontradas en InfoJobs`);

    return jobs;

  } catch (error) {
    console.error('❌ Error scrapeando InfoJobs:', error.message);
    return [];
  }
}

/**
 * Buscar ofertas en LinkedIn Jobs (método alternativo)
 */
export async function scrapeLinkedInJobs(keyword, location = '', maxResults = 20) {
  console.log(`\n💼 Buscando ofertas en LinkedIn Jobs: ${keyword}`);

  try {
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const jobs = [];

    // Selectores básicos (LinkedIn requiere login para la mayoría de datos)
    $('li.job-result-card, .base-card').each((i, el) => {
      if (jobs.length >= maxResults) return;

      const $job = $(el);

      const job = {
        title: $job.find('.base-search-card__title, h3').text().trim(),
        company: $job.find('.base-search-card__subtitle, h4').text().trim(),
        location: $job.find('.job-search-card__location').text().trim(),
        postedDate: $job.find('time').text().trim() || null,
        url: $job.find('a').first().attr('href') || null,
        source: 'linkedin_jobs'
      };

      if (job.title && job.company) {
        jobs.push(job);
      }
    });

    console.log(`✅ ${jobs.length} ofertas encontradas en LinkedIn Jobs`);
    console.log('⚠️ LinkedIn requiere login para detalles completos');

    return jobs;

  } catch (error) {
    console.error('❌ Error scrapeando LinkedIn Jobs:', error.message);
    return [];
  }
}

/**
 * Agregar empresas por número de ofertas publicadas
 */
export function aggregateCompaniesByJobCount(jobs) {
  const companiesMap = new Map();

  jobs.forEach(job => {
    const companyName = job.company;

    if (!companiesMap.has(companyName)) {
      companiesMap.set(companyName, {
        name: companyName,
        jobs: [],
        totalOpenings: 0,
        locations: new Set(),
        roles: []
      });
    }

    const company = companiesMap.get(companyName);
    company.jobs.push(job);
    company.totalOpenings++;

    if (job.location) {
      company.locations.add(job.location);
    }

    if (job.title) {
      company.roles.push(job.title);
    }
  });

  // Convertir a array y ordenar por número de ofertas
  const companies = Array.from(companiesMap.values()).map(company => ({
    ...company,
    locations: Array.from(company.locations),
    growthIndicator: calculateGrowthIndicator(company)
  }));

  companies.sort((a, b) => b.totalOpenings - a.totalOpenings);

  return companies;
}

/**
 * Calcular indicador de crecimiento basado en ofertas
 */
function calculateGrowthIndicator(company) {
  let score = 0;

  // Muchas ofertas = crecimiento rápido
  if (company.totalOpenings >= 10) {
    score = 'high';
  } else if (company.totalOpenings >= 5) {
    score = 'medium';
  } else {
    score = 'low';
  }

  return score;
}

/**
 * Generar leads desde ofertas de empleo
 */
export async function generateLeadsFromJobPostings(keyword, location, sources = ['indeed', 'infojobs']) {
  console.log('\n═══════════════════════════════════════');
  console.log('💼 GENERACIÓN DE LEADS DESDE OFERTAS DE EMPLEO');
  console.log('═══════════════════════════════════════');
  console.log(`Keyword: ${keyword}`);
  console.log(`Location: ${location}`);
  console.log(`Sources: ${sources.join(', ')}\n`);

  const allJobs = [];

  try {
    // Buscar en Indeed
    if (sources.includes('indeed')) {
      const indeedJobs = await scrapeIndeedJobs(location, keyword, 30);
      allJobs.push(...indeedJobs);

      // Pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Buscar en InfoJobs
    if (sources.includes('infojobs')) {
      const infoJobsJobs = await scrapeInfoJobsOffers(keyword, location, 30);
      allJobs.push(...infoJobsJobs);

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Buscar en LinkedIn Jobs
    if (sources.includes('linkedin')) {
      const linkedInJobs = await scrapeLinkedInJobs(keyword, location, 30);
      allJobs.push(...linkedInJobs);
    }

    console.log(`\n📊 Total ofertas encontradas: ${allJobs.length}`);

    // Agregar por empresa
    const companies = aggregateCompaniesByJobCount(allJobs);

    console.log(`📊 Total empresas únicas: ${companies.length}`);

    // Convertir a leads
    const leads = companies.map(company => ({
      name: company.name,
      category: keyword, // Usar keyword como categoría aproximada
      address: company.locations[0] || location,

      source: 'job_postings',
      searchQuery: keyword,

      // Señales de crecimiento
      growthIndicators: {
        openPositions: company.totalOpenings,
        growthLevel: company.growthIndicator,
        roles: company.roles.slice(0, 5), // Top 5 roles
        multipleLocations: company.locations.length > 1
      },

      // Score alto si están contratando activamente
      opportunityScore: calculateJobPostingsScore(company),

      // Metadata
      jobPostings: company.jobs.map(j => ({
        title: j.title,
        location: j.location,
        postedDate: j.postedDate,
        source: j.source
      }))
    }));

    // Ordenar por opportunity score
    leads.sort((a, b) => b.opportunityScore - a.opportunityScore);

    console.log(`\n✅ ${leads.length} leads generados`);
    console.log('═══════════════════════════════════════\n');

    return {
      leads,
      stats: {
        totalJobs: allJobs.length,
        totalCompanies: companies.length,
        avgJobsPerCompany: (allJobs.length / companies.length).toFixed(1),
        highGrowth: companies.filter(c => c.growthIndicator === 'high').length
      }
    };

  } catch (error) {
    console.error('❌ Error generando leads desde ofertas:', error);
    return {
      leads: [],
      stats: {},
      error: error.message
    };
  }
}

/**
 * Calcular opportunity score basado en actividad de contratación
 */
function calculateJobPostingsScore(company) {
  let score = 60; // Base (empresas que contratan = buen target)

  // Muchas ofertas = alta oportunidad (están creciendo = necesitan servicios)
  if (company.totalOpenings >= 10) {
    score += 30;
  } else if (company.totalOpenings >= 5) {
    score += 20;
  } else if (company.totalOpenings >= 3) {
    score += 10;
  }

  // Múltiples ubicaciones = empresa en expansión
  if (company.locations.length >= 3) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Generar pitch para empresas que están contratando
 */
export function generateJobPostingsPitch(growthIndicators) {
  const pitchPoints = [];

  if (growthIndicators.openPositions >= 5) {
    pitchPoints.push(`Están contratando ${growthIndicators.openPositions} posiciones - clara señal de crecimiento`);
  } else {
    pitchPoints.push(`Están en fase de crecimiento (${growthIndicators.openPositions} posiciones abiertas)`);
  }

  if (growthIndicators.multipleLocations) {
    pitchPoints.push('Expansión a múltiples ubicaciones - necesitan presencia digital escalable');
  }

  if (growthIndicators.growthLevel === 'high') {
    pitchPoints.push('Alto crecimiento = necesidad urgente de presencia digital profesional');
  }

  pitchPoints.push('Empresas en crecimiento necesitan website que soporte su expansión');

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: 'Te ayudamos a escalar tu presencia digital al ritmo de tu crecimiento'
  };
}

/**
 * Analizar actividad de contratación de un negocio
 */
export async function analyzeHiringActivity(businessName) {
  console.log(`\n🔍 Analizando actividad de contratación: ${businessName}`);

  try {
    // Buscar ofertas de esa empresa en múltiples fuentes
    const jobs = [];

    const indeedJobs = await scrapeIndeedJobs('', businessName, 10);
    jobs.push(...indeedJobs);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const infoJobsJobs = await scrapeInfoJobsOffers(businessName, 'espana', 10);
    jobs.push(...infoJobsJobs);

    if (jobs.length === 0) {
      return {
        isHiring: false,
        analysis: {
          message: 'No hay actividad de contratación detectada',
          opportunity: 'BAJA - No están en fase de crecimiento activo',
          priority: 'low'
        }
      };
    }

    // Analizar las ofertas
    const analysis = {
      isHiring: true,
      totalOpenings: jobs.length,
      jobs: jobs.map(j => ({
        title: j.title,
        location: j.location,
        postedDate: j.postedDate
      })),
      growthLevel: jobs.length >= 5 ? 'high' : jobs.length >= 2 ? 'medium' : 'low',
      opportunities: []
    };

    // Generar oportunidades
    if (jobs.length >= 5) {
      analysis.opportunities.push('Empresa en alto crecimiento - necesidad urgente de presencia digital escalable');
    } else if (jobs.length >= 2) {
      analysis.opportunities.push('Empresa creciendo - oportunidad de acompañar su expansión digital');
    }

    analysis.opportunities.push('Empresas contratando necesitan website que atraiga talento');

    return analysis;

  } catch (error) {
    console.error('❌ Error analizando contratación:', error);
    return {
      isHiring: false,
      error: error.message
    };
  }
}
