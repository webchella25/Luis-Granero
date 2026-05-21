// src/app/admin/auth-wrapper.js
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

export async function AdminAuthWrapper({ children }) {
  // Obtener la ruta actual
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''

  // Si es la página de login, no verificar auth
  if (pathname.includes('/admin/login')) {
    return <>{children}</>
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    redirect('/admin/login')
  }

  // Verificar token válido
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    await jwtVerify(token, secret)
  } catch (error) {
    redirect('/admin/login')
  }

  return <>{children}</>
}