// src/app/api/public/email-courses/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import EmailCourse from '@/models/EmailCourse'
import logger from '@/lib/logger'

export async function GET() {
  try {
    await dbConnect()

    const courses = await EmailCourse.find({ isActive: true })
      .select('-emails.htmlContent') // No enviar el HTML completo
      .sort({ createdAt: -1 })
      .lean()

    logger.info(`Fetched ${courses.length} email courses`)
    return NextResponse.json({ courses })
  } catch (error) {
    logger.error('Error fetching email courses', error)
    return NextResponse.json({ courses: [] })
  }
}
