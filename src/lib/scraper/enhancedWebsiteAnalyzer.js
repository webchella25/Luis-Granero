// src/lib/scraper/enhancedWebsiteAnalyzer.js
import { analyzeWebsite as basicAnalyze } from '@/lib/scrapers/websiteAnalyzer';
import { detectTechStack } from './techStackDetector';
import { detectInactiveWebsite } from './websiteInactiveDetector';

/**
 * ENHANCED WEBSITE ANALYZER
 * Análisis completo que combina:
 * - Análisis básico (velocidad, SEO, mobile, SSL)
 * - Tech Stack (CMS, framework, hosting, plugins)
 * - Detección de inactividad (copyright, blog, eventos)
 */
export async function enhancedWebsiteAnalysis(url) {
  if (!url) return null;

  console.log('\n═══════════════════════════════════════');
  console.log('🔬 ANÁLISIS COMPLETO DE WEBSITE');
  console.log('═══════════════════════════════════════');
  console.log(`URL: ${url}\n`);

  try {
    // Ejecutar análisis en paralelo para ser más rápido
    const [basicAnalysis, techStack, inactivity] = await Promise.all([
      basicAnalyze(url).catch(err => {
        console.error('Error en análisis básico:', err.message);
        return null;
      }),
      detectTechStack(url).catch(err => {
        console.error('Error en tech stack:', err.message);
        return null;
      }),
      detectInactiveWebsite(url).catch(err => {
        console.error('Error en detección de inactividad:', err.message);
        return null;
      })
    ]);

    // Calcular score final mejorado
    const finalScore = calculateEnhancedScore(basicAnalysis, techStack, inactivity);

    // Generar problemas encontrados
    const allIssues = generateAllIssues(basicAnalysis, techStack, inactivity);

    // Generar recomendaciones prioritarias
    const recommendations = generatePrioritizedRecommendations(basicAnalysis, techStack, inactivity);

    // Clasificar oportunidad
    const opportunityLevel = classifyOpportunity(finalScore, allIssues);

    // Generar pitch personalizado
    const pitch = generatePersonalizedPitch(basicAnalysis, techStack, inactivity, allIssues);

    const result = {
      // Análisis básico
      basic: basicAnalysis,

      // Tech stack
      techStack: techStack,

      // Inactividad
      inactivity: inactivity,

      // Score final (0-100)
      finalScore,

      // Todos los problemas encontrados
      issues: allIssues,

      // Recomendaciones priorizadas
      recommendations,

      // Nivel de oportunidad
      opportunityLevel,

      // Pitch personalizado
      pitch,

      // Timestamp
      analyzedAt: new Date()
    };

    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMEN DE ANÁLISIS');
    console.log('═══════════════════════════════════════');
    console.log(`Score Final: ${finalScore}/100`);
    console.log(`Nivel de Oportunidad: ${opportunityLevel.toUpperCase()}`);
    console.log(`Problemas Encontrados: ${allIssues.length}`);
    console.log(`Recomendaciones: ${recommendations.length}`);
    console.log('═══════════════════════════════════════\n');

    return result;

  } catch (error) {
    console.error('❌ Error en análisis completo:', error);
    return null;
  }
}

/**
 * Calcular score final mejorado
 */
function calculateEnhancedScore(basic, tech, inactive) {
  let score = 50; // Base

  // 1. Análisis básico (peso: 30%)
  if (basic) {
    const basicWeight = 0.3;
    score += (basic.score * basicWeight);
  }

  // 2. Tech stack (peso: 30%)
  if (tech) {
    let techScore = 100;

    // Penalizar tech obsoleto
    if (tech.obsolete && tech.obsolete.length > 0) {
      tech.obsolete.forEach(obs => {
        if (obs.severity === 'critical') techScore -= 40;
        else if (obs.severity === 'high') techScore -= 25;
        else if (obs.severity === 'medium') techScore -= 15;
      });
    }

    // Penalizar CMS propietario
    if (tech.cms?.isPropretary) {
      techScore -= 20;
    }

    // Penalizar hosting de baja calidad
    if (tech.hosting?.quality === 'low') {
      techScore -= 15;
    }

    // Penalizar falta de analytics
    if (!tech.analytics) {
      techScore -= 10;
    }

    const techWeight = 0.3;
    score += (Math.max(0, techScore) * techWeight);
  }

  // 3. Inactividad (peso: 40%)
  if (inactive) {
    const inactivityWeight = 0.4;
    const inactivityContribution = (100 - inactive.inactivityScore) * inactivityWeight;
    score += inactivityContribution;
  }

  // Invertir: score bajo = alta oportunidad
  const opportunityScore = 100 - Math.max(0, Math.min(100, score));

  return Math.round(opportunityScore);
}

/**
 * Generar todos los problemas encontrados
 */
function generateAllIssues(basic, tech, inactive) {
  const issues = [];

  // Problemas básicos
  if (basic?.issues) {
    basic.issues.forEach(issue => {
      issues.push({
        category: 'basic',
        severity: determineSeverity(issue),
        message: issue
      });
    });
  }

  // Problemas de tech stack
  if (tech?.obsolete) {
    tech.obsolete.forEach(obs => {
      issues.push({
        category: 'tech',
        severity: obs.severity,
        message: obs.reason,
        tech: obs.tech
      });
    });
  }

  // Problemas de inactividad
  if (inactive?.indicators) {
    inactive.indicators.forEach(ind => {
      issues.push({
        category: 'inactive',
        severity: ind.severity,
        message: ind.message
      });
    });
  }

  // Ordenar por severidad
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

/**
 * Determinar severidad de un issue básico
 */
function determineSeverity(issueText) {
  const lower = issueText.toLowerCase();

  if (lower.includes('frames') || lower.includes('tabla')) return 'critical';
  if (lower.includes('ssl') || lower.includes('móvil')) return 'high';
  if (lower.includes('lenta') || lower.includes('seo')) return 'medium';
  return 'low';
}

/**
 * Generar recomendaciones priorizadas
 */
function generatePrioritizedRecommendations(basic, tech, inactive) {
  const recs = [];

  // De tech stack
  if (tech?.recommendations) {
    tech.recommendations.forEach(rec => {
      recs.push({
        ...rec,
        source: 'tech'
      });
    });
  }

  // De inactividad
  if (inactive?.suggestions) {
    inactive.suggestions.forEach(sug => {
      recs.push({
        ...sug,
        source: 'inactive'
      });
    });
  }

  // Recomendaciones básicas
  if (basic) {
    if (!basic.hasMobile) {
      recs.push({
        priority: 'critical',
        message: 'Website no es responsive',
        action: 'Rediseño responsive urgente',
        source: 'basic'
      });
    }

    if (!basic.hasSSL) {
      recs.push({
        priority: 'critical',
        message: 'Sin certificado SSL',
        action: 'Instalar Let\'s Encrypt SSL',
        source: 'basic'
      });
    }

    if (basic.loadTime > 5000) {
      recs.push({
        priority: 'high',
        message: 'Website muy lento',
        action: 'Optimización de velocidad y hosting',
        source: 'basic'
      });
    }
  }

  // Ordenar por prioridad
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}

/**
 * Clasificar nivel de oportunidad
 */
function classifyOpportunity(score, issues) {
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;

  if (score >= 80 || criticalIssues >= 2) {
    return 'CRITICAL'; // Oportunidad crítica
  } else if (score >= 60 || highIssues >= 3) {
    return 'HIGH'; // Alta oportunidad
  } else if (score >= 40) {
    return 'MEDIUM'; // Oportunidad media
  } else {
    return 'LOW'; // Baja oportunidad
  }
}

/**
 * Generar pitch personalizado
 */
function generatePersonalizedPitch(basic, tech, inactive, issues) {
  const pitchPoints = [];

  // Inactividad
  if (inactive && inactive.isInactive) {
    if (inactive.inactivityScore >= 70) {
      pitchPoints.push('Tu website parece abandonado desde hace tiempo');
    } else {
      pitchPoints.push('Tu website necesita actualización urgente');
    }
  }

  // Tech obsoleto
  if (tech?.obsolete && tech.obsolete.length > 0) {
    const criticalTech = tech.obsolete.filter(o => o.severity === 'critical');
    if (criticalTech.length > 0) {
      pitchPoints.push(`Usas tecnología obsoleta: ${criticalTech[0].tech}`);
    }
  }

  // CMS propietario
  if (tech?.cms?.isPropretary) {
    pitchPoints.push(`Estás atado a ${tech.cms.name}, sin control total de tu sitio`);
  }

  // Sin mobile
  if (basic && !basic.hasMobile) {
    pitchPoints.push('Tu sitio no funciona en móviles (pierdes 60% de tráfico)');
  }

  // Sin SSL
  if (basic && !basic.hasSSL) {
    pitchPoints.push('Sin HTTPS: Google penaliza tu SEO y asusta a clientes');
  }

  // Lento
  if (basic && basic.loadTime > 5000) {
    pitchPoints.push(`Tu web tarda ${(basic.loadTime / 1000).toFixed(1)}s en cargar (pierdes visitas)`);
  }

  // Sin analytics
  if (tech && !tech.analytics) {
    pitchPoints.push('No tienes forma de medir visitas ni conversiones');
  }

  // Hosting barato
  if (tech?.hosting?.quality === 'low') {
    pitchPoints.push(`Hosting de baja calidad (${tech.hosting.provider}) afecta tu velocidad`);
  }

  // Si no hay puntos específicos, mensaje genérico
  if (pitchPoints.length === 0) {
    pitchPoints.push('Tu presencia online puede mejorar significativamente');
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: generateCTA(pitchPoints)
  };
}

/**
 * Generar Call To Action personalizado
 */
function generateCTA(pitchPoints) {
  if (pitchPoints.some(p => p.includes('abandonado'))) {
    return 'Te ayudamos a revivir tu presencia online con un sitio moderno';
  }

  if (pitchPoints.some(p => p.includes('obsoleto') || p.includes('móviles'))) {
    return 'Modernizamos tu website con tecnología actual';
  }

  if (pitchPoints.some(p => p.includes('lento') || p.includes('hosting'))) {
    return 'Optimizamos tu sitio para velocidad y conversiones';
  }

  return 'Mejoramos tu presencia digital de forma profesional';
}
