// src/app/api/subscribe/[courseSlug]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'
import EmailCourse from '@/models/EmailCourse'
import { logger } from '@/lib/logger'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

// Configurar transporter con Brevo
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

// Función para reemplazar variables
function replaceVariables(text, subscriber) {
  if (!text) return ''

  const replacements = {
    '{{name}}': subscriber.name || '',
    '{{email}}': subscriber.email || '',
    '{{unsubscribe_url}}': `${process.env.NEXTAUTH_URL || 'https://luisgranero.com'}/unsubscribe/${subscriber.unsubscribeToken}`
  }

  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value))
  }

  return result
}

export async function POST(request, { params }) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'Email y nombre requeridos' }, { status: 400 })
    }

    await dbConnect()

    // Verificar que el curso existe
    const course = await EmailCourse.findOne({ slug: params.courseSlug, isActive: true })
    if (!course) {
      logger.warn(`Course not found: ${params.courseSlug}`)
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Verificar si ya está suscrito
    const existing = await Subscriber.findOne({
      email: email.toLowerCase(),
      course: params.courseSlug
    })

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Reactivar suscripción
        existing.status = 'active'
        existing.currentDay = 0
        existing.emailsSent = {
          day1: { sent: false },
          day2: { sent: false },
          day3: { sent: false },
          day4: { sent: false },
          day5: { sent: false }
        }
        await existing.save()

        // Actualizar stats del curso
        await EmailCourse.findByIdAndUpdate(course._id, {
          $inc: {
            'stats.activeSubscribers': 1
          }
        })

        logger.info(`Subscriber reactivated: ${email} for ${params.courseSlug}`)

        // Enviar primer email para reactivación
        try {
          const day1Email = course.emails.find(e => e.day === 1)

          if (day1Email) {
            const subject = replaceVariables(day1Email.subject, {
              name: existing.name,
              email: existing.email,
              unsubscribeToken: existing.unsubscribeToken
            })

            const htmlBody = replaceVariables(day1Email.htmlContent, {
              name: existing.name,
              email: existing.email,
              unsubscribeToken: existing.unsubscribeToken
            })

            await transporter.sendMail({
              from: `${process.env.EMAIL_FROM_NAME || 'Luis Granero'} <${process.env.SMTP_USER}>`,
              to: existing.email,
              subject: subject,
              html: htmlBody,
              headers: {
                'X-Course-Slug': course.slug,
                'X-Course-Day': '1'
              }
            })

            // Actualizar tracking del primer email
            await Subscriber.findByIdAndUpdate(existing._id, {
              currentDay: 1,
              'emailsSent.day1.sent': true,
              'emailsSent.day1.sentAt': new Date()
            })

            logger.info(`✅ Welcome email sent to reactivated subscriber ${existing.email}`)
          }
        } catch (emailError) {
          logger.error(`Error sending welcome email to reactivated subscriber:`, emailError)
        }
      } else {
        return NextResponse.json({ error: 'Ya estás suscrito a este curso' }, { status: 400 })
      }
    } else {
      // Crear nuevo suscriptor
      const unsubscribeToken = crypto.randomBytes(32).toString('hex')

      await Subscriber.create({
        email: email.toLowerCase(),
        name,
        course: params.courseSlug,
        unsubscribeToken,
        emailsSent: {
          day1: { sent: false },
          day2: { sent: false },
          day3: { sent: false },
          day4: { sent: false },
          day5: { sent: false }
        }
      })

      // Actualizar stats del curso
      await EmailCourse.findByIdAndUpdate(course._id, {
        $inc: {
          'stats.totalSubscribers': 1,
          'stats.activeSubscribers': 1
        }
      })

      logger.info(`New subscriber: ${email} for ${params.courseSlug}`)

      // Enviar primer email inmediatamente
      try {
        const day1Email = course.emails.find(e => e.day === 1)

        if (day1Email) {
          const subject = replaceVariables(day1Email.subject, {
            name,
            email: email.toLowerCase(),
            unsubscribeToken
          })

          const htmlBody = replaceVariables(day1Email.htmlContent, {
            name,
            email: email.toLowerCase(),
            unsubscribeToken
          })

          await transporter.sendMail({
            from: `${process.env.EMAIL_FROM_NAME || 'Luis Granero'} <${process.env.SMTP_USER}>`,
            to: email.toLowerCase(),
            subject: subject,
            html: htmlBody,
            headers: {
              'X-Course-Slug': course.slug,
              'X-Course-Day': '1'
            }
          })

          // Actualizar tracking del primer email
          await Subscriber.findOneAndUpdate(
            { email: email.toLowerCase(), course: params.courseSlug },
            {
              currentDay: 1,
              'emailsSent.day1.sent': true,
              'emailsSent.day1.sentAt': new Date()
            }
          )

          logger.info(`✅ Welcome email sent to ${email} for ${params.courseSlug}`)
        }
      } catch (emailError) {
        logger.error(`Error sending welcome email to ${email}:`, emailError)
        // No fallar la suscripción si el email falla
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error subscribing to ${params.courseSlug}`, error)
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  }
}
