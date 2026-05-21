// src/lib/email/mailer.js — Mailer centralizado con sendmail local (VPS)
import nodemailer from 'nodemailer';

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Luis Granero';
const FROM_EMAIL = process.env.EMAIL_FROM || 'luis@luisgranero.com';

function createTransporter() {
  // Sendmail local del VPS — sin dependencia de servicios externos
  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
    args: ['-f', FROM_EMAIL]
  });
}

/**
 * Envía un email usando sendmail del VPS
 * @param {object} options
 * @param {string|string[]} options.to - Destinatario(s)
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Cuerpo HTML
 * @param {string} [options.text] - Cuerpo texto plano (fallback)
 * @param {string} [options.from] - Remitente (por defecto luis@luisgranero.com)
 * @param {string} [options.replyTo] - Reply-To
 * @param {object[]} [options.attachments] - Adjuntos nodemailer
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html, text, from, replyTo, attachments }) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: from || `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || stripHtml(html),
      ...(replyTo && { replyTo }),
      ...(attachments && { attachments })
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado a ${mailOptions.to} | Subject: ${subject} | ID: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error enviando email a ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina tags HTML para generar versión texto plano
 */
function stripHtml(html = '') {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
