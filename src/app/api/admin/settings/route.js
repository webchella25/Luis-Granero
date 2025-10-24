// src/app/api/admin/settings/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'

// GET - Obtener configuración actual
export async function GET() {
  try {
    await dbConnect()
    
    // Obtener todas las configuraciones
    const configs = await SiteConfig.find({}).lean()
    
    // Organizar por categorías
    const settings = {
      site: {},
      social: {},
      analytics: {},
      seo: {},
      email: {},
      maintenance: {}
    }
    
    configs.forEach(config => {
      const category = config.category || 'site'
      if (settings[category]) {
        // Extraer el nombre del campo del key
        // Ejemplo: 'site_name' -> 'name'
        const fieldName = config.key.replace(`${category}_`, '')
        settings[category][fieldName] = config.value
      }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Guardar configuración
export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    console.log('💾 Guardando configuración:', data)
    
    // Guardar cada categoría en SiteConfig
    const savePromises = []
    
    // Procesar cada categoría
    for (const [category, fields] of Object.entries(data)) {
      if (typeof fields === 'object' && fields !== null) {
        for (const [field, value] of Object.entries(fields)) {
          const key = `${category}_${field}`
          
          savePromises.push(
            SiteConfig.findOneAndUpdate(
              { key },
              {
                key,
                value,
                category,
                type: typeof value,
                isPublic: category !== 'email' && category !== 'analytics',
                updatedAt: new Date()
              },
              { upsert: true, new: true }
            )
          )
        }
      }
    }
    
    await Promise.all(savePromises)
    console.log('✅ Configuración guardada exitosamente')
    
    return NextResponse.json({ 
      message: 'Configuración guardada exitosamente',
      success: true
    })
  } catch (error) {
    console.error('❌ Error guardando configuración:', error)
    return NextResponse.json({ 
      error: error.message,
      success: false
    }, { status: 500 })
  }
}