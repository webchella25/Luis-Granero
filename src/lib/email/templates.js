// src/lib/email/templates.js

export const emailTemplates = {
  noWebsite: {
    subject: (businessName) => `Oportunidad digital para ${businessName}`,
    body: (lead) => `Hola,

Soy Luis Granero, desarrollador web especializado en ${lead.category || 'negocios locales'}.

He encontrado ${lead.name} en Google Maps y me he dado cuenta de que no tienen presencia web. En un mercado donde el 85% de clientes buscan online antes de visitar un negocio, esto representa una gran oportunidad perdida.

Puedo ayudarte a crear una web profesional que:
✓ Atraiga más clientes locales a través de Google
✓ Muestre tu negocio 24/7
✓ Aumente tu credibilidad frente a la competencia

Con ${lead.reviewCount || 0} reseñas y una valoración de ${lead.rating || 'excelente'}, es claro que ofreces un gran servicio. Una web potenciaría aún más ese éxito.

¿Te interesaría una breve llamada esta semana para explorar cómo podríamos impulsar tu negocio online?

Saludos,
Luis Granero
Desarrollo Web Profesional
www.luisgranero.com
${lead.phone || ''}`
  },

  slowWebsite: {
    subject: (businessName) => `Mejora la velocidad de ${businessName} - Análisis gratuito`,
    body: (lead) => `Hola,

Soy Luis Granero, desarrollador web especializado en optimización de rendimiento.

He analizado la web de ${lead.name} y he detectado que tarda ${Math.round(lead.webAnalysis.loadTime / 1000)} segundos en cargar. Google penaliza las webs lentas, y los usuarios abandonan si tardan más de 3 segundos.

Problemas detectados:
${lead.webAnalysis.issues.slice(0, 3).map(issue => `• ${issue}`).join('\n')}

He ayudado a negocios como el tuyo a:
✓ Reducir tiempo de carga en un 70%
✓ Aumentar conversiones hasta un 40%
✓ Mejorar ranking en Google significativamente

¿Revisamos tu caso esta semana? Sin compromiso.

Saludos,
Luis Granero
Desarrollo Web & Optimización
www.luisgranero.com`
  },

  outdatedWebsite: {
    subject: (businessName) => `Moderniza la web de ${businessName}`,
    body: (lead) => `Hola,

Luis Granero por aquí, desarrollador web de Valencia.

He visto la web de ${lead.name} y creo que hay una gran oportunidad de mejora. He detectado:

${lead.webAnalysis.issues.slice(0, 4).map(issue => `• ${issue}`).join('\n')}

Estos problemas están afectando:
- Tu posicionamiento en Google (SEO)
- La experiencia de clientes en móvil
- Tu tasa de conversión

Tecnología detectada: ${lead.webAnalysis.technology}

Puedo modernizar tu web para:
✓ Mejor rendimiento y velocidad
✓ Diseño responsive (móvil perfecto)
✓ Mayor visibilidad en buscadores
✓ Más conversiones y ventas

Con ${lead.reviewCount} reseñas y ${lead.rating} estrellas, mereces una web a la altura de tu servicio.

¿Charlamos 15 minutos esta semana?

Saludos,
Luis Granero
www.luisgranero.com`
  },

  noSSL: {
    subject: (businessName) => `⚠️ Problema de seguridad en la web de ${businessName}`,
    body: (lead) => `Hola,

Soy Luis Granero, desarrollador web.

He detectado que la web de ${lead.name} no tiene certificado SSL (aparece como "No seguro" en navegadores).

¿Por qué es crítico?
- Google penaliza webs sin HTTPS
- Los navegadores alertan a tus clientes
- Pérdida de confianza y ventas
- Problemas legales (RGPD requiere HTTPS)

Puedo solucionarlo rápidamente y además:
✓ Mejorar la velocidad de carga
✓ Optimizar para móviles
✓ Aumentar tu visibilidad en Google

Es una solución rápida que protegerá tu negocio y mejorará tu imagen online.

¿Hablamos esta semana?

Saludos,
Luis Granero
Desarrollo Web Seguro
www.luisgranero.com`
  }
};

export function selectBestTemplate(lead) {
  // Sin website
  if (!lead.website) {
    return 'noWebsite';
  }

  // Con análisis de web
  if (lead.webAnalysis) {
    // Sin SSL es crítico
    if (!lead.webAnalysis.hasSSL) {
      return 'noSSL';
    }

    // Web muy lenta
    if (lead.webAnalysis.loadTime > 5000) {
      return 'slowWebsite';
    }

    // Web con problemas (puntuación baja)
    if (lead.webAnalysis.score < 60) {
      return 'outdatedWebsite';
    }
  }

  // Default
  return 'outdatedWebsite';
}

export function generatePersonalizedEmail(lead) {
  const templateKey = selectBestTemplate(lead);
  const template = emailTemplates[templateKey];
  
  return {
    subject: template.subject(lead.name),
    body: template.body(lead),
    templateUsed: templateKey
  };
}