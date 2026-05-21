// src/app/api/admin/services/route.js - CREAR ESTE ARCHIVO
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
export async function GET() {
  try {

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


    await connectDB()
    
    const data = await request.json()
    const service = await Service.create(data)
    
    return NextResponse.json({ success: true, service })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}