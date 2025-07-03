// src/app/api/admin/init/route.js - VERSION CORREGIDA
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  return await initAdmin()
}

export async function POST() {
  return await initAdmin()
}

async function initAdmin() {
  try {
    console.log('🔍 Starting admin initialization...')
    
    // Verificar variables de entorno
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ 
        success: false,
        error: 'ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables'
      }, { status: 500 })
    }
    
    await dbConnect()
    console.log('✅ Connected to MongoDB')
    
    // Eliminar admin existente para evitar conflictos
    await User.deleteOne({ email: process.env.ADMIN_EMAIL })
    console.log('🔄 Cleaned existing admin user')
    
    // Crear nuevo admin - LA CONTRASEÑA SE HASHEARÁ AUTOMÁTICAMENTE por el modelo
    const admin = new User({
      username: 'Luis Granero', // El modelo requiere username
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, // SIN hashear - el modelo lo hace automáticamente
      role: 'admin',
      profile: {
        firstName: 'Luis',
        lastName: 'Granero'
      },
      isActive: true
    })
    
    await admin.save() // Aquí se ejecuta el pre('save') hook que hashea la password
    console.log('✅ Admin user created successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin created successfully',
      email: admin.email,
      username: admin.username,
      role: admin.role,
      passwordWasHashed: true
    })
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Error creating admin',
      error: error.message,
      details: error.code || 'Unknown error'
    }, { status: 500 })
  }
}