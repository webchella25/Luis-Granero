// src/app/api/admin/email-courses/[id]/subscribers/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import Subscriber from '@/models/Subscriber'
import logger from '@/lib/logger'

// GET - Obtener suscriptores de un curso
export async function GET(request, { params }) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const course = await EmailCourse.findById(params.id)

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Construir query
    const query = { course: course.slug }

    if (status && status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ]
    }

    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })

    return NextResponse.json({
      subscribers,
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        stats: course.stats
      }
    })
  } catch (error) {
    logger.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Error al cargar suscriptores' }, { status: 500 })
  }
}
