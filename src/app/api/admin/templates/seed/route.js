// src/app/api/admin/templates/seed/route.js
// Crea templates de email profesionales si no existen
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';
import { requireAdmin } from '@/lib/adminAuth';

const TEMPLATES = [
  {
    id: 'prospecto_sin_web_1',
    name: '🌐 Primer contacto — Sin web',
    type: 'email',
    subject: '{{name}}: he creado una demo de vuestra web',
    body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demo web</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px 40px;">
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Propuesta de presencia digital</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">He creado una demo<br>de vuestra web</h1>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hola,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Me llamo <strong>Luis Granero</strong>, soy desarrollador web de Valencia. Encontré <strong>{{name}}</strong> buscando <em>{{category}}</em> y vi que todavía no tenéis web propia.</p>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">Hoy en día el <strong>76% de los clientes</strong> busca online antes de decidirse. Sin web, esa búsqueda os deja fuera.</p>
        <!-- CTA Demo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin:0 0 28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 6px;color:#15803d;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Demo personalizada</p>
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">He preparado un ejemplo de cómo podría quedar vuestra web usando vuestro nombre y categoría:</p>
            <a href="{{demo_link}}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">Ver demo →</a>
          </td></tr>
        </table>
        <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;"><strong>¿Qué incluye?</strong></p>
        <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;font-size:14px;line-height:2;">
          <li>Diseño moderno adaptado a móvil</li>
          <li>Información de contacto y ubicación</li>
          <li>Galería de fotos y servicios</li>
          <li>Formulario de cita / reserva</li>
          <li>Posicionamiento SEO local</li>
        </ul>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">¿Te gustaría que habláramos 15 minutos sin compromiso? Responde a este correo o llámame directamente.</p>
        <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">Un saludo,<br><strong>Luis Granero</strong><br>Desarrollador web · Valencia</p>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">📞 {{admin_phone}} · 📧 {{admin_email}} · 🌐 luisgranero.com</p>
        <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;">Si no deseas recibir más correos, <a href="#" style="color:#9ca3af;">cancela aquí</a>.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    variables: ['name', 'category', 'demo_link', 'admin_phone', 'admin_email']
  },

  {
    id: 'prospecto_web_mejorable_1',
    name: '⚡ Primer contacto — Web mejorable',
    type: 'email',
    subject: 'He analizado la web de {{name}} — hay margen de mejora',
    body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px 40px;">
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Análisis de presencia digital</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">He analizado vuestra web<br>y encontré oportunidades</h1>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hola,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Me llamo <strong>Luis Granero</strong>, desarrollador web de Valencia. He analizado la web de <strong>{{name}}</strong> y detecté algunos puntos de mejora que están afectando a vuestro posicionamiento en Google.</p>
        <!-- Issues box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;margin:0 0 24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 12px;color:#92400e;font-size:13px;font-weight:700;text-transform:uppercase;">Problemas detectados</p>
            <ul style="margin:0;padding-left:18px;color:#78350f;font-size:14px;line-height:2.2;">
              <li>Velocidad de carga lenta (afecta al SEO)</li>
              <li>Sin optimización para móvil</li>
              <li>Diseño desactualizado</li>
              <li>Sin certificado SSL o con errores</li>
            </ul>
          </td></tr>
        </table>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">He preparado una demo de cómo podría quedar vuestra web renovada:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr><td align="center">
            <a href="{{demo_link}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ef4444);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">Ver demo renovada →</a>
          </td></tr>
        </table>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Una web rápida y bien optimizada puede suponer entre un 30-50% más de visitas orgánicas desde Google.</p>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">¿Te parece si hablamos 15 minutos? Sin compromiso.</p>
        <p style="margin:0;color:#374151;font-size:15px;">Un saludo,<br><strong>Luis Granero</strong><br>Desarrollador web · Valencia</p>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">📞 {{admin_phone}} · 📧 {{admin_email}} · 🌐 luisgranero.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    variables: ['name', 'demo_link', 'admin_phone', 'admin_email']
  },

  {
    id: 'seguimiento_1',
    name: '🔄 Seguimiento — Sin respuesta',
    type: 'email',
    subject: 'Re: Demo web para {{name}} — ¿la viste?',
    body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:#1e293b;padding:28px 40px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">¿Tuviste oportunidad de ver la demo?</h1>
      </td></tr>
      <tr><td style="padding:32px 40px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hola,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hace unos días te envié una demo de cómo podría quedar la web de <strong>{{name}}</strong>. Quería ver si tuviste oportunidad de echarle un vistazo.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;margin:0 0 24px;">
          <tr><td style="padding:20px 24px;" align="center">
            <p style="margin:0 0 12px;color:#0369a1;font-size:14px;">La demo sigue disponible:</p>
            <a href="{{demo_link}}" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Ver demo →</a>
          </td></tr>
        </table>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Si tienes alguna duda o quieres ajustar algo del diseño, responde a este correo y lo hablo contigo.</p>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">Si no es el momento adecuado, sin problema. Solo dímelo y no te molesto más.</p>
        <p style="margin:0;color:#374151;font-size:15px;">Un saludo,<br><strong>Luis Granero</strong></p>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">📞 {{admin_phone}} · 📧 {{admin_email}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    variables: ['name', 'demo_link', 'admin_phone', 'admin_email']
  },

  {
    id: 'propuesta_pdf_1',
    name: '📄 Envío de propuesta',
    type: 'email',
    subject: 'Propuesta web para {{name}} — {{current_date}}',
    body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#7c3aed,#0ea5e9);padding:32px 40px;">
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Propuesta personalizada</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;">Proyecto web para<br>{{name}}</h1>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hola,</p>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Tal como hablamos, te adjunto la propuesta detallada para el proyecto web de <strong>{{name}}</strong>.</p>
        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f5f3ff,#eff6ff);border:1px solid #ddd6fe;border-radius:10px;margin:0 0 28px;">
          <tr><td style="padding:24px 28px;" align="center">
            <p style="margin:0 0 6px;color:#5b21b6;font-size:13px;font-weight:600;text-transform:uppercase;">Propuesta online</p>
            <p style="margin:0 0 16px;color:#4b5563;font-size:14px;">Incluye presupuesto, plan de trabajo y ejemplos</p>
            <a href="{{demo_link}}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#0ea5e9);color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:700;">Ver propuesta completa →</a>
          </td></tr>
        </table>
        <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.7;"><strong>La propuesta incluye:</strong></p>
        <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;font-size:14px;line-height:2.2;">
          <li>Análisis de vuestra situación actual</li>
          <li>Solución propuesta con diseño personalizado</li>
          <li>Presupuesto detallado y formas de pago</li>
          <li>Plan de trabajo y plazos de entrega</li>
          <li>Garantías y soporte post-lanzamiento</li>
        </ul>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">La propuesta está disponible <strong>14 días</strong>. Si tienes alguna pregunta o quieres negociar algo, estoy disponible.</p>
        <p style="margin:0;color:#374151;font-size:15px;">Un saludo,<br><strong>Luis Granero</strong><br>Desarrollador web · Valencia<br>📞 {{admin_phone}}</p>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">📞 {{admin_phone}} · 📧 {{admin_email}} · 🌐 luisgranero.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    variables: ['name', 'demo_link', 'current_date', 'admin_phone', 'admin_email']
  },

  {
    id: 'cierre_ganado_1',
    name: '🎉 Bienvenida — Cliente nuevo',
    type: 'email',
    subject: '¡Bienvenido {{name}}! Empezamos el proyecto 🚀',
    body: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#10b981,#0ea5e9);padding:32px 40px;">
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:28px;">🎉</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;">¡Empezamos, {{first_name}}!</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Proyecto web para {{name}}</p>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">¡Bienvenido al equipo! Estoy encantado de trabajar con vosotros en este proyecto.</p>
        <!-- Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr><td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <table><tr>
              <td style="width:32px;height:32px;background:#d1fae5;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;color:#065f46;font-size:14px;">1</td>
              <td style="padding-left:14px;color:#374151;font-size:14px;"><strong>Kickoff</strong> — Llamada de inicio para definir los detalles</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <table><tr>
              <td style="width:32px;height:32px;background:#dbeafe;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;color:#1e40af;font-size:14px;">2</td>
              <td style="padding-left:14px;color:#374151;font-size:14px;"><strong>Diseño</strong> — Te presento el prototipo para revisión</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <table><tr>
              <td style="width:32px;height:32px;background:#fef3c7;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;color:#92400e;font-size:14px;">3</td>
              <td style="padding-left:14px;color:#374151;font-size:14px;"><strong>Desarrollo</strong> — Construyo la web con tus contenidos</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:16px 0;">
            <table><tr>
              <td style="width:32px;height:32px;background:#ede9fe;border-radius:50%;text-align:center;vertical-align:middle;font-weight:700;color:#5b21b6;font-size:14px;">4</td>
              <td style="padding-left:14px;color:#374151;font-size:14px;"><strong>Lanzamiento</strong> — Publicamos y te entrego el control</td>
            </tr></table>
          </td></tr>
        </table>
        <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Para empezar necesito que me envíes: logo (si tenéis), fotos del negocio y cualquier texto o información que queráis incluir.</p>
        <p style="margin:0;color:#374151;font-size:15px;">¡Vamos allá! 🚀<br><br><strong>Luis Granero</strong><br>📞 {{admin_phone}}</p>
      </td></tr>
      <tr><td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">📞 {{admin_phone}} · 📧 {{admin_email}} · 🌐 luisgranero.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    variables: ['name', 'first_name', 'admin_phone', 'admin_email']
  }
];

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    await connectDB();

    const results = { created: 0, skipped: 0 };

    for (const tmpl of TEMPLATES) {
      const exists = await Template.findOne({ id: tmpl.id });
      if (exists) {
        results.skipped++;
        continue;
      }
      await Template.create({ ...tmpl, isActive: true, createdAt: new Date(), updatedAt: new Date() });
      results.created++;
    }

    return NextResponse.json({
      success: true,
      message: `${results.created} templates creados, ${results.skipped} ya existían`,
      ...results
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
