// src/app/api/test-mongodb/route.js
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET() {
  try {
    console.log('🔗 Testing MongoDB connection...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    console.log('MONGODB_URI preview:', process.env.MONGODB_URI?.substring(0, 50) + '...')
    
    // Desconectar si hay conexión previa
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    
    // Conectar con opciones explícitas
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    console.log('✅ MongoDB connected successfully')
    
    // Test básico
    const collections = await mongoose.connection.db.listCollections().toArray()
    
    return NextResponse.json({ 
      success: true,
      message: 'MongoDB connection successful',
      database: mongoose.connection.name,
      collections: collections.map(c => c.name),
      readyState: mongoose.connection.readyState
    })
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      code: error.code,
      name: error.name
    }, { status: 500 })
  }
}