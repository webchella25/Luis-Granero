// src/lib/templateProcessor.js

/**
 * Genera un resumen de oportunidad personalizado por sector
 */
function generateOpportunitySummary(lead) {
  const name = lead.name || 'tu negocio';
  const rating = lead.rating;
  const reviews = lead.reviewCount;
  const sector = lead.sector;
  const noWebsite = !lead.website;

  const sectorPitch = {
    restaurant: 'Tus clientes buscan restaurantes en Google antes de salir de casa',
    beauty: 'El 70% de las reservas de belleza se hacen online',
    health: 'Los pacientes buscan médicos y clínicas en Google antes de llamar',
    shop: 'Tu competencia ya vende online — sin web pierdes ventas cada día',
    service: 'La gente busca fontaneros, electricistas y talleres en Google, no en el listín'
  };

  const pitch = sectorPitch[sector] || 'El 85% de clientes buscan online antes de visitar un negocio';

  let summary = '';

  if (noWebsite) {
    summary = `${name} no tiene web. ${pitch}.`;
    if (rating && reviews) {
      summary += ` Con ${reviews} reseñas y ${rating}★ en Google, tienes una reputación excelente que nadie puede ver.`;
    }
  } else {
    const issues = lead.webAnalysis?.issues?.slice(0, 2) || [];
    const loadTime = lead.webAnalysis?.loadTime;
    if (loadTime > 5000) {
      summary = `La web de ${name} tarda ${Math.round(loadTime / 1000)}s en cargar — Google penaliza webs lentas y el 53% de usuarios la abandona.`;
    } else if (!lead.webAnalysis?.hasSSL) {
      summary = `La web de ${name} no tiene certificado de seguridad (HTTPS). Los navegadores avisan a tus clientes de que no es segura.`;
    } else if (issues.length) {
      summary = `He analizado la web de ${name} y encontrado ${issues.length} problemas que afectan tu posicionamiento: ${issues.join(', ')}.`;
    } else {
      summary = `He revisado la presencia online de ${name} y veo margen de mejora importante.`;
    }
  }

  return summary;
}

/**
 * Reemplaza las variables en un template con datos reales
 */
export function processTemplate(template, leadData, extraVars = {}) {
  let processed = {
    subject: template.subject || '',
    body: template.body
  };

  // Mapeo de variables a datos del lead
  const variableMap = {
    business_name: leadData.name,
    category: leadData.category || 'negocios locales',
    review_count: leadData.reviewCount || 0,
    rating: leadData.rating || 0,
    phone: leadData.phone,
    address: leadData.address,
    website: leadData.website,
    load_time: leadData.webAnalysis?.loadTime
      ? Math.round(leadData.webAnalysis.loadTime / 1000)
      : '?',
    issues_list: leadData.webAnalysis?.issues
      ? leadData.webAnalysis.issues.slice(0, 3).map(issue => `• ${issue}`).join('\n')
      : '• Sin análisis disponible',
    magic_link: generateMagicLink(leadData._id),
    score: leadData.opportunityScore,
    opportunity_summary: generateOpportunitySummary(leadData),
    demo_link: extraVars.demo_link || '',
    ...extraVars
  };
  
  // Reemplazar variables en subject
  if (processed.subject) {
    Object.entries(variableMap).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed.subject = processed.subject.replace(regex, value);
    });
  }
  
  // Reemplazar variables en body
  Object.entries(variableMap).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed.body = processed.body.replace(regex, value);
  });
  
  return processed;
}

/**
 * Genera un magic link único para el lead
 */
function generateMagicLink(leadId) {
  const token = Buffer.from(leadId.toString()).toString('base64');
  return `https://www.luisgranero.com/agendar/${token}`;
}

/**
 * Obtiene el template apropiado según el lead
 */
export async function getTemplateForLead(lead, type = 'email') {
  try {
    const response = await fetch(`/api/templates?type=${type}`);
    const data = await response.json();
    
    if (!data.success || !data.templates.length) {
      throw new Error('No hay templates disponibles');
    }
    
    // Lógica para seleccionar el template apropiado
    let templateId;
    
    if (type === 'email') {
      templateId = lead.website ? 'email_has_website' : 'email_no_website';
    } else if (type === 'whatsapp') {
      templateId = 'whatsapp_default';
    } else {
      templateId = 'sms_default';
    }
    
    const template = data.templates.find(t => t.id === templateId);
    return template || data.templates[0];
    
  } catch (error) {
    console.error('Error getting template:', error);
    return null;
  }
}