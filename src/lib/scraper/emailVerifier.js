// src/lib/scraper/emailVerifier.js
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * EMAIL VERIFIER (100% FREE)
 * Verifica emails sin usar APIs de pago
 */

// Lista de dominios de emails temporales/desechables
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
  'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc',
  'yopmail.com', 'fakeinbox.com', 'trashmail.com', 'dispostable.com',
  'tempr.email', 'sharklasers.com', 'guerrillamail.info'
];

// Emails genéricos que no son contactos personales
const ROLE_BASED_EMAILS = [
  'info', 'admin', 'support', 'sales', 'contact', 'hello', 'mail',
  'office', 'team', 'help', 'service', 'noreply', 'no-reply', 'webmaster'
];

/**
 * Verificar un email completo
 */
export async function verifyEmail(email) {
  if (!email) {
    return {
      email,
      isValid: false,
      score: 0,
      checks: {
        format: false,
        domain: false,
        mxRecords: false,
        isDisposable: true,
        isRoleBased: false
      },
      recommendation: 'Email vacío'
    };
  }

  email = email.toLowerCase().trim();

  const checks = {
    format: false,
    domain: false,
    mxRecords: false,
    isDisposable: false,
    isRoleBased: false
  };

  // 1. Validar formato con regex
  checks.format = validateEmailFormat(email);

  if (!checks.format) {
    return {
      email,
      isValid: false,
      score: 0,
      checks,
      recommendation: 'Formato de email inválido'
    };
  }

  // 2. Extraer dominio
  const domain = email.split('@')[1];
  const localPart = email.split('@')[0];

  if (!domain) {
    return {
      email,
      isValid: false,
      score: 0,
      checks,
      recommendation: 'Dominio no encontrado'
    };
  }

  checks.domain = true;

  // 3. Verificar si es email desechable
  checks.isDisposable = isDisposableEmail(domain);

  // 4. Verificar si es role-based (genérico)
  checks.isRoleBased = isRoleBasedEmail(localPart);

  // 5. Verificar MX records del dominio (asíncrono)
  checks.mxRecords = await verifyMXRecords(domain);

  // Calcular score
  const score = calculateEmailScore(checks);

  // Validez general
  const isValid = score >= 50;

  // Generar recomendación
  const recommendation = generateRecommendation(checks, score);

  return {
    email,
    isValid,
    score,
    checks,
    recommendation,
    domain,
    localPart
  };
}

/**
 * Verificar múltiples emails
 */
export async function verifyMultipleEmails(emails) {
  if (!emails || emails.length === 0) {
    return [];
  }

  console.log(`\n📧 Verificando ${emails.length} emails...`);

  const results = await Promise.all(
    emails.map(email => verifyEmail(email))
  );

  // Filtrar solo válidos
  const validEmails = results.filter(r => r.isValid);
  const invalidEmails = results.filter(r => !r.isValid);

  console.log(`✅ Válidos: ${validEmails.length}`);
  console.log(`❌ Inválidos: ${invalidEmails.length}`);

  // Ordenar por score
  validEmails.sort((a, b) => b.score - a.score);

  return {
    all: results,
    valid: validEmails,
    invalid: invalidEmails,
    stats: {
      total: emails.length,
      valid: validEmails.length,
      invalid: invalidEmails.length,
      validRate: (validEmails.length / emails.length * 100).toFixed(1) + '%'
    }
  };
}

/**
 * 1. Validar formato con regex
 */
function validateEmailFormat(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * 2. Verificar si es email desechable
 */
function isDisposableEmail(domain) {
  return DISPOSABLE_DOMAINS.some(disposable =>
    domain.includes(disposable)
  );
}

/**
 * 3. Verificar si es role-based (genérico)
 */
function isRoleBasedEmail(localPart) {
  return ROLE_BASED_EMAILS.some(role =>
    localPart === role || localPart.startsWith(role + '.')
  );
}

/**
 * 4. Verificar MX records (DNS)
 */
async function verifyMXRecords(domain) {
  try {
    const mxRecords = await resolveMx(domain);

    if (mxRecords && mxRecords.length > 0) {
      console.log(`  ✅ ${domain}: ${mxRecords.length} MX records`);
      return true;
    }

    console.log(`  ⚠️ ${domain}: Sin MX records`);
    return false;

  } catch (error) {
    // Si falla el DNS, puede ser temporal o dominio no existe
    console.log(`  ❌ ${domain}: Error DNS - ${error.code}`);
    return false;
  }
}

/**
 * Calcular score del email (0-100)
 */
function calculateEmailScore(checks) {
  let score = 0;

  // Formato válido: +30
  if (checks.format) score += 30;

  // Dominio válido: +20
  if (checks.domain) score += 20;

  // MX records válidos: +40 (muy importante)
  if (checks.mxRecords) score += 40;

  // Penalizaciones:
  // Email desechable: -50
  if (checks.isDisposable) score -= 50;

  // Email role-based: -10 (no es tan grave)
  if (checks.isRoleBased) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generar recomendación
 */
function generateRecommendation(checks, score) {
  if (!checks.format) {
    return '❌ Formato inválido';
  }

  if (checks.isDisposable) {
    return '❌ Email temporal/desechable';
  }

  if (!checks.mxRecords) {
    return '⚠️ Dominio no acepta emails (sin MX records)';
  }

  if (score >= 80) {
    return '✅ Email válido y confiable';
  }

  if (score >= 50) {
    if (checks.isRoleBased) {
      return '⚠️ Email genérico (info@, admin@, etc.)';
    }
    return '✅ Email probablemente válido';
  }

  return '❌ Email de baja calidad';
}

/**
 * Verificar solo los mejores emails de una lista
 */
export async function getBestEmails(emails, maxResults = 5) {
  const verification = await verifyMultipleEmails(emails);

  // Filtrar solo válidos y tomar los mejores
  return verification.valid
    .slice(0, maxResults)
    .map(v => ({
      email: v.email,
      score: v.score,
      isRoleBased: v.checks.isRoleBased
    }));
}

/**
 * Verificar emails encontrados por el emailFinder
 */
export async function verifyFoundEmails(foundEmails) {
  console.log('\n🔍 VERIFICANDO EMAILS ENCONTRADOS');
  console.log('═══════════════════════════════════════');

  const verification = await verifyMultipleEmails(foundEmails);

  console.log('\n📊 RESULTADOS:');
  console.log(`Total: ${verification.stats.total}`);
  console.log(`Válidos: ${verification.stats.valid} (${verification.stats.validRate})`);
  console.log(`Inválidos: ${verification.stats.invalid}`);

  // Clasificar por tipo
  const personal = verification.valid.filter(v => !v.checks.isRoleBased);
  const generic = verification.valid.filter(v => v.checks.isRoleBased);

  console.log(`\n📧 Personales: ${personal.length}`);
  console.log(`📧 Genéricos: ${generic.length}`);

  if (personal.length > 0) {
    console.log('\n✨ EMAILS PERSONALES (mejor calidad):');
    personal.forEach(v => {
      console.log(`  - ${v.email} (score: ${v.score})`);
    });
  }

  if (generic.length > 0) {
    console.log('\n📬 EMAILS GENÉRICOS:');
    generic.forEach(v => {
      console.log(`  - ${v.email} (score: ${v.score})`);
    });
  }

  return {
    all: verification.all,
    valid: verification.valid,
    personal,
    generic,
    stats: verification.stats
  };
}

/**
 * Clasificar emails por prioridad
 */
export function classifyEmailsByPriority(verifiedEmails) {
  const priority = {
    high: [],    // Emails personales, score alto
    medium: [],  // Emails genéricos pero válidos
    low: []      // Emails dudosos
  };

  verifiedEmails.forEach(verified => {
    if (verified.score >= 80 && !verified.checks.isRoleBased) {
      priority.high.push(verified.email);
    } else if (verified.score >= 50) {
      priority.medium.push(verified.email);
    } else {
      priority.low.push(verified.email);
    }
  });

  return priority;
}
