// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { rateLimit, getClientIP } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { registerSchema, validate } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const startTime = Date.now()

  try {
    // Rate limiting: 3 registros por hora por IP
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 3, 60 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)
      logger.warn(`Rate limit exceeded for registration IP: ${clientIP}`)
      return NextResponse.json(
        {
          error: 'Demasiados intentos de registro',
          message: `Por favor, intenta de nuevo en ${resetIn} minutos`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000))
          }
        }
      )
    }

    const body = await request.json()

    // Validar input
    const validation = validate(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: validation.errors
      }, { status: 400 })
    }

    const { username, email, password, firstName, lastName } = validation.data

    await dbConnect()

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username'
      logger.warn(`Registration failed: ${field} already exists`, { email, username })
      return NextResponse.json({
        error: `El ${field === 'email' ? 'correo electrónico' : 'nombre de usuario'} ya está registrado`
      }, { status: 409 })
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password, // Se hasheará automáticamente por el pre-save hook
      role: 'user', // Por defecto es usuario normal
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      },
      emailVerified: false,
      isActive: true,
      studentProfile: {
        totalXP: 0,
        level: 1,
        achievements: [],
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalStudyTime: 0,
        streak: {
          current: 0,
          longest: 0
        },
        learningPreferences: {
          difficulty: 'principiante',
          topics: [],
          studyGoal: 'hobby'
        }
      },
      subscription: {
        plan: 'free',
        status: 'active'
      }
    })

    logger.info('User registered successfully', {
      userId: user._id,
      email: user.email,
      username: user.username
    })

    // No devolver la contraseña
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName
      }
    }

    logger.api('POST', '/api/auth/register', 201, Date.now() - startTime)

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userResponse
    }, { status: 201 })

  } catch (error) {
    logger.error('Registration error', error)

    // Manejar errores de validación de MongoDB
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Error de validación',
        details: Object.values(error.errors).map(e => e.message)
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 })
  }
}
