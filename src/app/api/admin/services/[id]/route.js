// src/app/api/admin/services/[id]/route.js - NUEVA API
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import { checkAuth } from '@/lib/checkAuth'

export async function PUT(request, { params }) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const data = await request.json()
    
    const service = await Service.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    )
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, service })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const service = await Service.findByIdAndUpdate(
      params.id,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    )
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}