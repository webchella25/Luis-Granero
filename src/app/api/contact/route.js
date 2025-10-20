// src/app/api/contact/route.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Lead from '@/models/Lead';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import Appointment from '@/models/Appointment';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurar Brevo transporter
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

// Función para reemplazar shortcodes
function replaceShortcodes(text, data, magicLink = '') {
  if (!text) return '';
  
  const replacements = {
    '{{name}}': data.name || '',
    '{{first_name}}': data.name?.split(' ')[0] || '',
    '{{email}}': data.email || '',
    '{{phone}}': data.phone || '',
    '{{company}}': data.company || 'tu empresa',
    '{{website}}': data.website || '',
    '{{project_type}}': data.projectType || 'Consulta general',
    '{{budget}}': data.budget || 'A consultar',
    '{{timeline}}': data.timeline || 'Flexible',
    '{{message}}': data.message || '',
    '{{magic_link}}': magicLink
  };
  
  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }
  
  return result;
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validación básica
    if (!data.name || !data.email || !data.message) {
      return Response.json({ 
        error: 'Faltan campos requeridos: nombre, email y mensaje son obligatorios' 
      }, { status: 400 });
    }
    
    // Extraer metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer')
    };
    
    console.log('📝 Procesando nuevo contacto:', data.name);
    
    // 1. GUARDAR EN CONTACT (Tabla original)
    const contact = await Contact.create({
      personal: {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        website: data.website || ''
      },
      project: {
        type: data.projectType || 'No especificado',
        budget: data.budget || '',
        timeline: data.timeline || '',
        description: data.message,
        technologies: data.technologies || [],
        features: data.features || []
      },
      source: data.source || 'Website Form',
      metadata,
      status: 'new',
      priority: 'high' // Formulario web = prioridad alta
    });
    
    console.log('✅ Contact guardado:', contact._id);
    
    // 2. CREAR LEAD EN EL CRM (para tracking avanzado)
    let lead;
    try {
      lead = await Lead.create({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        possibleEmails: [data.email],
        phoneNumbers: data.phone ? [data.phone] : [],
        category: data.projectType || 'Web Development',
        source: 'Website Form',
        status: 'new',
        priority: 'high',
        opportunityScore: 85, // Alto score para formulario web
        notes: data.message,
        metadata: {
          company: data.company,
          website: data.website,
          budget: data.budget,
          timeline: data.timeline,
          projectType: data.projectType,
          technologies: data.technologies,
          features: data.features,
          ...metadata
        },
        contactHistory: [{
          date: new Date(),
          type: 'form_submission',
          notes: `Formulario web completado: ${data.projectType || 'Consulta general'}`
        }]
      });
      
      console.log('✅ Lead creado en CRM:', lead._id);
    } catch (leadError) {
      console.error('⚠️ Error creando lead (continuando):', leadError.message);
    }
    
    // 3. CREAR MAGIC LINK para agendar llamada
    let magicLink = '';
    try {
      const magicToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = new Date();
      tokenExpiration.setDate(tokenExpiration.getDate() + 7); // 7 días
      
      const appointment = await Appointment.create({
        leadId: lead?._id,
        token: magicToken,
        tokenExpiresAt: tokenExpiration,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        status: 'pending',
        source: 'website_form'
      });
      
      magicLink = `${process.env.NEXTAUTH_URL || 'https://luisgranero.com'}/agendar/${magicToken}`;
      console.log('✅ Magic link creado:', magicLink);
    } catch (appointmentError) {
      console.error('⚠️ Error creando appointment (continuando):', appointmentError.message);
    }
    
    // 4. BUSCAR PLANTILLAS DE EMAIL (si existen)
    let notificationTemplate;
    let confirmationTemplate;
    
    try {
      // Plantilla para notificación al admin
      notificationTemplate = await EmailTemplate.findOne({
        templateId: 'notification_new_lead',
        type: 'email',
        isActive: true
      });
      
      // Plantilla para confirmación al cliente
      confirmationTemplate = await EmailTemplate.findOne({
        templateId: 'client_confirmation',
        type: 'email',
        isActive: true
      });
      
      console.log('📧 Plantillas encontradas:', {
        notification: !!notificationTemplate,
        confirmation: !!confirmationTemplate
      });
    } catch (templateError) {
      console.error('⚠️ Error buscando plantillas:', templateError.message);
    }
    
    // 5. ENVIAR EMAIL DE NOTIFICACIÓN A TI (con plantilla o hardcoded)
    let notificationEmailLog;
    try {
      let notificationSubject;
      let notificationBody;
      
      if (notificationTemplate) {
        // Usar plantilla si existe
        notificationSubject = replaceShortcodes(notificationTemplate.subject, data, magicLink);
        notificationBody = replaceShortcodes(notificationTemplate.body, data, magicLink);
      } else {
        // Hardcoded si no hay plantilla
        notificationSubject = `🔔 Nuevo Lead: ${data.name} - ${data.projectType || 'Consulta General'}`;
        notificationBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚀 Nuevo Cliente Potencial</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Desde formulario web - luisgranero.com</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
                📋 Información del Cliente
              </h2>
              
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px; font-weight: bold; width: 35%;">Nombre:</td>
                  <td style="padding: 12px;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; background: #f3f4f6;">Email:</td>
                  <td style="padding: 12px;">
                    <a href="mailto:${data.email}" style="color: #06b6d4; font-weight: 600;">${data.email}</a>
                  </td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px; font-weight: bold;">Teléfono:</td>
                  <td style="padding: 12px;">
                    ${data.phone ? `<a href="tel:${data.phone}" style="color: #10b981;">${data.phone}</a>` : 'No proporcionado'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; background: #f3f4f6;">Empresa:</td>
                  <td style="padding: 12px;">${data.company || 'No proporcionado'}</td>
                </tr>
                ${data.website ? `
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px; font-weight: bold;">Website:</td>
                  <td style="padding: 12px;"><a href="${data.website}" target="_blank" style="color: #06b6d4;">${data.website}</a></td>
                </tr>
                ` : ''}
              </table>
              
              <h3 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-top: 30px;">
                💼 Detalles del Proyecto
              </h3>
              <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px; font-weight: bold; width: 35%;">Tipo de Proyecto:</td>
                  <td style="padding: 12px;">${data.projectType || 'No especificado'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; background: #f3f4f6;">Presupuesto:</td>
                  <td style="padding: 12px;">${data.budget || 'No especificado'}</td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px; font-weight: bold;">Timeline:</td>
                  <td style="padding: 12px;">${data.timeline || 'No especificado'}</td>
                </tr>
              </table>
              
              <h3 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin-top: 30px;">
                💬 Mensaje del Cliente
              </h3>
              <div style="background: #fffbeb; padding: 20px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
              </div>
              
              ${data.technologies && data.technologies.length > 0 ? `
                <h3 style="color: #1f2937; margin-top: 30px;">⚙️ Tecnologías solicitadas:</h3>
                <p style="color: #6b7280;">${data.technologies.join(', ')}</p>
              ` : ''}
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center;">
                <a href="mailto:${data.email}" style="display: inline-block; background: #06b6d4; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px; box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                  📧 Responder por Email
                </a>
                
                ${data.phone ? `
                  <a href="tel:${data.phone}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    📞 Llamar Ahora
                  </a>
                  <a href="https://wa.me/${data.phone.replace(/\D/g, '')}" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);">
                    💬 WhatsApp
                  </a>
                ` : ''}
              </div>
              
              ${lead ? `
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'https://luisgranero.com'}/admin/leads/${lead._id}" style="color: #06b6d4; text-decoration: none; font-weight: 600;">
                    👉 Ver en CRM →
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 20px; background: white; border-radius: 8px;">
              <p style="color: #6b7280; font-size: 13px; margin: 5px 0;">
                <strong>Metadata:</strong> IP: ${metadata.ipAddress} | Fecha: ${new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        `;
      }
      
      // Crear EmailLog
      notificationEmailLog = await EmailLog.create({
        leadId: lead?._id,
        emailTo: process.env.EMAIL_NOTIFICATION_TO || 'luis@luisgranero.com',
        subject: notificationSubject,
        emailBody: notificationBody,
        status: 'sending',
        source: 'website_form',
        templateId: notificationTemplate?.templateId || 'hardcoded_notification'
      });
      
      // Enviar email
      await transporter.sendMail({
        from: `"Formulario Web - Luis Granero" <${process.env.EMAIL_FROM || 'luis@luisgranero.com'}>`,
        to: process.env.EMAIL_NOTIFICATION_TO || 'luis@luisgranero.com',
        replyTo: data.email,
        subject: notificationSubject,
        html: notificationBody
      });
      
      // Actualizar EmailLog
      await EmailLog.findByIdAndUpdate(notificationEmailLog._id, {
        status: 'sent',
        sentAt: new Date()
      });
      
      console.log('✅ Email de notificación enviado');
      
    } catch (emailError) {
      console.error('❌ Error enviando notificación:', emailError);
      if (notificationEmailLog) {
        await EmailLog.findByIdAndUpdate(notificationEmailLog._id, {
          status: 'failed',
          error: emailError.message
        });
      }
    }
    
    // 6. ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE (con plantilla o hardcoded)
    let confirmationEmailLog;
    try {
      let confirmationSubject;
      let confirmationBody;
      
      if (confirmationTemplate) {
        // Usar plantilla si existe
        confirmationSubject = replaceShortcodes(confirmationTemplate.subject, data, magicLink);
        confirmationBody = replaceShortcodes(confirmationTemplate.body, data, magicLink);
      } else {
        // Hardcoded si no hay plantilla
        confirmationSubject = '✅ He recibido tu mensaje - Luis Granero';
        confirmationBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">👋 ¡Hola ${data.name.split(' ')[0]}!</h1>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin-top: 0;">
                Gracias por contactarme. <strong>He recibido tu mensaje</strong> y me pondré en contacto contigo en las próximas <strong style="color: #06b6d4;">2-4 horas</strong>.
              </p>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #06b6d4;">
                <h3 style="color: #0369a1; margin-top: 0; font-size: 18px;">📋 Resumen de tu consulta:</h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="color: #0c4a6e; padding: 8px 0; font-weight: 600;">Proyecto:</td>
                    <td style="color: #374151; padding: 8px 0;">${data.projectType || 'Consulta general'}</td>
                  </tr>
                  <tr>
                    <td style="color: #0c4a6e; padding: 8px 0; font-weight: 600;">Presupuesto:</td>
                    <td style="color: #374151; padding: 8px 0;">${data.budget || 'A consultar'}</td>
                  </tr>
                  ${data.timeline ? `
                  <tr>
                    <td style="color: #0c4a6e; padding: 8px 0; font-weight: 600;">Timeline:</td>
                    <td style="color: #374151; padding: 8px 0;">${data.timeline}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              ${magicLink ? `
                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #10b981; text-align: center;">
                  <h3 style="color: #065f46; margin-top: 0;">📅 ¿Prefieres agendar una llamada?</h3>
                  <p style="color: #047857; margin: 15px 0;">Elige el mejor momento para ti (sin compromiso):</p>
                  <a href="${magicLink}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    📞 Agendar Llamada Gratuita (15 min)
                  </a>
                  <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">Este link es válido por 7 días</p>
                </div>
              ` : ''}
              
              <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                💡 Mientras tanto...
              </h3>
              
              <div style="display: grid; gap: 15px; margin: 20px 0;">
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #06b6d4;">
                  <strong style="color: #1f2937; display: block; margin-bottom: 8px;">🎨 Revisa mi portfolio</strong>
                  <p style="color: #6b7280; margin: 0; line-height: 1.6;">
                    Descubre proyectos similares al tuyo y cómo he ayudado a otros clientes.
                  </p>
                  <a href="https://luisgranero.com/portfolio" style="color: #06b6d4; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 10px;">
                    Ver portfolio →
                  </a>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #10b981;">
                  <strong style="color: #1f2937; display: block; margin-bottom: 8px;">📚 Lee casos de éxito</strong>
                  <p style="color: #6b7280; margin: 0; line-height: 1.6;">
                    Testimonios reales y resultados medibles de clientes satisfechos.
                  </p>
                  <a href="https://luisgranero.com/portfolio" style="color: #10b981; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 10px;">
                    Ver casos de éxito →
                  </a>
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 10px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0; line-height: 1.6; font-size: 15px;">
                  <strong>⚡ ¿Es urgente?</strong><br>
                  Si necesitas hablar conmigo cuanto antes:
                </p>
                <div style="text-align: center; margin-top: 15px;">
                  <a href="tel:+34698383610" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                    📞 +34 698 38 36 10
                  </a>
                  <a href="https://wa.me/34698383610" target="_blank" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                    💬 WhatsApp
                  </a>
                </div>
              </div>
              
              <div style="border-top: 2px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
                <p style="color: #374151; line-height: 1.6; margin: 0;">
                  Saludos,<br>
                  <strong style="color: #1f2937; font-size: 18px;">Luis Granero</strong><br>
                  <span style="color: #6b7280;">Desarrollador Web Freelance</span>
                </p>
                
                <div style="margin-top: 20px;">
                  <a href="https://luisgranero.com" style="color: #06b6d4; text-decoration: none; margin-right: 15px;">🌐 luisgranero.com</a>
                  <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none; margin-right: 15px;">📧 Email</a>
                  <a href="https://linkedin.com/in/luisgranero" style="color: #06b6d4; text-decoration: none;">💼 LinkedIn</a>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Este email fue enviado en respuesta a tu solicitud de contacto desde luisgranero.com<br>
                Si no realizaste esta solicitud, puedes ignorar este mensaje.
              </p>
            </div>
          </div>
        `;
      }
      
      // Crear EmailLog
      confirmationEmailLog = await EmailLog.create({
        leadId: lead?._id,
        emailTo: data.email,
        subject: confirmationSubject,
        emailBody: confirmationBody,
        status: 'sending',
        source: 'website_form',
        templateId: confirmationTemplate?.templateId || 'hardcoded_confirmation'
      });
      
      // Enviar email
      await transporter.sendMail({
        from: `"Luis Granero" <${process.env.EMAIL_FROM || 'luis@luisgranero.com'}>`,
        to: data.email,
        subject: confirmationSubject,
        html: confirmationBody
      });
      
      // Actualizar EmailLog
      await EmailLog.findByIdAndUpdate(confirmationEmailLog._id, {
        status: 'sent',
        sentAt: new Date()
      });
      
      console.log('✅ Email de confirmación enviado al cliente');
      
    } catch (emailError) {
      console.error('❌ Error enviando confirmación:', emailError);
      if (confirmationEmailLog) {
        await EmailLog.findByIdAndUpdate(confirmationEmailLog._id, {
          status: 'failed',
          error: emailError.message
        });
      }
    }
    
    // 7. ACTUALIZAR LEAD con email enviado
    if (lead) {
      try {
        await Lead.findByIdAndUpdate(lead._id, {
          $set: { 
            status: 'contacted',
            lastInteraction: new Date(),
            lastInteractionType: 'email_sent'
          },
          $push: {
            contactHistory: {
              date: new Date(),
              type: 'email',
              notes: 'Emails de bienvenida enviados (notificación + confirmación)'
            }
          }
        });
      } catch (updateError) {
        console.error('⚠️ Error actualizando lead:', updateError.message);
      }
    }
    
    // RESPUESTA EXITOSA
    return Response.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. Te responderé en las próximas 2-4 horas.',
      data: {
        contactId: contact._id,
        leadId: lead?._id,
        magicLink: magicLink || null,
        emailsSent: {
          notification: notificationEmailLog?.status === 'sent',
          confirmation: confirmationEmailLog?.status === 'sent'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error general en formulario:', error);
    
    return Response.json({ 
      error: 'Error al enviar el mensaje. Por favor, intenta escribirme directamente a luis@luisgranero.com o llama al +34 698 38 36 10',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// GET para obtener contactos (panel admin)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    
    const skip = (page - 1) * limit;
    
    const [contacts, total] = await Promise.all([
      Contact.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(filters)
    ]);
    
    return Response.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error getting contacts:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}