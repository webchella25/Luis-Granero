// src/app/api/admin/services/route.js - CREAR ESTE ARCHIVO
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const services = await Service.find({ isActive: true })
      .sort({ orderIndex: 1 })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json([], { status: 200 }) // Devolver array vacío en lugar de error
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const data = await request.json()
    const service = await Service.create(data)
    
    return NextResponse.json({ success: true, service })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}