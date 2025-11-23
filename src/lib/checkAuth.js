// src/lib/checkAuth.js
import { getServerSession } from 'next-auth/next'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export async function checkAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    
    console.log('🔍 CheckAuth - Token exists:', !!token)
    
    if (!token) {
      console.log('❌ No token found')
      return null
    }
    
    const { payload } = await jwtVerify(token, secret)
    
    console.log('✅ Token valid for:', payload.email)
    
    return {
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    }
  } catch (error) {
    console.error('❌ CheckAuth error:', error.message)
    return null
  }
}