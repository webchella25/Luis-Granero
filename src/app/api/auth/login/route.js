// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth'

export async function POST(request) {
  try {
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