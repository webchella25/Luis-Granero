// src/app/api/admin/init/route.js - Con recreación forzada
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
    await dbConnect()
    
    // Eliminar admin existente para recrear limpio
    await User.deleteOne({ email: process.env.ADMIN_EMAIL })
    console.log('Deleted existing admin')
    
    // Crear admin nuevo
    const admin = new User({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: 'Luis Granero',
      role: 'admin'
    })
    
    await admin.save()
    console.log('New admin created')
    
    return NextResponse.json({ 
      message: 'Admin recreated successfully',
      email: process.env.ADMIN_EMAIL,
      passwordSet: !!process.env.ADMIN_PASSWORD,
      envCheck: {
        email: process.env.ADMIN_EMAIL,
        passwordLength: process.env.ADMIN_PASSWORD?.length
      }
    })
  } catch (error) {
    console.error('Error with admin:', error)
    return NextResponse.json({ 
      message: 'Error with admin',
      error: error.message 
    }, { status: 500 })
  }
}