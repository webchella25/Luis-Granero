// src/lib/email/templates.js - VERSIÓN COMPLETA CON MAGIC LINKS
export const emailTemplates = {
  noWebsite: {
    subject: (businessName) => `Oportunidad digital para ${businessName}`,
    
    htmlBody: (lead, magicLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Luis Granero</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Desarrollo Web Profesional</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hola,</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0;">
              Soy Luis Granero, desarrollador web especializado en ${lead.category || 'negocios locales'}.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0;">
              He encontrado <strong>${lead.name}</strong> en Google Maps y me he dado cuenta de que no tienen presencia web. 
              En un mercado donde el <strong>85% de clientes buscan online</strong> antes de visitar un negocio, 
              esto representa una gran oportunidad perdida.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 20px; margin: 30px 0;">
              <h3 style="color: #0e7490; margin: 0 0 15px 0; font-size: 18px;">
                ✨ Puedo ayudarte a crear una web profesional que:
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                <li style="margin-bottom: 8px;">Atraiga más clientes locales a través de Google</li>
                <li style="margin-bottom: 8px;">Muestre tu negocio 24/7, incluso cuando estés cerrado</li>
                <li style="margin-bottom: 8px;">Aumente tu credibilidad frente a la competencia</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Con <strong>${lead.reviewCount || 0} reseñas</strong> y una valoración de <strong>${lead.rating || 'excelente'} estrellas</strong>, 
              es claro que ofreces un gran servicio. Una web profesional potenciaría aún más ese éxito.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${magicLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 18px 45px;
                text-decoration: none;
                border-radius: 10px;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
                transition: transform 0.2s;
              ">
                📅 Agendar Llamada Gratuita (15 min)
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
              O si prefieres, responde este email y coordinamos directamente.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">Luis Granero</p>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Desarrollo Web & Consultoría Digital</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              🌐 <a href="https://www.luisgranero.com" style="color: #06b6d4; text-decoration: none;">www.luisgranero.com</a><br>
              📧 <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none;">luis@luisgranero.com</a>
            </p>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                Este enlace es válido por 7 días. Si no deseas recibir más correos, responde indicándolo.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  },

  slowWebsite: {
    subject: (businessName) => `Mejora la velocidad de ${businessName} - Análisis gratuito`,
    
    htmlBody: (lead, magicLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Luis Granero</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Desarrollo Web Profesional</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hola,</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0;">
              Soy Luis Granero, desarrollador web especializado en optimización de rendimiento.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px 0;">
              He analizado la web de <strong>${lead.name}</strong> y he detectado que tarda 
              <strong style="color: #dc2626;">${Math.round((lead.webAnalysis?.loadTime || 0) / 1000)} segundos</strong> en cargar.
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 30px 0;">
              <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 18px;">⚠️ Problemas detectados:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
                ${lead.webAnalysis?.issues?.slice(0, 3).map(issue => 
                  `<li style="margin-bottom: 8px;">${issue}</li>`
                ).join('') || '<li>Velocidad de carga lenta</li>'}
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              <strong>¿Sabías que?</strong> Google penaliza las webs lentas, y los usuarios abandonan si tardan más de 3 segundos. 
              Esto te está costando ventas cada día.
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
              <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">✅ He ayudado a negocios como el tuyo a:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
                <li style="margin-bottom: 8px;">Reducir tiempo de carga en un 70%</li>
                <li style="margin-bottom: 8px;">Aumentar conversiones hasta un 40%</li>
                <li style="margin-bottom: 8px;">Mejorar ranking en Google significativamente</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${magicLink}" style="
                display: inline-block;
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 18px 45px;
                text-decoration: none;
                border-radius: 10px;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
              ">
                📅 Agendar Análisis Gratuito (15 min)
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
              Sin compromiso. Solo una charla para ver cómo puedo ayudarte.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">Luis Granero</p>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Desarrollo Web & Optimización</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              🌐 <a href="https://www.luisgranero.com" style="color: #06b6d4; text-decoration: none;">www.luisgranero.com</a><br>
              📧 <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none;">luis@luisgranero.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  // Plantilla de confirmación de cita
  appointmentConfirmation: {
    subject: () => 'Confirmación de llamada - Luis Granero',
    
    htmlBody: (appointment) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Llamada Confirmada!</h1>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Hola <strong>${appointment.name}</strong>,
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
              Tu llamada ha sido agendada correctamente. Aquí están los detalles:
            </p>
            
            <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                📅 Detalles de la Llamada
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #6b7280; font-weight: 600;">
                    📆 Fecha:
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #1f2937; text-align: right; font-weight: bold;">
                    ${new Date(appointment.scheduledDate).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #6b7280; font-weight: 600;">
                    🕐 Hora:
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #1f2937; text-align: right; font-weight: bold;">
                    ${appointment.scheduledTime}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">
                    📞 Teléfono:
                  </td>
                  <td style="padding: 12px 0; color: #1f2937; text-align: right; font-weight: bold;">
                    ${appointment.phone}
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0;">
              <p style="margin: 0; color: #1e40af; font-weight: 600;">ℹ️ ¿Qué hablaremos?</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e3a8a;">
                <li style="margin-bottom: 8px;">Tu proyecto y objetivos</li>
                <li style="margin-bottom: 8px;">Soluciones técnicas recomendadas</li>
                <li style="margin-bottom: 8px;">Presupuesto y plazos</li>
              </ul>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0 0;">
              Te llamaré puntualmente a la hora acordada. Si necesitas cambiar la fecha o tienes alguna pregunta, 
              responde este email.
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold;">Luis Granero</p>
            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Desarrollo Web Profesional</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              🌐 <a href="https://www.luisgranero.com" style="color: #06b6d4; text-decoration: none;">www.luisgranero.com</a><br>
              📧 <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none;">luis@luisgranero.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

export function selectBestTemplate(lead) {
  if (!lead.website) return 'noWebsite';
  if (lead.webAnalysis?.loadTime > 5000) return 'slowWebsite';
  if (!lead.webAnalysis?.hasSSL) return 'slowWebsite';
  return 'slowWebsite';
}

export function generatePersonalizedEmail(lead, magicLink) {
  const templateKey = selectBestTemplate(lead);
  const template = emailTemplates[templateKey];
  
  return {
    to: lead.possibleEmails?.[0] || '',
    subject: template.subject(lead.name),
    htmlBody: template.htmlBody(lead, magicLink),
    templateUsed: templateKey
  };
}