// src/app/api/admin/messages/[id]/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Contact from '@/models/Contact'

// GET - Obtener un mensaje especifico
export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = await params
    const message = await Contact.findById(id)
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Actualizar mensaje (cambiar status, prioridad, notas, etc)
export async function PATCH(request, { params }) {
  try {


    await dbConnect()
    
    const { id } = await params
    const updates = await request.json()
    
    // Campos permitidos para actualizar
    const allowedUpdates = ['status', 'priority', 'notes', 'tags']
    const filteredUpdates = {}
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    })
    
    // Si cambiamos a "read", actualizar readAt
    if (updates.status === 'read' && !filteredUpdates.readAt) {
      filteredUpdates.readAt = new Date()
    }
    
    // Si cambiamos a "replied", actualizar repliedAt
    if (updates.status === 'replied' && !filteredUpdates.repliedAt) {
      filteredUpdates.repliedAt = new Date()
    }
    
    const message = await Contact.findByIdAndUpdate(
      id,
      { 
        ...filteredUpdates,
        updatedAt: new Date()
      },
      { new: true }
    )
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: 'Message updated successfully', 
      data: message 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Eliminar mensaje
export async function DELETE(request, { params }) {
  try {


    await dbConnect()
    
    const { id } = await params
    const message = await Contact.findByIdAndDelete(id)
    
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}