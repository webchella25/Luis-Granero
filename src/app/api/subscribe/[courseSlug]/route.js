// src/app/api/subscribe/[courseSlug]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'
import crypto from 'crypto'

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

        logger.info(`Subscriber reactivated: ${email} for ${params.courseSlug}`)
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
    }

    // TODO: Enviar primer email inmediatamente

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error subscribing to ${params.courseSlug}`, error)
    return NextResponse.json({ error: 'Error al suscribirse' }, { status: 500 })
  }
}
