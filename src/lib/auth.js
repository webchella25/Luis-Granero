// src/lib/auth.js - JWT MANUAL
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

export async function login(email, password) {
  await dbConnect()
  
  const user = await User.findOne({ email })
  if (!user) return null
  
  const isValid = await bcrypt.compare(password, user.password || '')
  if (!isValid) return null
  
  const token = await new SignJWT({
    id: user._id.toString(),
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('14d') // Reducido de 30d a 14d por seguridad
    .sign(secret)
  
  return { user, token }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role
      }
    }
  } catch {
    return null
  }
}

export async function checkAuth() {
  return await getSession()
}