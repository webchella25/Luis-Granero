// src/app/api/unsubscribe/[token]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'
import EmailCourse from '@/models/EmailCourse'
import { logger } from '@/lib/logger'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const subscriber = await Subscriber.findOne({ unsubscribeToken: params.token })

    if (!subscriber) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
        course: subscriber.course,
        status: subscriber.status
      }
    })
  } catch (error) {
    logger.error('Error fetching subscriber for unsubscribe:', error)
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect()

    const subscriber = await Subscriber.findOne({ unsubscribeToken: params.token })

    if (!subscriber) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({ error: 'Ya te has dado de baja anteriormente' }, { status: 400 })
    }

    // Actualizar estado
    subscriber.status = 'unsubscribed'
    await subscriber.save()

    // Actualizar stats del curso
    const course = await EmailCourse.findOne({ slug: subscriber.course })
    if (course) {
      await EmailCourse.findByIdAndUpdate(course._id, {
        $inc: {
          'stats.activeSubscribers': -1
        }
      })

      // Actualizar tasa de cancelación
      const unsubscribeRate = (1 / (course.stats.totalSubscribers || 1)) * 100
      await EmailCourse.findByIdAndUpdate(course._id, {
        'stats.unsubscribeRate': unsubscribeRate
      })
    }

    logger.info(`Subscriber unsubscribed: ${subscriber.email} from ${subscriber.course}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error unsubscribing:', error)
    return NextResponse.json({ error: 'Error al darse de baja' }, { status: 500 })
  }
}
