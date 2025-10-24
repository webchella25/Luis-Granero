// src/app/api/contact/route.js - VERSIÓN CORREGIDA
// Reemplaza TODA la función POST por esta versión

import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Lead from '@/models/Lead';
import EmailLog from '@/models/EmailLog';
import EmailTemplate from '@/models/EmailTemplate';
import Appointment from '@/models/Appointment';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '97fd27001@smtp-brevo.com',
    pass: 'KTcWQIh2szOLS34N'
  }
});

// ✅ MAPEOS PARA CONVERTIR VALORES DEL FORMULARIO A VALORES DEL MODELO
const PROJECT_TYPE_MAP = {
  'landing': 'Desarrollo Web',
  'corporate': 'Desarrollo Web',
  'ecommerce': 'E-commerce',
  'webapp': 'Aplicación Web',
  'dashboard': 'Aplicación Web',
  'other': 'Otro'
};

const BUDGET_MAP = {
  'starter': '1,000€ - 3,000€',
  'business': '3,000€ - 7,000€',
  'enterprise': '7,000€ - 15,000€',
  'custom': '> 15,000€'
};

const TIMELINE_MAP = {
  'asap': 'Urgente (1-2 semanas)',
  '1month': 'Pronto (1 mes)',
  '2months': 'Medio plazo (2-3 meses)',
  'flexible': 'Flexible'
};

const STATUS_MAP = {
  'new': 'nuevo',
  'read': 'contactado',
  'replied': 'contactado',
  'archived': 'cerrado_perdido'
};

const PRIORITY_MAP = {
  'low': 'baja',
  'normal': 'media',
  'medium': 'media',
  'high': 'alta',
  'urgent': 'urgente'
};

const SOURCE_MAP = {
  'Website Form': 'Website',
  'Budget Calculator': 'Website',
  'Contact Form': 'Website'
};

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
    const message = data.message || data.description;
    if (!data.name || !data.email || !message) {
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
    
    // ✅ MAPEAR VALORES DEL FORMULARIO A VALORES DEL MODELO
    const mappedProjectType = PROJECT_TYPE_MAP[data.projectType] || 'Otro';
    const mappedBudget = BUDGET_MAP[data.budget] || 'A consultar';
    const mappedTimeline = TIMELINE_MAP[data.timeline] || 'Flexible';
    const mappedStatus = STATUS_MAP[data.status] || 'nuevo';
    const mappedPriority = PRIORITY_MAP[data.priority] || 'alta';
    const mappedSource = SOURCE_MAP[data.source] || 'Website';
    
    // 1. GUARDAR EN CONTACT
    const contact = await Contact.create({
      personal: {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        website: data.website || ''
      },
      project: {
        type: mappedProjectType,
        budget: mappedBudget,
        timeline: mappedTimeline,
        description: message,
        technologies: data.technologies || [],
        features: data.features || []
      },
      source: mappedSource,
      metadata,
      status: mappedStatus,
      priority: mappedPriority
    });
    
    console.log('✅ Contact guardado:', contact._id);
    
    // 2. CREAR LEAD EN EL CRM
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
        opportunityScore: 85,
        notes: message,
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
          notes: `Formulario web completado: ${mappedProjectType}`
        }]
      });
      
      console.log('✅ Lead creado en CRM:', lead._id);
    } catch (leadError) {
      console.error('⚠️ Error creando lead (continuando):', leadError.message);
    }
    
    // 3. CREAR MAGIC LINK
    let magicLink = '';
    try {
      const magicToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = new Date();
      tokenExpiration.setDate(tokenExpiration.getDate() + 7);
      
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
    
    // 4. BUSCAR PLANTILLAS
    let notificationTemplate;
    let confirmationTemplate;
    
    try {
      notificationTemplate = await EmailTemplate.findOne({
        templateId: 'notification_new_lead',
        type: 'email',
        isActive: true
      });
      
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
    
    // 5. ENVIAR EMAIL DE NOTIFICACIÓN
    let notificationEmailLog;
    try {
      let notificationSubject;
      let notificationBody;
      
      if (notificationTemplate) {
        notificationSubject = replaceShortcodes(notificationTemplate.subject, data, magicLink);
        notificationBody = replaceShortcodes(notificationTemplate.body, data, magicLink);
      } else {
        notificationSubject = `🔔 Nuevo Lead: ${data.name} - ${mappedProjectType}`;
        notificationBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>🚀 Nuevo Cliente Potencial</h1>
            <p><strong>Nombre:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Teléfono:</strong> ${data.phone || 'No proporcionado'}</p>
            <p><strong>Empresa:</strong> ${data.company || 'No proporcionado'}</p>
            <p><strong>Proyecto:</strong> ${mappedProjectType}</p>
            <p><strong>Presupuesto:</strong> ${mappedBudget}</p>
            <p><strong>Timeline:</strong> ${mappedTimeline}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${message}</p>
          </div>
        `;
      }
      
      notificationEmailLog = await EmailLog.create({
        leadId: lead?._id,
        emailTo: process.env.EMAIL_NOTIFICATION_TO || 'luis@luisgranero.com',
        subject: notificationSubject,
        emailBody: notificationBody,
        status: 'sending',
        source: 'website_form',
        templateId: notificationTemplate?.templateId || 'hardcoded_notification'
      });
      
      await transporter.sendMail({
        from: `"Formulario Web - Luis Granero" <${process.env.EMAIL_FROM || 'luis@luisgranero.com'}>`,
        to: process.env.EMAIL_NOTIFICATION_TO || 'luis@luisgranero.com',
        replyTo: data.email,
        subject: notificationSubject,
        html: notificationBody
      });
      
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
    
    // 6. ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE
    let confirmationEmailLog;
    try {
      let confirmationSubject;
      let confirmationBody;
      
      if (confirmationTemplate) {
        confirmationSubject = replaceShortcodes(confirmationTemplate.subject, data, magicLink);
        confirmationBody = replaceShortcodes(confirmationTemplate.body, data, magicLink);
      } else {
        confirmationSubject = '✅ He recibido tu mensaje - Luis Granero';
        confirmationBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>👋 ¡Hola ${data.name.split(' ')[0]}!</h1>
            <p>Gracias por contactarme. He recibido tu mensaje y te responderé en las próximas 2-4 horas.</p>
            <p><strong>Resumen de tu consulta:</strong></p>
            <p>Proyecto: ${mappedProjectType}</p>
            <p>Presupuesto: ${mappedBudget}</p>
            <p>Timeline: ${mappedTimeline}</p>
          </div>
        `;
      }
      
      confirmationEmailLog = await EmailLog.create({
        leadId: lead?._id,
        emailTo: data.email,
        subject: confirmationSubject,
        emailBody: confirmationBody,
        status: 'sending',
        source: 'website_form',
        templateId: confirmationTemplate?.templateId || 'hardcoded_confirmation'
      });
      
      await transporter.sendMail({
        from: `"Luis Granero" <${process.env.EMAIL_FROM || 'luis@luisgranero.com'}>`,
        to: data.email,
        subject: confirmationSubject,
        html: confirmationBody
      });
      
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
    
    // 7. ACTUALIZAR LEAD
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
              notes: 'Emails enviados (notificación + confirmación)'
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