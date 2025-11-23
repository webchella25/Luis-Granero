// src/app/admin/auth-wrapper.js
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

export async function AdminAuthWrapper({ children, isLoginPage }) {
  // Si es login, no verificar auth
  if (isLoginPage) {
    return <>{children}</>
  }
  
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  console.log('🔐 Auth Wrapper - Token exists:', !!token)
  
  if (!token) {
    console.log('❌ No token, redirecting to login')
    redirect('/admin/login')
  }
  
  // Verificar token válido
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Token valid for:', payload.email)
  } catch (error) {
    console.log('❌ Invalid token:', error.message)
    redirect('/admin/login')
  }
  
  return <>{children}</>
}