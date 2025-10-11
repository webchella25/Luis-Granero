// src/lib/templateProcessor.js

/**
 * Reemplaza las variables en un template con datos reales
 */
export function processTemplate(template, leadData) {
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
    score: leadData.opportunityScore
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