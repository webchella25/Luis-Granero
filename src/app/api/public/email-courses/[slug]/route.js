// src/app/api/public/email-courses/[slug]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const course = await EmailCourse.findOne({
      slug: params.slug,
      isActive: true
    })
      .select('-emails.htmlContent')
      .lean()

    if (!course) {
      logger.warn(`Email course not found: ${params.slug}`)
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    logger.info(`Fetched email course: ${params.slug}`)
    return NextResponse.json({ course })
  } catch (error) {
    logger.error(`Error fetching email course ${params.slug}`, error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
