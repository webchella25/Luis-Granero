// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    const result = await login(email, password)
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const cookieStore = await cookies()
    cookieStore.set('session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 días
    })
    
    return NextResponse.json({ user: result.user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}