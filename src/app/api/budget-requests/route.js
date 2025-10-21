import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetRequest from '@/models/BudgetRequest';
import nodemailer from 'nodemailer';

// Configurar transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

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
      await sendAdminNotification(budgetRequest);
      console.log('✅ Email al admin enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email al admin:', emailError);
    }
    
    // Enviar confirmación al cliente
    try {
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
    
    // Contar por estado
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
  const transporter = getTransporter();
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
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .price { font-size: 32px; font-weight: bold; color: #06b6d4; text-align: center; margin: 20px 0; }
        .section { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #06b6d4; }
        ul { list-style: none; padding: 0; }
        li { margin: 8px 0; }
        .button { display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">🎯 Nuevo Presupuesto Solicitado</h2>
        </div>
        
        <div class="content">
          <div class="price">${budget.total}€</div>
          
          <div class="section">
            <h3 style="margin-top: 0; color: #06b6d4;">👤 Datos del Cliente</h3>
            <ul>
              <li><strong>Nombre:</strong> ${clientInfo.name}</li>
              <li><strong>Email:</strong> <a href="mailto:${clientInfo.email}">${clientInfo.email}</a></li>
              ${clientInfo.phone ? `<li><strong>Teléfono:</strong> <a href="tel:${clientInfo.phone}">${clientInfo.phone}</a></li>` : ''}
              ${clientInfo.company ? `<li><strong>Empresa:</strong> ${clientInfo.company}</li>` : ''}
            </ul>
          </div>
          
          <div class="section">
            <h3 style="margin-top: 0; color: #06b6d4;">💼 Detalles del Proyecto</h3>
            <ul>
              <li><strong>Tipo:</strong> ${budget.projectType.name} (${budget.projectType.basePrice}€)</li>
              <li><strong>Plazo:</strong> ${budget.timeline.name} (${budget.timeline.days} días)</li>
              ${featuresHTML}
              ${discountHTML}
            </ul>
          </div>
          
          ${budgetRequest.message ? `
            <div class="section">
              <h3 style="margin-top: 0; color: #06b6d4;">💬 Mensaje del Cliente</h3>
              <p style="margin: 0; white-space: pre-wrap;">${budgetRequest.message}</p>
            </div>
          ` : ''}
          
          <div class="section" style="background: #eff6ff; border-left-color: #3b82f6;">
            <h3 style="margin-top: 0; color: #3b82f6;">💰 Desglose de Precio</h3>
            <ul>
              <li>Subtotal: ${budget.subtotal}€</li>
              ${budget.timelineAdjustment !== 0 ? 
                `<li>Ajuste por plazo: ${budget.timelineAdjustment > 0 ? '+' : ''}${Math.round(budget.timelineAdjustment)}€</li>` : ''}
              ${budget.discount ? `<li style="color: #10b981;">Descuento: -${Math.round(budget.discount)}€</li>` : ''}
              <li style="font-size: 18px; font-weight: bold; color: #06b6d4; margin-top: 10px;">TOTAL: ${budget.total}€</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/calculator" class="button">
              Ver en Panel Admin
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Luis Granero Web" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'luis@luisgranero.com',
    subject: `🎯 Nuevo Presupuesto: ${clientInfo.name} - ${budget.total}€`,
    html
  });
}

async function sendClientConfirmation(clientInfo, budget) {
  const transporter = getTransporter();
  
  const featuresHTML = budget.selectedFeatures.length > 0
    ? budget.selectedFeatures.map(f => `<li>✓ ${f.name}</li>`).join('')
    : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .price-box { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #06b6d4; }
        .price { font-size: 36px; font-weight: bold; color: #06b6d4; }
        ul { background: white; padding: 20px; border-radius: 8px; }
        li { margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu solicitud!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">He recibido tu presupuesto correctamente</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${clientInfo.name}</strong>,</p>
          
          <p>He recibido tu solicitud de presupuesto y me pondré en contacto contigo en las <strong>próximas 24-48 horas</strong> para discutir los detalles de tu proyecto.</p>
          
          <div class="price-box">
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">PRESUPUESTO ESTIMADO</div>
            <div class="price">${budget.total}€</div>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">*Este es un presupuesto orientativo</div>
          </div>
          
          <h3 style="color: #06b6d4;">📋 Resumen de tu solicitud:</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li><strong>Proyecto:</strong> ${budget.projectType.name}</li>
            <li><strong>Plazo:</strong> ${budget.timeline.name}</li>
            ${featuresHTML ? `<li><strong>Características incluidas:</strong><ul style="margin-top: 10px; padding-left: 20px;">${featuresHTML}</ul></li>` : ''}
          </ul>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0;"><strong>🔄 Próximos pasos:</strong></p>
            <ol style="margin: 10px 0 0 20px; padding: 0;">
              <li>Revisaré tu solicitud en detalle</li>
              <li>Te contactaré para una breve llamada/videollamada</li>
              <li>Ajustaremos el presupuesto según tus necesidades</li>
              <li>¡Empezamos a trabajar!</li>
            </ol>
          </div>
          
          <p>Si tienes alguna pregunta urgente, no dudes en responder a este email.</p>
          
          <div class="footer">
            <p><strong>Luis Granero</strong><br>
            Desarrollo Web Freelance<br>
            🌐 <a href="https://luisgranero.com" style="color: #06b6d4;">www.luisgranero.com</a><br>
            📧 <a href="mailto:luis@luisgranero.com" style="color: #06b6d4;">luis@luisgranero.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: `"Luis Granero" <${process.env.SMTP_USER}>`,
    to: clientInfo.email,
    subject: '✅ Presupuesto recibido - Luis Granero',
    html
  });
}