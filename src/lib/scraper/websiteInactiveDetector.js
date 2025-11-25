// src/lib/scraper/websiteInactiveDetector.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * WEBSITE INACTIVE DETECTOR
 * Detecta si un website está abandonado o inactivo
 */
export async function detectInactiveWebsite(url) {
  if (!url) return null;

  // Normalizar URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log(`\n🔍 Analizando actividad: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const analysis = {
      isInactive: false,
      inactivityScore: 0, // 0-100 (100 = muy inactivo)
      indicators: [],
      lastUpdate: null,
      suggestions: []
    };

    // 1. Detectar copyright antiguo
    const copyrightYear = detectCopyrightYear(html, $);
    if (copyrightYear) {
      const currentYear = new Date().getFullYear();
      const yearsDiff = currentYear - copyrightYear;

      if (yearsDiff >= 3) {
        analysis.indicators.push({
          type: 'copyright',
          severity: 'high',
          message: `Copyright © ${copyrightYear} (hace ${yearsDiff} años)`,
          score: Math.min(yearsDiff * 10, 40)
        });
        analysis.inactivityScore += Math.min(yearsDiff * 10, 40);
      } else if (yearsDiff >= 1) {
        analysis.indicators.push({
          type: 'copyright',
          severity: 'medium',
          message: `Copyright © ${copyrightYear} (hace ${yearsDiff} año${yearsDiff > 1 ? 's' : ''})`,
          score: yearsDiff * 5
        });
        analysis.inactivityScore += yearsDiff * 5;
      }
    }

    // 2. Buscar últimas noticias/blog posts
    const lastBlogPost = detectLastBlogPost($);
    if (lastBlogPost) {
      const monthsOld = lastBlogPost.monthsOld;

      if (monthsOld >= 12) {
        analysis.indicators.push({
          type: 'blog',
          severity: 'high',
          message: `Última entrada del blog hace ${Math.floor(monthsOld / 12)} año${monthsOld >= 24 ? 's' : ''}`,
          score: 25
        });
        analysis.inactivityScore += 25;
      } else if (monthsOld >= 6) {
        analysis.indicators.push({
          type: 'blog',
          severity: 'medium',
          message: `Última entrada del blog hace ${monthsOld} meses`,
          score: 15
        });
        analysis.inactivityScore += 15;
      }

      analysis.lastUpdate = lastBlogPost.date;
    }

    // 3. Detectar "Under Construction" o "Coming Soon"
    if (detectUnderConstruction(html, $)) {
      analysis.indicators.push({
        type: 'construction',
        severity: 'critical',
        message: 'Página "En Construcción" o "Próximamente"',
        score: 50
      });
      analysis.inactivityScore += 50;
    }

    // 4. Detectar enlaces rotos visibles
    const brokenLinks = detectBrokenLinksIndicators($);
    if (brokenLinks > 0) {
      analysis.indicators.push({
        type: 'broken_links',
        severity: 'medium',
        message: `${brokenLinks} enlaces potencialmente rotos`,
        score: Math.min(brokenLinks * 5, 20)
      });
      analysis.inactivityScore += Math.min(brokenLinks * 5, 20);
    }

    // 5. Detectar imágenes rotas
    const brokenImages = detectBrokenImages($);
    if (brokenImages > 0) {
      analysis.indicators.push({
        type: 'broken_images',
        severity: 'medium',
        message: `${brokenImages} imágenes rotas`,
        score: Math.min(brokenImages * 3, 15)
      });
      analysis.inactivityScore += Math.min(brokenImages * 3, 15);
    }

    // 6. Detectar eventos/promociones pasadas
    const outdatedEvents = detectOutdatedEvents($);
    if (outdatedEvents > 0) {
      analysis.indicators.push({
        type: 'events',
        severity: 'medium',
        message: `${outdatedEvents} evento${outdatedEvents > 1 ? 's' : ''} o promoción${outdatedEvents > 1 ? 'es' : ''} vencido${outdatedEvents > 1 ? 's' : ''}`,
        score: 15
      });
      analysis.inactivityScore += 15;
    }

    // 7. Detectar redes sociales inactivas
    const inactiveSocial = await detectInactiveSocialMedia($);
    if (inactiveSocial.length > 0) {
      analysis.indicators.push({
        type: 'social',
        severity: 'low',
        message: `Enlaces a redes sociales que parecen inactivas: ${inactiveSocial.join(', ')}`,
        score: 10
      });
      analysis.inactivityScore += 10;
    }

    // 8. Detectar contenido placeholder/Lorem Ipsum
    if (detectPlaceholderContent(html)) {
      analysis.indicators.push({
        type: 'placeholder',
        severity: 'high',
        message: 'Contiene texto placeholder (Lorem Ipsum)',
        score: 30
      });
      analysis.inactivityScore += 30;
    }

    // 9. Detectar meta tags vacíos o genéricos
    const genericMeta = detectGenericMeta($);
    if (genericMeta.length > 0) {
      analysis.indicators.push({
        type: 'meta',
        severity: 'medium',
        message: `Meta tags genéricos: ${genericMeta.join(', ')}`,
        score: 10
      });
      analysis.inactivityScore += 10;
    }

    // 10. Detectar scripts/plugins obsoletos
    const obsoleteScripts = detectObsoleteScripts(html);
    if (obsoleteScripts.length > 0) {
      analysis.indicators.push({
        type: 'scripts',
        severity: 'medium',
        message: `Scripts obsoletos: ${obsoleteScripts.join(', ')}`,
        score: 15
      });
      analysis.inactivityScore += 15;
    }

    // Determinar si está inactivo
    analysis.inactivityScore = Math.min(analysis.inactivityScore, 100);
    analysis.isInactive = analysis.inactivityScore >= 50;

    // Generar sugerencias
    analysis.suggestions = generateInactivitySuggestions(analysis);

    // Clasificar severidad
    analysis.severity = classifyInactivity(analysis.inactivityScore);

    console.log(`  Inactivity Score: ${analysis.inactivityScore}/100`);
    console.log(`  Estado: ${analysis.isInactive ? 'INACTIVO' : 'ACTIVO'}`);
    console.log(`  Indicadores: ${analysis.indicators.length}`);

    return analysis;

  } catch (error) {
    console.error('❌ Error analizando inactividad:', error.message);
    return null;
  }
}

/**
 * Detectar año de copyright
 */
function detectCopyrightYear(html, $) {
  // Buscar en el HTML
  const copyrightRegex = /©\s*(\d{4})|copyright\s*(\d{4})/i;
  const match = html.match(copyrightRegex);

  if (match) {
    return parseInt(match[1] || match[2]);
  }

  // Buscar en footer
  const footerText = $('footer').text();
  const footerMatch = footerText.match(/©\s*(\d{4})|copyright\s*(\d{4})/i);

  if (footerMatch) {
    return parseInt(footerMatch[1] || footerMatch[2]);
  }

  return null;
}

/**
 * Detectar última entrada de blog
 */
function detectLastBlogPost($) {
  let latestDate = null;

  // Buscar en elementos con fechas comunes
  const dateSelectors = [
    '.post-date',
    '.entry-date',
    '.published',
    'time[datetime]',
    '.date',
    'article time',
    '.blog-date'
  ];

  dateSelectors.forEach(selector => {
    $(selector).each((i, el) => {
      const dateText = $(el).text().trim();
      const datetime = $(el).attr('datetime');

      const dateStr = datetime || dateText;
      const date = parseDate(dateStr);

      if (date && (!latestDate || date > latestDate)) {
        latestDate = date;
      }
    });
  });

  if (latestDate) {
    const now = new Date();
    const diffMs = now - latestDate;
    const monthsOld = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

    return {
      date: latestDate,
      monthsOld
    };
  }

  return null;
}

/**
 * Parse fecha de string
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    // Ignorar
  }

  // Intentar extraer año
  const yearMatch = dateStr.match(/20\d{2}/);
  if (yearMatch) {
    return new Date(yearMatch[0], 0, 1);
  }

  return null;
}

/**
 * Detectar "Under Construction"
 */
function detectUnderConstruction(html, $) {
  const constructionKeywords = [
    'under construction',
    'en construcción',
    'coming soon',
    'próximamente',
    'site under maintenance',
    'sitio en mantenimiento',
    'página en desarrollo'
  ];

  const htmlLower = html.toLowerCase();
  const bodyText = $('body').text().toLowerCase();

  return constructionKeywords.some(keyword =>
    htmlLower.includes(keyword) || bodyText.includes(keyword)
  );
}

/**
 * Detectar enlaces rotos (por href vacíos o #)
 */
function detectBrokenLinksIndicators($) {
  let brokenCount = 0;

  $('a').each((i, el) => {
    const href = $(el).attr('href');

    if (!href || href === '#' || href === '' || href === 'javascript:void(0)') {
      brokenCount++;
    }
  });

  return Math.min(brokenCount, 10); // Max 10 para el conteo
}

/**
 * Detectar imágenes rotas (sin src o src vacío)
 */
function detectBrokenImages($) {
  let brokenCount = 0;

  $('img').each((i, el) => {
    const src = $(el).attr('src');

    if (!src || src === '' || src === '#') {
      brokenCount++;
    }
  });

  return Math.min(brokenCount, 10);
}

/**
 * Detectar eventos o promociones vencidas
 */
function detectOutdatedEvents($) {
  let outdatedCount = 0;
  const now = new Date();

  // Buscar fechas en el contenido
  const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g;
  const bodyText = $('body').text();
  const dates = bodyText.match(dateRegex) || [];

  dates.forEach(dateStr => {
    const date = parseDate(dateStr);
    if (date && date < now) {
      // Fecha pasada encontrada
      outdatedCount++;
    }
  });

  return Math.min(outdatedCount, 5);
}

/**
 * Detectar redes sociales inactivas (links rotos)
 */
async function detectInactiveSocialMedia($) {
  const inactiveSocial = [];

  const socialLinks = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';

    if (href.includes('facebook.com') && !socialLinks.includes('Facebook')) {
      socialLinks.push('Facebook');
    }
    if (href.includes('twitter.com') && !socialLinks.includes('Twitter')) {
      socialLinks.push('Twitter');
    }
    if (href.includes('instagram.com') && !socialLinks.includes('Instagram')) {
      socialLinks.push('Instagram');
    }
  });

  // Por ahora solo retornamos vacío
  // En una implementación completa, se verificaría si los perfiles existen
  return inactiveSocial;
}

/**
 * Detectar contenido placeholder
 */
function detectPlaceholderContent(html) {
  const placeholderKeywords = [
    'lorem ipsum',
    'dolor sit amet',
    'consectetur adipiscing',
    'sample text',
    'placeholder text',
    'texto de ejemplo'
  ];

  const htmlLower = html.toLowerCase();

  return placeholderKeywords.some(keyword => htmlLower.includes(keyword));
}

/**
 * Detectar meta tags genéricos
 */
function detectGenericMeta($) {
  const generic = [];

  const title = $('title').text().toLowerCase();
  if (!title || title.includes('untitled') || title.includes('sin título')) {
    generic.push('título');
  }

  const description = $('meta[name="description"]').attr('content');
  if (!description || description.toLowerCase().includes('describe')) {
    generic.push('descripción');
  }

  return generic;
}

/**
 * Detectar scripts obsoletos
 */
function detectObsoleteScripts(html) {
  const obsolete = [];

  // jQuery muy antiguo
  if (html.includes('jquery/1.') || html.includes('jquery-1.')) {
    obsolete.push('jQuery 1.x');
  }

  // Flash
  if (html.includes('flash') || html.includes('.swf')) {
    obsolete.push('Flash');
  }

  // Silverlight
  if (html.includes('silverlight')) {
    obsolete.push('Silverlight');
  }

  return obsolete;
}

/**
 * Generar sugerencias basadas en indicadores
 */
function generateInactivitySuggestions(analysis) {
  const suggestions = [];

  if (analysis.inactivityScore >= 70) {
    suggestions.push({
      priority: 'critical',
      message: 'Website parece completamente abandonado',
      action: 'Rediseño completo recomendado'
    });
  } else if (analysis.inactivityScore >= 50) {
    suggestions.push({
      priority: 'high',
      message: 'Website muestra señales claras de abandono',
      action: 'Actualización urgente de contenido y diseño'
    });
  } else if (analysis.inactivityScore >= 30) {
    suggestions.push({
      priority: 'medium',
      message: 'Website necesita actualización',
      action: 'Revisar y actualizar contenido antiguo'
    });
  }

  analysis.indicators.forEach(indicator => {
    if (indicator.type === 'copyright') {
      suggestions.push({
        priority: 'medium',
        message: 'Copyright desactualizado',
        action: 'Actualizar año de copyright en el footer'
      });
    }

    if (indicator.type === 'blog') {
      suggestions.push({
        priority: 'high',
        message: 'Blog abandonado',
        action: 'Publicar contenido nuevo regularmente'
      });
    }

    if (indicator.type === 'placeholder') {
      suggestions.push({
        priority: 'critical',
        message: 'Contenido placeholder visible',
        action: 'Reemplazar todo el contenido de prueba'
      });
    }
  });

  return suggestions;
}

/**
 * Clasificar severidad de inactividad
 */
function classifyInactivity(score) {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}
