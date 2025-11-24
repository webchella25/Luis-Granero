// src/app/api/admin/email-courses/[id]/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'

// GET - Obtener curso específico
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

    return NextResponse.json({ course })
  } catch (error) {
    logger.error('Error fetching email course:', error)
    return NextResponse.json({ error: 'Error al cargar curso' }, { status: 500 })
  }
}

// PUT - Actualizar curso
export async function PUT(request, { params }) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await request.json()

    await dbConnect()

    const course = await EmailCourse.findById(params.id)

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Si se cambia el slug, verificar que no exista
    if (data.slug && data.slug !== course.slug) {
      const existing = await EmailCourse.findOne({ slug: data.slug })
      if (existing) {
        return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 })
      }
    }

    // Actualizar campos
    const updateData = {}
    const allowedFields = [
      'title', 'slug', 'description', 'shortDescription', 'icon', 'color',
      'totalDays', 'emails', 'benefits', 'whatYouLearn', 'testimonials',
      'ctaText', 'sendTime', 'isActive'
    ]

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    })

    const updatedCourse = await EmailCourse.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    )

    logger.info(`Email course updated: ${updatedCourse.slug}`)

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    logger.error('Error updating email course:', error)
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 })
  }
}

// DELETE - Eliminar curso
export async function DELETE(request, { params }) {
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

    await EmailCourse.findByIdAndDelete(params.id)

    logger.info(`Email course deleted: ${course.slug}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting email course:', error)
    return NextResponse.json({ error: 'Error al eliminar curso' }, { status: 500 })
  }
}
