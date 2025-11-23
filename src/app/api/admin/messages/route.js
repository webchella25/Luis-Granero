// src/app/api/admin/messages/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Contact from '@/models/Contact'

export async function GET(request) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Obtener parametros de busqueda
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    
    // Construir query
    let query = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority
    }
    
    if (search) {
      query.$or = [
        { 'personal.name': { $regex: search, $options: 'i' } },
        { 'personal.email': { $regex: search, $options: 'i' } },
        { 'personal.company': { $regex: search, $options: 'i' } },
        { 'project.description': { $regex: search, $options: 'i' } }
      ]
    }
    
    // Obtener mensajes
    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    
    // Obtener estadisticas
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    
    const statsObj = {
      total: messages.length,
      new: stats.find(s => s._id === 'new')?.count || 0,
      read: stats.find(s => s._id === 'read')?.count || 0,
      replied: stats.find(s => s._id === 'replied')?.count || 0,
      archived: stats.find(s => s._id === 'archived')?.count || 0
    }
    
    return NextResponse.json({ 
      messages,
      stats: statsObj
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}