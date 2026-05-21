// src/lib/proposal-generator/index.js
import crypto from 'crypto';

/**
 * Genera el token de una propuesta
 */
export function generateProposalToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Genera el HTML de la propuesta para un lead
 */
export function generateProposalHtml(lead, options = {}) {
  const {
    price = '1.500€ – 3.000€',
    deliveryDays = 21,
    includes = null,
    testimonial = null
  } = options;

  const issues = lead.webAnalysis?.issues?.slice(0, 4) || [];
  const loadTime = lead.webAnalysis?.loadTime;
  const hasSSL = lead.webAnalysis?.hasSSL;
  const hasMobile = lead.webAnalysis?.hasMobile;
  const noWebsite = !lead.website;

  const sectorServices = {
    restaurant: ['Carta online / menú digital', 'Reservas online integradas', 'Galería de fotos del local y platos', 'Integración con Google Maps', 'Sección de reseñas y valoraciones', 'Optimización SEO local'],
    beauty: ['Reservas online de citas', 'Catálogo de servicios con precios', 'Galería antes/después', 'Integración Instagram', 'Formulario de contacto', 'Optimización SEO local'],
    health: ['Formulario de cita online', 'Presentación del equipo médico', 'Servicios y especialidades', 'Política de privacidad y RGPD', 'Integración con Google Maps', 'SEO médico local'],
    shop: ['Catálogo de productos', 'Carrito de compra (opcional)', 'Sección de novedades y ofertas', 'Formulario de contacto', 'WhatsApp directo', 'SEO para búsquedas locales'],
    service: ['Formulario de presupuesto', 'Sección de servicios detallada', 'Zona de cobertura en mapa', 'Botón de llamada directo', 'Galería de trabajos realizados', 'SEO para búsquedas urgentes'],
    generic: ['Diseño profesional responsive', 'Sección de servicios', 'Formulario de contacto', 'Integración con Google Maps', 'Galería de fotos', 'Optimización SEO básica']
  };

  const services = includes || sectorServices[lead.sector] || sectorServices.generic;

  const defaultTestimonials = {
    restaurant: { name: 'Restaurante El Olivo', text: 'Desde que pusimos la web, recibimos el doble de reservas online. El diseño es exactamente lo que buscábamos.', result: '+120% reservas' },
    beauty: { name: 'Salón Beleza', text: 'Ahora nuestras clientas reservan cita directamente desde la web. Menos llamadas, más tiempo para trabajar.', result: '-70% llamadas de reserva' },
    health: { name: 'Clínica DentaPlus', text: 'Nuestra web nueva nos ha posicionado en el top 3 de Google para búsquedas locales. Más pacientes cada mes.', result: 'Top 3 Google local' },
    generic: { name: 'Cliente satisfecho', text: 'La web superó todas mis expectativas. Luis es muy profesional y entregó en el plazo prometido.', result: '100% satisfecho' }
  };

  const usedTestimonial = testimonial || defaultTestimonials[lead.sector] || defaultTestimonials.generic;

  const date = new Date();
  const validUntil = new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propuesta web para ${lead.name} — Luis Granero</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; color: #0f172a; }
    a { color: inherit; text-decoration: none; }

    .header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 48px; text-align: center; }
    .header .logo { color: #0ea5e9; font-size: 20px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
    .header h1 { color: white; font-size: 36px; font-weight: 300; margin-bottom: 12px; }
    .header h1 strong { color: #0ea5e9; font-weight: 700; }
    .header p { color: #64748b; font-size: 15px; }
    .header-badge { display: inline-block; background: #0ea5e9/20; border: 1px solid #0ea5e9/30; color: #0ea5e9; padding: 6px 16px; border-radius: 100px; font-size: 12px; margin-top: 16px; }

    .container { max-width: 700px; margin: 0 auto; padding: 48px 24px; }

    .section { background: white; border-radius: 16px; padding: 36px; margin-bottom: 24px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
    .section-tag { color: #0ea5e9; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
    .section h2 { font-size: 26px; font-weight: 700; margin-bottom: 20px; }

    .problem-list { list-style: none; }
    .problem-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .problem-item:last-child { border-bottom: none; }
    .p-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .p-text { color: #475569; font-size: 14px; line-height: 1.6; }
    .p-label { font-weight: 600; color: #0f172a; margin-bottom: 2px; }

    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .service-item { display: flex; gap: 10px; align-items: flex-start; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .s-check { color: #0ea5e9; font-size: 16px; flex-shrink: 0; }
    .s-text { font-size: 14px; color: #374151; }

    .price-box { background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; padding: 36px; text-align: center; }
    .price-label { color: #64748b; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .price-value { font-size: 52px; font-weight: 800; color: #0ea5e9; line-height: 1; margin-bottom: 8px; }
    .price-sub { color: #475569; font-size: 14px; margin-bottom: 28px; }
    .price-details { display: flex; justify-content: center; gap: 32px; margin-bottom: 32px; }
    .price-detail { text-align: center; }
    .pd-val { font-size: 28px; font-weight: 700; color: white; }
    .pd-label { font-size: 12px; color: #475569; margin-top: 2px; }
    .cta-btn { display: inline-flex; align-items: center; gap: 10px; background: #25D366; color: white; padding: 18px 48px; border-radius: 8px; font-size: 16px; font-weight: 700; text-decoration: none; }
    .cta-note { color: #475569; font-size: 12px; margin-top: 12px; }

    .testimonial { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 24px; border-radius: 0 12px 12px 0; }
    .t-text { color: #334155; font-size: 15px; line-height: 1.7; font-style: italic; margin-bottom: 16px; }
    .t-bottom { display: flex; align-items: center; justify-content: space-between; }
    .t-author { font-weight: 600; color: #0f172a; font-size: 14px; }
    .t-result { background: #0ea5e9; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }

    .process-steps { display: flex; flex-direction: column; gap: 0; }
    .step { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid #f1f5f9; }
    .step:last-child { border-bottom: none; }
    .step-num { width: 36px; height: 36px; background: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .step-content h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .step-content p { color: #64748b; font-size: 14px; }

    .footer { background: #0f172a; color: #475569; text-align: center; padding: 32px; font-size: 13px; }
    .footer .f-name { color: white; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .valid-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 20px; text-align: center; color: #92400e; font-size: 13px; margin-bottom: 24px; }

    @media (max-width: 600px) {
      .services-grid { grid-template-columns: 1fr; }
      .price-details { flex-direction: column; gap: 16px; }
      .header { padding: 32px 20px; }
      .section { padding: 24px; }
    }
  </style>
</head>
<body>

<div class="header">
  <div class="logo">Luis Granero — Desarrollo Web</div>
  <h1>Propuesta para <strong>${lead.name}</strong></h1>
  <p>Preparada el ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <div class="header-badge">⏳ Válida hasta el ${validUntil.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</div>
</div>

<div class="container">

  <!-- PROBLEMA -->
  <div class="section">
    <p class="section-tag">Situación actual</p>
    <h2>¿Por qué necesitas una web ahora?</h2>
    <ul class="problem-list">
      ${noWebsite ? `
      <li class="problem-item">
        <span class="p-icon">🔴</span>
        <div class="p-text"><div class="p-label">Sin presencia online</div>El 85% de los clientes buscan en Google antes de visitar un negocio. Sin web, ${lead.name} es invisible para ellos.</div>
      </li>` : ''}
      ${lead.rating && lead.reviewCount ? `
      <li class="problem-item">
        <span class="p-icon">⭐</span>
        <div class="p-text"><div class="p-label">Reputación sin escaparate</div>Tienes ${lead.reviewCount} reseñas con ${lead.rating}★ en Google. Esa reputación vale oro — pero nadie la puede ver sin web.</div>
      </li>` : ''}
      ${loadTime > 5000 ? `
      <li class="problem-item">
        <span class="p-icon">🐢</span>
        <div class="p-text"><div class="p-label">Web lenta</div>Tarda ${Math.round(loadTime / 1000)} segundos en cargar. El 53% de usuarios abandona si tarda más de 3s. Google también te penaliza.</div>
      </li>` : ''}
      ${!hasSSL && !noWebsite ? `
      <li class="problem-item">
        <span class="p-icon">⚠️</span>
        <div class="p-text"><div class="p-label">Sin certificado de seguridad</div>Los navegadores avisan a tus clientes de que tu web "no es segura". Esto destruye la confianza.</div>
      </li>` : ''}
      ${!hasMobile && !noWebsite ? `
      <li class="problem-item">
        <span class="p-icon">📱</span>
        <div class="p-text"><div class="p-label">No adaptada a móvil</div>El 70% del tráfico es móvil. Tu web no se ve bien en smartphones y Google lo penaliza en búsquedas locales.</div>
      </li>` : ''}
      ${issues.slice(0, 2).map(issue => `
      <li class="problem-item">
        <span class="p-icon">🔧</span>
        <div class="p-text"><div class="p-label">Problema detectado</div>${issue}</div>
      </li>`).join('')}
    </ul>
  </div>

  <!-- SOLUCIÓN -->
  <div class="section">
    <p class="section-tag">Mi propuesta</p>
    <h2>Qué incluye tu nueva web</h2>
    <div class="services-grid">
      ${services.map(s => `
      <div class="service-item">
        <span class="s-check">✅</span>
        <span class="s-text">${s}</span>
      </div>`).join('')}
      <div class="service-item">
        <span class="s-check">✅</span>
        <span class="s-text">Dominio + hosting 1 año incluido</span>
      </div>
      <div class="service-item">
        <span class="s-check">✅</span>
        <span class="s-text">Formación para gestionar la web</span>
      </div>
    </div>
  </div>

  <!-- PRECIO -->
  <div class="price-box">
    <p class="price-label">Inversión total</p>
    <div class="price-value">${price}</div>
    <p class="price-sub">Pago en 2 partes — 50% al inicio, 50% a la entrega</p>
    <div class="price-details">
      <div class="price-detail"><div class="pd-val">${deliveryDays}</div><div class="pd-label">días de entrega</div></div>
      <div class="price-detail"><div class="pd-val">∞</div><div class="pd-label">Soporte post-entrega</div></div>
      <div class="price-detail"><div class="pd-val">100%</div><div class="pd-label">Garantía satisfacción</div></div>
    </div>
    <a href="https://wa.me/34698383610?text=Hola%20Luis%2C%20acepto%20la%20propuesta%20para%20${encodeURIComponent(lead.name)}.%20%C2%BFCu%C3%A1ndo%20podemos%20hablar%3F" class="cta-btn" target="_blank" rel="noopener noreferrer">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      Acepto la propuesta
    </a>
    <p class="cta-note">También puedes escribirme directamente a <a href="mailto:luis@luisgranero.com" style="color:#64748b;">luis@luisgranero.com</a></p>
  </div>

  <!-- TESTIMONIAL -->
  <div class="section">
    <p class="section-tag">Un cliente como tú</p>
    <div class="testimonial">
      <p class="t-text">"${usedTestimonial.text}"</p>
      <div class="t-bottom">
        <span class="t-author">— ${usedTestimonial.name}</span>
        <span class="t-result">${usedTestimonial.result}</span>
      </div>
    </div>
  </div>

  <!-- PROCESO -->
  <div class="section">
    <p class="section-tag">Cómo trabajamos</p>
    <h2>El proceso paso a paso</h2>
    <div class="process-steps">
      <div class="step"><div class="step-num">1</div><div class="step-content"><h4>Reunión inicial (30 min)</h4><p>Revisamos tus objetivos, el sector y lo que necesitas.</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-content"><h4>Diseño y maquetación</h4><p>Diseño la web y te muestro el borrador para aprobación.</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-content"><h4>Desarrollo y contenidos</h4><p>Programo la web con tus textos, fotos y datos reales.</p></div></div>
      <div class="step"><div class="step-num">4</div><div class="step-content"><h4>Revisiones y ajustes</h4><p>Hasta 3 rondas de cambios incluidas sin coste.</p></div></div>
      <div class="step"><div class="step-num">5</div><div class="step-content"><h4>Entrega y formación</h4><p>La web está online. Te explico cómo actualizarla tú mismo.</p></div></div>
    </div>
  </div>

  <div class="valid-note">
    ⏳ Esta propuesta es válida hasta el ${validUntil.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
  </div>

</div>

<div class="footer">
  <div class="f-name">Luis Granero</div>
  <p>Desarrollo Web Profesional · Valencia</p>
  <p style="margin-top:8px;"><a href="mailto:luis@luisgranero.com" style="color:#0ea5e9;">luis@luisgranero.com</a> · <a href="${appUrl}" style="color:#0ea5e9;">luisgranero.com</a></p>
</div>

</body>
</html>`;
}
