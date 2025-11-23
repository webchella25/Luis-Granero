// src/app/api/subscribe/react-5-dias/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'
import { addContactToBrevoList } from '@/lib/brevo-client'

export async function POST(request) {
  try {
    const { email, name } = await request.json()

    // Validaciones
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email y nombre son requeridos' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Verificar si ya está suscrito
    const existingSub = await Subscriber.findOne({ 
      email: email.toLowerCase(),
      course: 'react-5-dias'
    })

    if (existingSub) {
      return NextResponse.json(
        { error: 'Este email ya está registrado en el curso' },
        { status: 400 }
      )
    }

    // Guardar en MongoDB
    const subscriber = await Subscriber.create({
      email: email.toLowerCase(),
      name,
      course: 'react-5-dias',
      source: 'landing-react-5-dias',
      status: 'active',
      subscribedAt: new Date()
    })

    console.log('✅ Suscriptor guardado en MongoDB:', subscriber._id)

    // Añadir a lista de Brevo (esto dispara la automatización)
    const brevoResult = await addContactToBrevoList(
      email,
      name,
      process.env.BREVO_LIST_ID
    )

    if (!brevoResult.success) {
      console.error('⚠️ Error añadiendo a Brevo, pero usuario guardado en DB')
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa. Revisa tu email en 1 minuto.'
    })

  } catch (error) {
    console.error('❌ Error en suscripción:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}