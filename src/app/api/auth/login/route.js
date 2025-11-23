// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    // Rate limiting: 5 intentos por 15 minutos por IP
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 5, 15 * 60 * 1000)

    if (!rateLimitResult.success) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`)
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

    console.log('🔐 Login attempt...')

    const { email, password } = await request.json()
    console.log('📧 Email:', email)
    
    const result = await login(email, password)
    console.log('🔍 Login result:', result ? 'SUCCESS' : 'FAILED')
    
    if (!result) {
      console.log('❌ Invalid credentials')
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }
    
    const cookieStore = await cookies()
    
    console.log('🍪 Setting cookie...')
    
    // Configuración mejorada de cookie
    cookieStore.set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      // NO establecer domain para que funcione en subdominio
    })
    
    console.log('✅ Login successful for:', email)
    
    // Crear respuesta con header adicional para forzar cookie
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: result.user.email,
        role: result.user.role
      },
      redirect: '/admin' // Indicar dónde redirigir
    })
    
    // Establecer cookie también en el header de respuesta
    response.cookies.set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 })
  }
}