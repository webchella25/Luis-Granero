// src/app/api/admin/check/route.js - Crear este archivo
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await dbConnect()
    
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL })
    
    if (!admin) {
      return NextResponse.json({ 
        message: 'Admin not found',
        envEmail: process.env.ADMIN_EMAIL,
        envPassword: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET'
      })
    }

    return NextResponse.json({ 
      message: 'Admin found',
      email: admin.email,
      name: admin.name || admin.username,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0,
      envEmail: process.env.ADMIN_EMAIL,
      envPassword: process.env.ADMIN_PASSWORD ? 'SET' : 'NOT SET'
    })
  } catch (error) {
    console.error('Error checking admin:', error)
    return NextResponse.json({ 
      message: 'Error checking admin', 
      error: error.message 
    }, { status: 500 })
  }
}