// src/app/api/admin/students/[id]/notify/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email/mailer';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type, customMessage, customSubject } = body;
    // types: welcome, completion, inactive_reminder, level_up, custom

    // Obtener estudiante
    const student = await User.findById(params.id).lean();

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Estudiante no encontrado' },
        { status: 404 }
      );
    }


    // Preparar email según tipo
    let subject, html;

    switch (type) {
      case 'welcome':
        subject = '¡Bienvenido a nuestra plataforma! 🎓';
        html = getWelcomeEmailTemplate(student);
        break;

      case 'completion':
        subject = '🎉 ¡Felicidades por completar el curso!';
        html = getCompletionEmailTemplate(student);
        break;

      case 'inactive_reminder':
        subject = '¡Te extrañamos! Continúa tu aprendizaje 📚';
        html = getInactiveReminderTemplate(student);
        break;

      case 'level_up':
        subject = `🎊 ¡Has alcanzado el nivel ${student.studentProfile?.level || 1}!`;
        html = getLevelUpTemplate(student);
        break;

      case 'custom':
        subject = customSubject || 'Mensaje del equipo';
        html = getCustomEmailTemplate(student, customMessage);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de notificación no válido' },
          { status: 400 }
        );
    }

    // Enviar email
    await sendEmail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.SMTP_USER}>`,
      to: student.email,
      subject,
      html
    });

    console.log(`✅ Email enviado a ${student.email}: ${type}`);

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada correctamente'
    });

  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function getWelcomeEmailTemplate(student) {
  const name = student.username;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 ¡Bienvenido/a!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <p>¡Estamos emocionados de tenerte en nuestra plataforma de aprendizaje!</p>
      <p>Aquí podrás:</p>
      <ul>
        <li>📚 Acceder a cursos de calidad</li>
        <li>🏆 Ganar XP y subir de nivel</li>
        <li>📜 Obtener certificados</li>
        <li>📈 Seguir tu progreso</li>
      </ul>
      <p>¿Listo para comenzar?</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/estudiante/dashboard" class="button">Ir a mi Dashboard</a>
      <p>¡Éxitos en tu aprendizaje!</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCompletionEmailTemplate(student) {
  const name = student.username;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .celebration { font-size: 50px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Felicidades!</h1>
    </div>
    <div class="content">
      <div class="celebration">🎊 🏆 🎓</div>
      <p>Hola <strong>${name}</strong>,</p>
      <p>¡Has completado un curso! Esto es un gran logro y estamos muy orgullosos de ti.</p>
      <p>Tu certificado ya está disponible en tu dashboard.</p>
      <p>¿Qué sigue?</p>
      <ul>
        <li>Comparte tu logro en redes sociales</li>
        <li>Explora más cursos</li>
        <li>Sigue aprendiendo y creciendo</li>
      </ul>
      <p>¡Sigue así! 💪</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getInactiveReminderTemplate(student) {
  const name = student.username;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 ¡Te extrañamos!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <p>Hace tiempo que no te vemos por aquí. Tus cursos te están esperando! 😊</p>
      <p>Recuerda que la constancia es clave para el aprendizaje. Incluso 15 minutos al día pueden hacer una gran diferencia.</p>
      <p>¿Listo para continuar donde lo dejaste?</p>
      <a href="${process.env.NEXT_PUBLIC_URL}/estudiante/dashboard" class="button">Continuar Aprendiendo</a>
      <p>¡Te esperamos!</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getLevelUpTemplate(student) {
  const name = student.username;
  const level = student.studentProfile?.level || 1;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .level { font-size: 60px; font-weight: bold; text-align: center; color: #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 ¡Nivel Alcanzado!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <div class="level">NIVEL ${level}</div>
      <p>¡Has subido de nivel! Cada paso te acerca más a tus objetivos.</p>
      <p>Tu dedicación y esfuerzo están dando frutos. ¡Sigue así!</p>
      <p>¿Qué lograrás a continuación? 🚀</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCustomEmailTemplate(student, message) {
  const name = student.username;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Mensaje del equipo</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${name}</strong>,</p>
      <div style="white-space: pre-wrap;">${message}</div>
    </div>
  </div>
</body>
</html>
  `;
}
