// test-brevo-final.js
const nodemailer = require('nodemailer');

async function testBrevo() {
  console.log('📧 Test final Brevo + Namecheap...\n');

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '97fd27001@smtp-brevo.com',
      pass: 'KTcWQIh2szOLS34N',
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Luis Granero - Desarrollo Web" <luis@luisgranero.com>',
      to: 'webchella@gmail.com',
      subject: '✅ Test Final - Sistema de Leads',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
          <div style="border-bottom: 3px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px;">
            <h2 style="color: #06b6d4; margin: 0;">Luis Granero</h2>
            <p style="color: #666; margin: 5px 0 0 0;">Desarrollo Web Profesional</p>
          </div>
          
          <h3>✅ Sistema configurado correctamente</h3>
          <p>Si recibes este email desde <strong>luis@luisgranero.com</strong>, significa que:</p>
          <ul>
            <li>✅ DNS configurado correctamente</li>
            <li>✅ Brevo funcionando</li>
            <li>✅ Email profesional verificado</li>
            <li>✅ Sistema listo para enviar a leads</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #666; font-size: 13px;">
            <strong>Luis Granero</strong><br>
            Desarrollo Web & Consultoría Digital<br>
            🌐 www.luisgranero.com<br>
            📧 luis@luisgranero.com
          </p>
        </div>
      `,
    });

    console.log('✅ Email enviado!');
    console.log('📬 Message ID:', info.messageId);
    console.log('\n🎉 Revisa webchella@gmail.com');
    console.log('⚠️ IMPORTANTE: Revisa también SPAM por si acaso');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrevo();