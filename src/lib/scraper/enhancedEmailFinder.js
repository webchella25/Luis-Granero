// src/lib/scraper/enhancedEmailFinder.js
import { findContactEmails, findAllEmails } from './emailFinder.js';
import { verifyFoundEmails, classifyEmailsByPriority, getBestEmails } from './emailVerifier.js';

/**
 * ENHANCED EMAIL FINDER
 * Combina búsqueda + verificación automática
 */

/**
 * Buscar y verificar emails de un negocio
 */
export async function findAndVerifyEmails(website, businessName) {
  console.log('\n═══════════════════════════════════════');
  console.log('📧 BÚSQUEDA Y VERIFICACIÓN DE EMAILS');
  console.log('═══════════════════════════════════════');
  console.log(`Negocio: ${businessName}`);
  console.log(`Website: ${website}\n`);

  try {
    // 1. Buscar emails (método existente)
    console.log('🔍 Paso 1: Buscando emails...');
    const foundEmails = await findContactEmails(website, businessName);

    if (foundEmails.length === 0) {
      console.log('⚠️ No se encontraron emails');
      return {
        found: [],
        verified: [],
        best: [],
        priority: { high: [], medium: [], low: [] },
        stats: {
          found: 0,
          valid: 0,
          validRate: '0%'
        }
      };
    }

    console.log(`✅ ${foundEmails.length} emails encontrados\n`);

    // 2. Verificar emails
    console.log('🔬 Paso 2: Verificando emails...');
    const verification = await verifyFoundEmails(foundEmails);

    // 3. Clasificar por prioridad
    const priority = classifyEmailsByPriority(verification.valid);

    // 4. Obtener los 5 mejores
    const best = await getBestEmails(foundEmails, 5);

    console.log('\n✅ VERIFICACIÓN COMPLETA');
    console.log('═══════════════════════════════════════\n');

    return {
      found: foundEmails,
      verified: verification.valid.map(v => v.email),
      personal: verification.personal.map(v => v.email),
      generic: verification.generic.map(v => v.email),
      best: best.map(b => b.email),
      priority,
      stats: verification.stats,
      fullVerification: verification.all // Detalles completos
    };

  } catch (error) {
    console.error('❌ Error en búsqueda/verificación de emails:', error);
    return {
      found: [],
      verified: [],
      best: [],
      priority: { high: [], medium: [], low: [] },
      stats: { found: 0, valid: 0, validRate: '0%' },
      error: error.message
    };
  }
}

/**
 * Buscar emails de múltiples negocios en batch
 */
export async function findAndVerifyEmailsBatch(businesses) {
  console.log(`\n🔄 Procesando ${businesses.length} negocios...\n`);

  const results = [];

  for (const business of businesses) {
    const result = await findAndVerifyEmails(
      business.website,
      business.name
    );

    results.push({
      business: business.name,
      website: business.website,
      ...result
    });

    // Pequeña pausa para no saturar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Estadísticas generales
  const totalFound = results.reduce((sum, r) => sum + r.found.length, 0);
  const totalValid = results.reduce((sum, r) => sum + r.verified.length, 0);

  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESUMEN BATCH');
  console.log('═══════════════════════════════════════');
  console.log(`Negocios procesados: ${businesses.length}`);
  console.log(`Emails encontrados: ${totalFound}`);
  console.log(`Emails válidos: ${totalValid}`);
  console.log(`Tasa de validez: ${((totalValid / totalFound) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  return {
    results,
    summary: {
      businesses: businesses.length,
      totalFound,
      totalValid,
      validRate: `${((totalValid / totalFound) * 100).toFixed(1)}%`
    }
  };
}

/**
 * Enriquecer un lead existente con emails verificados
 */
export async function enrichLeadWithVerifiedEmails(lead) {
  if (!lead.website) {
    console.log(`⚠️ Lead ${lead.name} no tiene website`);
    return null;
  }

  console.log(`\n📧 Enriqueciendo lead: ${lead.name}`);

  const emailData = await findAndVerifyEmails(lead.website, lead.name);

  // Actualizar estructura del lead
  const enrichedLead = {
    ...lead,
    possibleEmails: emailData.verified,
    webAnalysis: {
      ...lead.webAnalysis,
      hasEmail: emailData.verified.length > 0,
      emails: emailData.best
    },
    emailVerification: {
      found: emailData.found.length,
      verified: emailData.verified.length,
      personal: emailData.personal?.length || 0,
      generic: emailData.generic?.length || 0,
      bestEmails: emailData.best,
      priority: emailData.priority
    }
  };

  return enrichedLead;
}

/**
 * Obtener email de contacto recomendado
 */
export function getRecommendedContactEmail(emailData) {
  // Prioridad:
  // 1. Email personal de alta prioridad
  if (emailData.priority?.high?.length > 0) {
    return {
      email: emailData.priority.high[0],
      type: 'personal',
      confidence: 'high'
    };
  }

  // 2. Email de prioridad media
  if (emailData.priority?.medium?.length > 0) {
    return {
      email: emailData.priority.medium[0],
      type: 'generic',
      confidence: 'medium'
    };
  }

  // 3. Mejor email disponible
  if (emailData.best?.length > 0) {
    return {
      email: emailData.best[0],
      type: 'unknown',
      confidence: 'low'
    };
  }

  return null;
}

/**
 * Generar reporte de emails para un lead
 */
export function generateEmailReport(emailData) {
  const report = {
    summary: `${emailData.verified.length}/${emailData.found.length} emails válidos`,
    sections: []
  };

  if (emailData.personal?.length > 0) {
    report.sections.push({
      title: '✨ Emails Personales (Alta Prioridad)',
      emails: emailData.personal,
      recommendation: 'Usar estos primero para contacto directo'
    });
  }

  if (emailData.generic?.length > 0) {
    report.sections.push({
      title: '📬 Emails Genéricos',
      emails: emailData.generic,
      recommendation: 'Usar como alternativa si los personales no responden'
    });
  }

  if (emailData.priority?.low?.length > 0) {
    report.sections.push({
      title: '⚠️ Emails de Baja Confianza',
      emails: emailData.priority.low,
      recommendation: 'Verificar manualmente antes de usar'
    });
  }

  return report;
}
