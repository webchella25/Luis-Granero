// src/app/api/budget-requests/route.js - VERSIÓN CORREGIDA
// Solo cambiado: líneas 5-13 (transporter con variables de entorno)

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetRequest from '@/models/BudgetRequest';
import nodemailer from 'nodemailer';

// ✅ CORREGIDO: Configurar transporter con variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS
  }
});

// POST - Enviar solicitud de presupuesto
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { clientInfo, budget, message } = body;
    
    if (!clientInfo?.name || !clientInfo?.email || !budget) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }
    
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const budgetRequest = await BudgetRequest.create({
      clientInfo,
      budget,
      message,
      ipAddress,
      userAgent,
      status: 'pending'
    });
    
    console.log('✅ Presupuesto guardado:', budgetRequest._id);
    
    // Enviar email al admin
    try {
      console.log('📧 Enviando email al admin...');
      await sendAdminNotification(budgetRequest);
      console.log('✅ Email al admin enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email al admin:', emailError);
    }
    
    // Enviar confirmación al cliente
    try {
      console.log('📧 Enviando email al cliente...');
      await sendClientConfirmation(clientInfo, budget);
      console.log('✅ Email al cliente enviado');
    } catch (emailError) {
      console.error('❌ Error enviando confirmación al cliente:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Presupuesto enviado. Te contactaré pronto.',
      budgetId: budgetRequest._id
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}

// GET - Listar presupuestos (admin)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const filter = status && status !== 'all' ? { status } : {};
    
    const budgets = await BudgetRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await BudgetRequest.countDocuments(filter);
    
    const stats = {
      pending: await BudgetRequest.countDocuments({ status: 'pending' }),
      reviewed: await BudgetRequest.countDocuments({ status: 'reviewed' }),
      contacted: await BudgetRequest.countDocuments({ status: 'contacted' }),
      converted: await BudgetRequest.countDocuments({ status: 'converted' }),
      rejected: await BudgetRequest.countDocuments({ status: 'rejected' }),
      total: await BudgetRequest.countDocuments({})
    };
    
    return NextResponse.json({
      budgets,
      stats,
      pagination: { total, limit, skip, hasMore: skip + limit < total }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// PATCH - Actualizar estado
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { budgetId, status, adminNotes } = body;
    
    if (!budgetId) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const budget = await BudgetRequest.findByIdAndUpdate(
      budgetId,
      { 
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes })
      },
      { new: true }
    );
    
    if (!budget) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, budget });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// DELETE - Eliminar presupuesto
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('id');
    
    if (!budgetId) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    const budget = await BudgetRequest.findByIdAndDelete(budgetId);
    
    if (!budget) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Presupuesto eliminado correctamente' 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}

// ========== FUNCIONES DE EMAIL ==========

async function sendAdminNotification(budgetRequest) {
  const { clientInfo, budget } = budgetRequest;
  
  const featuresHTML = budget.selectedFeatures.length > 0
    ? `<li><strong>Características:</strong>
         <ul style="margin-top: 8px;">
           ${budget.selectedFeatures.map(f => 
             `<li style="margin-left: 20px;">• ${f.name} (+${f.price}€)</li>`
           ).join('')}
         </ul>
       </li>`
    : '';
  
  const discountHTML = budget.appliedDiscount
    ? `<li><strong>Descuento aplicado:</strong> ${budget.appliedDiscount.name} (-${budget.appliedDiscount.percentage}%)</li>`
    : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Nuevo Presupuesto</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px;">
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #06b6d4;">${budget.total}€</div>
          </div>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #06b6d4;">
            <h2 style="margin-top: 0; color: #06b6d4; font-size: 18px;">👤 Cliente</h2>
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${clientInfo.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${clientInfo.email}</p>
            ${clientInfo.phone ? `<p style="margin: 5px 0;"><strong>Teléfono:</strong> ${clientInfo.phone}</p>` : ''}
            ${clientInfo.company ? `<p style="margin: 5px 0;"><strong>Empresa:</strong> ${clientInfo.company}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #06b6d4;">
            <h2 style="margin-top: 0; color: #06b6d4; font-size: 18px;">💼 Proyecto</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin: 8px 0;"><strong>Tipo:</strong> ${budget.projectType.name} (${budget.projectType.basePrice}€)</li>
              <li style="margin: 8px 0;"><strong>Plazo:</strong> ${budget.timeline.name}</li>
              ${featuresHTML}
              ${discountHTML}
            </ul>
          </div>
          
          ${budgetRequest.message ? `
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #06b6d4;">
              <h2 style="margin-top: 0; color: #06b6d4; font-size: 18px;">💬 Mensaje</h2>
              <p style="margin: 0; white-space: pre-wrap;">${budgetRequest.message}</p>
            </div>
          ` : ''}
          
          <div style="background: #eff6ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h2 style="margin-top: 0; color: #3b82f6; font-size: 18px;">💰 Desglose</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin: 8px 0;">Subtotal: ${budget.subtotal}€</li>
              ${budget.timelineAdjustment !== 0 ? 
                `<li style="margin: 8px 0;">Ajuste: ${budget.timelineAdjustment > 0 ? '+' : ''}${Math.round(budget.timelineAdjustment)}€</li>` : ''}
              ${budget.discount ? `<li style="margin: 8px 0; color: #10b981;">Descuento: -${Math.round(budget.discount)}€</li>` : ''}
              <li style="margin: 12px 0 0 0; font-size: 20px; font-weight: bold; color: #06b6d4;">TOTAL: ${budget.total}€</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://luisgranero.com/admin/calculator" style="display: inline-block; background: #06b6d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ver en Panel Admin
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: '"Luis Granero - Presupuestos" <luis@luisgranero.com>',
    to: 'luis@luisgranero.com',
    subject: `🎯 Nuevo Presupuesto: ${clientInfo.name} - ${budget.total}€`,
    html
  });
}

async function sendClientConfirmation(clientInfo, budget) {
  const featuresHTML = budget.selectedFeatures.length > 0
    ? budget.selectedFeatures.map(f => `<li style="margin: 8px 0;">✓ ${f.name}</li>`).join('')
    : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 40px 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">¡Gracias por tu solicitud!</h1>
          <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.95;">He recibido tu presupuesto correctamente</p>
        </div>
        
        <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hola <strong>${clientInfo.name}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.8;">
            He recibido tu solicitud de presupuesto y me pondré en contacto contigo en las <strong>próximas 24-48 horas</strong> para discutir los detalles de tu proyecto.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px solid #06b6d4;">
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">PRESUPUESTO ESTIMADO</div>
            <div style="font-size: 42px; font-weight: bold; color: #06b6d4; margin: 10px 0;">${budget.total}€</div>
            <div style="color: #6b7280; font-size: 13px; margin-top: 8px;">*Presupuesto orientativo</div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #06b6d4; font-size: 20px;">📋 Resumen de tu solicitud</h2>
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="margin: 12px 0;"><strong>Proyecto:</strong> ${budget.projectType.name}</li>
              <li style="margin: 12px 0;"><strong>Plazo:</strong> ${budget.timeline.name}</li>
              ${featuresHTML ? `
                <li style="margin: 12px 0;">
                  <strong>Características incluidas:</strong>
                  <ul style="margin: 10px 0 0 20px; padding: 0;">
                    ${featuresHTML}
                  </ul>
                </li>
              ` : ''}
            </ul>
          </div>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #3b82f6;">🔄 Próximos pasos:</p>
            <ol style="margin: 0; padding-left: 25px; line-height: 1.8;">
              <li>Revisaré tu solicitud en detalle</li>
              <li>Te contactaré para una breve llamada</li>
              <li>Ajustaremos el presupuesto según tus necesidades</li>
              <li>¡Empezamos a trabajar en tu proyecto!</li>
            </ol>
          </div>
          
          <p style="font-size: 16px; line-height: 1.8; margin-top: 30px;">
            Si tienes alguna pregunta urgente, no dudes en responder a este email o llamarme directamente.
          </p>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 5px 0; color: #374151;"><strong style="font-size: 16px;">Luis Granero</strong></p>
            <p style="margin: 5px 0; color: #6b7280;">Desarrollo Web Freelance</p>
            <p style="margin: 15px 0 5px 0;">
              <a href="https://luisgranero.com" style="color: #06b6d4; text-decoration: none;">🌐 www.luisgranero.com</a>
            </p>
            <p style="margin: 5px 0;">
              <a href="mailto:luis@luisgranero.com" style="color: #06b6d4; text-decoration: none;">📧 luis@luisgranero.com</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: '"Luis Granero" <luis@luisgranero.com>',
    to: clientInfo.email,
    subject: '✅ Presupuesto recibido - Luis Granero',
    html
  });
}