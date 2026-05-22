// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { rateLimit, getClientIP } from '@/lib/rateLimit'
import logger from '@/lib/logger'
import { loginSchema, validate } from '@/lib/validations'

const SESSION_MAX_AGE = 14 * 24 * 60 * 60

export async function POST(request) {
  const startTime = Date.now()

  try {
    // Rate limiting: 5 intentos por 15 minutos por IP
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)
      logger.warn(`Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        {
          error: 'Demasiados intentos de login',
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
    const validation = validate(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Datos inválidos',
        details: validation.errors
      }, { status: 400 })
    }

    const { email, password } = validation.data

    const result = await login(email, password)

    if (!result) {
      logger.auth('Login failed', { email })
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    logger.auth('Login successful', { email })

    const response = NextResponse.json({ 
      success: true,
      user: {
        email: result.user.email,
        role: result.user.role
      },
      redirect: '/admin' // Indicar dónde redirigir
    })
    
    response.cookies.set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/'
    })
    
    logger.api('POST', '/api/auth/login', 200, Date.now() - startTime)
    return response
  } catch (error) {
    logger.error('Login error', error)
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    }, { status: 500 })
  }
}
