// src/app/api/cron/send-email-courses/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailCourse from '@/models/EmailCourse';
import Subscriber from '@/models/Subscriber';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

// Configurar transporter con Brevo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Función para reemplazar variables en el contenido del email
function replaceVariables(text, subscriber) {
  if (!text) return '';

  const replacements = {
    '{{name}}': subscriber.name || '',
    '{{email}}': subscriber.email || '',
    '{{unsubscribe_url}}': `${process.env.NEXTAUTH_URL || 'https://luisgranero.com'}/unsubscribe/${subscriber.unsubscribeToken}`
  };

  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  }

  return result;
}

async function handleRequest(request) {
  try {
    await dbConnect();

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron attempt for email courses');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Buscar suscriptores activos que necesitan recibir emails
    const subscribers = await Subscriber.find({
      status: 'active',
      currentDay: { $lt: 5 } // Aún no han completado los 5 días
    }).limit(100);

    logger.info(`📧 Email Courses: Found ${subscribers.length} active subscribers`);

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay suscriptores pendientes',
        summary: { total: 0, sent: 0, failed: 0, skipped: 0 }
      });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const results = [];

    for (const subscriber of subscribers) {
      try {
        // Verificar si ya ha pasado 24 horas desde el último email
        const nextDay = subscriber.currentDay + 1;
        const dayKey = `day${nextDay}`;

        // Si ya se envió este día, saltar
        if (subscriber.emailsSent[dayKey]?.sent) {
          skipped++;
          continue;
        }

        // Verificar si han pasado 24 horas desde el último email enviado
        // (excepto para day1 que se envía inmediatamente)
        if (nextDay > 1) {
          const lastDayKey = `day${nextDay - 1}`;
          const lastSentAt = subscriber.emailsSent[lastDayKey]?.sentAt;

          if (!lastSentAt) {
            // Si el email anterior no se envió, saltar
            skipped++;
            continue;
          }

          const hoursSinceLastEmail = (now - new Date(lastSentAt)) / (1000 * 60 * 60);

          // Esperar al menos 24 horas
          if (hoursSinceLastEmail < 24) {
            skipped++;
            continue;
          }
        }

        // Obtener el curso
        const course = await EmailCourse.findOne({
          slug: subscriber.course,
          isActive: true
        });

        if (!course) {
          logger.error(`Course not found: ${subscriber.course}`);
          failed++;
          results.push({
            email: subscriber.email,
            course: subscriber.course,
            status: 'failed',
            error: 'Curso no encontrado'
          });
          continue;
        }

        // Obtener el email del día correspondiente
        const emailContent = course.emails.find(e => e.day === nextDay);

        if (!emailContent) {
          logger.error(`Email content not found for day ${nextDay} in course ${course.slug}`);
          failed++;
          results.push({
            email: subscriber.email,
            course: subscriber.course,
            day: nextDay,
            status: 'failed',
            error: `Contenido del día ${nextDay} no encontrado`
          });
          continue;
        }

        // Reemplazar variables en subject y htmlContent
        const subject = replaceVariables(emailContent.subject, subscriber);
        const htmlBody = replaceVariables(emailContent.htmlContent, subscriber);

        logger.info(`📧 Sending day ${nextDay} email to ${subscriber.email} for course ${course.slug}`);

        // Enviar email
        await transporter.sendMail({
          from: `${process.env.EMAIL_FROM_NAME || 'Luis Granero'} <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: subject,
          html: htmlBody,
          headers: {
            'X-Course-Slug': course.slug,
            'X-Subscriber-ID': subscriber._id.toString(),
            'X-Course-Day': nextDay.toString()
          }
        });

        // Actualizar subscriber
        const updateData = {
          currentDay: nextDay,
          [`emailsSent.${dayKey}.sent`]: true,
          [`emailsSent.${dayKey}.sentAt`]: now
        };

        // Si es el último día, marcar como completado
        if (nextDay >= course.totalDays) {
          updateData.status = 'completed';

          // Actualizar estadísticas del curso
          await EmailCourse.findByIdAndUpdate(course._id, {
            $inc: {
              'stats.completedSubscribers': 1,
              'stats.activeSubscribers': -1
            }
          });

          logger.info(`✅ Subscriber ${subscriber.email} completed course ${course.slug}`);
        }

        await Subscriber.findByIdAndUpdate(subscriber._id, updateData);

        sent++;
        results.push({
          email: subscriber.email,
          name: subscriber.name,
          course: course.title,
          day: nextDay,
          status: 'sent',
          completed: nextDay >= course.totalDays
        });

        // Delay 1 segundo entre emails para no saturar
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        logger.error(`Error sending email to ${subscriber.email}:`, error);

        failed++;
        results.push({
          email: subscriber.email,
          course: subscriber.course,
          status: 'failed',
          error: error.message
        });
      }
    }

    logger.info(`📊 Email Courses Summary: ${sent} sent, ${failed} failed, ${skipped} skipped`);

    return NextResponse.json({
      success: true,
      summary: {
        total: subscribers.length,
        sent,
        failed,
        skipped
      },
      results
    });

  } catch (error) {
    logger.error('Error in email courses cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Exportar GET y POST (ambos usan la misma función)
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}
