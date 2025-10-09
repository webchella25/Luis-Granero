// src/app/api/leads/send-email/route.ts - Ya está correcto, solo verificar
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { leadId, to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    console.log('📧 Enviando email a:', to);

    // Configurar Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Convertir saltos de línea a HTML
    const htmlBody = body
      .split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')
      .replace(/✓/g, '✅');

    // Enviar email
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text: body,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              border-bottom: 3px solid #06b6d4;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h2 {
              color: #06b6d4;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .content {
              font-size: 15px;
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 13px;
              color: #666;
            }
            .footer strong {
              color: #333;
            }
            .footer a {
              color: #06b6d4;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            .unsubscribe {
              margin-top: 20px;
              font-size: 11px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h2>Luis Granero</h2>
              <p>Desarrollo Web Profesional</p>
            </div>
            <div class="content">
              ${htmlBody}
            </div>
            <div class="footer">
              <p>
                <strong>Luis Granero</strong><br>
                Desarrollo Web & Consultoría Digital<br>
                🌐 <a href="https://www.luisgranero.com">www.luisgranero.com</a><br>
                📧 <a href="mailto:luis@luisgranero.com">luis@luisgranero.com</a>
              </p>
              <div class="unsubscribe">
                <p>Si no deseas recibir más correos, responde indicándolo.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Email enviado:', info.messageId);

    // Actualizar lead
    await connectDB();
    await Lead.findByIdAndUpdate(leadId, {
      $set: { 
        status: 'contacted',
        updatedAt: new Date()
      },
      $push: {
        contactHistory: {
          date: new Date(),
          type: 'email',
          emailSubject: subject,
          emailContent: body,
          notes: `Enviado a ${to} vía Brevo`,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      messageId: info.messageId
    });

  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al enviar email',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}