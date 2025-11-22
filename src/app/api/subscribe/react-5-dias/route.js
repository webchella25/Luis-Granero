// src/app/api/subscribe/react-5-dias/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'
import { sendBrevoEmail } from '@/lib/email/brevo-client'

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

    // Guardar suscriptor en DB
    const subscriber = await Subscriber.create({
      email: email.toLowerCase(),
      name,
      course: 'react-5-dias',
      source: 'landing-react-5-dias',
      status: 'active',
      subscribedAt: new Date()
    })

    // Enviar email de bienvenida + Día 1
    await sendBrevoEmail({
      to: [{ email, name }],
      templateId: 1, // ID de tu template en Brevo
      params: {
        FIRSTNAME: name,
        COURSE_NAME: 'React en 5 Días'
      }
    })

    // Agregar a lista de Brevo para campaña automática
    if (process.env.BREVO_API_KEY) {
      try {
        const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            attributes: {
              FIRSTNAME: name,
              CURSO: 'react-5-dias'
            },
            listIds: [parseInt(process.env.BREVO_LIST_REACT_5_DIAS || '2')],
            updateEnabled: true
          })
        })

        if (!brevoResponse.ok) {
          console.error('Error adding to Brevo:', await brevoResponse.text())
        }
      } catch (brevoError) {
        console.error('Brevo API error:', brevoError)
        // No fallar si Brevo falla, ya tenemos el suscriptor en DB
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa. Revisa tu email.'
    })

  } catch (error) {
    console.error('Error en suscripción:', error)
    return NextResponse.json(
      { error: 'Error al procesar la suscripción' },
      { status: 500 }
    )
  }
}