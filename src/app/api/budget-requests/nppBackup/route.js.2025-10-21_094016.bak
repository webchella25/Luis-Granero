import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BudgetRequest from '@/models/BudgetRequest';
import nodemailer from 'nodemailer';

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
    
    // Enviar email al admin
    try {
      await sendAdminNotification(budgetRequest);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
    }
    
    // Enviar confirmación al cliente
    try {
      await sendClientConfirmation(clientInfo, budget);
    } catch (emailError) {
      console.error('Error enviando confirmación:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Presupuesto enviado. Te contactaré pronto.',
      budgetId: budgetRequest._id
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}

// GET - Listar presupuestos (admin)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const filter = status ? { status } : {};
    
    const budgets = await BudgetRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await BudgetRequest.countDocuments(filter);
    
    return NextResponse.json({
      budgets,
      pagination: { total, limit, skip, hasMore: skip + limit < total }
    });
    
  } catch (error) {
    console.error('Error:', error);
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
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

// EMAIL AL ADMIN
async function sendAdminNotification(budgetRequest) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.BREVO_SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.BREVO_SMTP_PASS
    }
  });
  
  const { clientInfo, budget } = budgetRequest;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #06b6d4;">🎯 Nuevo Presupuesto Solicitado</h2>
      
      <h3>Cliente:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${clientInfo.name}</li>
        <li><strong>Email:</strong> ${clientInfo.email}</li>
        ${clientInfo.phone ? `<li><strong>Teléfono:</strong> ${clientInfo.phone}</li>` : ''}
        ${clientInfo.company ? `<li><strong>Empresa:</strong> ${clientInfo.company}</li>` : ''}
      </ul>
      
      <h3>Proyecto:</h3>
      <ul>
        <li><strong>Tipo:</strong> ${budget.projectType.name} (${budget.projectType.basePrice}€)</li>
        <li><strong>Plazo:</strong> ${budget.timeline.name}</li>
        ${budget.selectedFeatures.length > 0 ? `
          <li><strong>Características:</strong>
            <ul>${budget.selectedFeatures.map(f => `<li>${f.name} (+${f.price}€)</li>`).join('')}</ul>
          </li>
        ` : ''}
      </ul>
      
      <h3 style="color: #06b6d4;">Total: ${budget.total}€</h3>
      
      ${budgetRequest.message ? `<p><strong>Mensaje:</strong><br>${budgetRequest.message}</p>` : ''}
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Luis Granero Web" <${process.env.SMTP_USER || process.env.BREVO_SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'luis@luisgranero.com',
    subject: `🎯 Nuevo Presupuesto: ${clientInfo.name} - ${budget.total}€`,
    html
  });
}

// EMAIL AL CLIENTE
async function sendClientConfirmation(clientInfo, budget) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.BREVO_SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.BREVO_SMTP_PASS
    }
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #06b6d4;">¡Gracias ${clientInfo.name}!</h2>
      <p>He recibido tu solicitud y me pondré en contacto en 24-48 horas.</p>
      
      <h3>Resumen:</h3>
      <ul>
        <li><strong>Proyecto:</strong> ${budget.projectType.name}</li>
        <li><strong>Plazo:</strong> ${budget.timeline.name}</li>
        <li><strong>Presupuesto estimado:</strong> ${budget.total}€</li>
      </ul>
      
      <p>Este es un presupuesto orientativo. Discutiremos los detalles para ajustarlo.</p>
      <p>Saludos,<br><strong>Luis Granero</strong><br>Desarrollo Web Freelance</p>
    </div>
  `;
  
  await transporter.sendMail({
    from: `"Luis Granero" <${process.env.SMTP_USER || process.env.BREVO_SMTP_USER}>`,
    to: clientInfo.email,
    subject: '✅ Presupuesto recibido - Luis Granero',
    html
  });
}