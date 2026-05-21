// src/app/api/admin/email-courses/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'

// GET - Listar todos los cursos de email
export async function GET(request) {
  try {

    await dbConnect()

    const courses = await EmailCourse.find({})
      .sort({ createdAt: -1 })

    return NextResponse.json({ courses })
  } catch (error) {
    logger.error('Error fetching email courses:', error)
    return NextResponse.json({ error: 'Error al cargar cursos' }, { status: 500 })
  }
}

// POST - Crear nuevo curso
export async function POST(request) {
  try {


    const data = await request.json()

    await dbConnect()

    // Validar datos requeridos
    if (!data.title || !data.slug || !data.description) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Verificar que el slug no exista
    const existing = await EmailCourse.findOne({ slug: data.slug })
    if (existing) {
      return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 })
    }

    // Crear curso
    const course = await EmailCourse.create({
      title: data.title,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      icon: data.icon || '📧',
      color: data.color || 'cyan',
      totalDays: data.totalDays || 5,
      emails: data.emails || [],
      benefits: data.benefits || [],
      whatYouLearn: data.whatYouLearn || [],
      testimonials: data.testimonials || [],
      ctaText: data.ctaText || 'Comenzar Gratis',
      sendTime: data.sendTime || '09:00',
      isActive: data.isActive !== undefined ? data.isActive : true
    })

    logger.info(`Email course created: ${course.slug}`)

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    logger.error('Error creating email course:', error)
    return NextResponse.json({ error: 'Error al crear curso' }, { status: 500 })
  }
}
