// src/lib/demo-generator/templates/health.js — Clínicas, médicos, fisio, dentistas, psicólogos
export function renderHealth(data) {
  const { businessName, address, phone, email, rating, reviewCount, description, profilePicUrl, primaryColor, category } = data;
  const stars = Math.round(rating || 5);
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  const isDentist = category?.toLowerCase().includes('dent');
  const isPhysio = category?.toLowerCase().includes('fisio') || category?.toLowerCase().includes('physio');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Clínica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; }

    .demo-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: linear-gradient(90deg, #0ea5e9, #6366f1); color: white; text-align: center; padding: 10px 16px; font-size: 13px; }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    nav { background: white; box-shadow: 0 1px 20px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; padding: 18px 48px; position: sticky; top: 42px; z-index: 100; }
    .nav-logo { display: flex; align-items: center; gap: 12px; }
    .nav-icon { width: 36px; height: 36px; background: ${primaryColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; }
    .nav-name { font-size: 17px; font-weight: 600; color: #1a1a2e; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { color: #64748b; font-size: 14px; transition: color 0.2s; }
    .nav-links a:hover { color: ${primaryColor}; }
    .nav-cta { background: ${primaryColor}; color: white; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; }

    .hero { background: linear-gradient(135deg, ${primaryColor}05 0%, white 50%, ${primaryColor}08 100%); padding: 100px 48px; }
    .hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: ${primaryColor}15; color: ${primaryColor}; padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 24px; }
    .hero h1 { font-size: clamp(36px, 4vw, 56px); font-weight: 700; line-height: 1.15; margin-bottom: 20px; color: #0f172a; }
    .hero p { color: #64748b; font-size: 17px; line-height: 1.7; margin-bottom: 36px; }
    .hero-btns { display: flex; gap: 16px; }
    .btn-primary { background: ${primaryColor}; color: white; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 500; border: none; cursor: pointer; }
    .btn-outline { background: white; color: #1a1a2e; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 500; border: 2px solid #e2e8f0; cursor: pointer; }
    .hero-trust { display: flex; gap: 24px; margin-top: 40px; }
    .trust-item { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; }
    .hero-visual { background: ${primaryColor}10; border-radius: 20px; min-height: 400px; display: flex; align-items: center; justify-content: center; font-size: 80px; overflow: hidden; }
    .hero-visual img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; }

    .services { padding: 100px 48px; background: white; }
    .section-header { text-align: center; margin-bottom: 60px; }
    .section-tag { color: ${primaryColor}; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .section-header h2 { font-size: 42px; font-weight: 700; color: #0f172a; }
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; }
    .service-card { background: #fafbfc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 32px 28px; transition: all 0.2s; }
    .service-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.08); border-color: ${primaryColor}30; }
    .service-icon { width: 48px; height: 48px; background: ${primaryColor}15; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }
    .service-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; color: #0f172a; }
    .service-card p { color: #64748b; font-size: 14px; line-height: 1.6; }

    .booking { background: ${primaryColor}; padding: 80px 48px; }
    .booking-inner { max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .booking-text h2 { color: white; font-size: 40px; font-weight: 700; margin-bottom: 16px; }
    .booking-text p { color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; }
    .booking-form { display: flex; flex-direction: column; gap: 12px; }
    .booking-form input, .booking-form select { padding: 13px 16px; border: none; border-radius: 8px; font-size: 14px; background: white; outline: none; }
    .booking-form button { background: #0f172a; color: white; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }

    .reviews { padding: 100px 48px; background: #f8fafc; }
    .reviews-score { display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 60px; background: white; max-width: 600px; margin-left: auto; margin-right: auto; padding: 32px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.05); margin-bottom: 60px; }
    .score-big { font-size: 64px; font-weight: 700; color: ${primaryColor}; line-height: 1; }
    .score-right .stars { font-size: 20px; color: #fbbf24; margin-bottom: 4px; }
    .score-right .total { color: #94a3b8; font-size: 13px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
    .review-card { background: white; padding: 28px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
    .review-stars { color: #fbbf24; font-size: 14px; margin-bottom: 12px; }
    .review-text { color: #475569; font-size: 14px; line-height: 1.7; font-style: italic; margin-bottom: 16px; }
    .review-author { font-size: 12px; color: #94a3b8; font-weight: 500; }

    .contact { padding: 100px 48px; background: white; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; max-width: 900px; margin: 0 auto; }
    .contact-card { background: #f8fafc; border-radius: 12px; padding: 32px; }
    .contact-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
    .contact-item { display: flex; gap: 12px; margin-bottom: 20px; }
    .c-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
    .c-label { font-size: 12px; color: ${primaryColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .c-value { font-size: 15px; color: #334155; }
    .contact-form-card { background: ${primaryColor}08; border-radius: 12px; padding: 32px; }
    .contact-form-card h3 { font-size: 18px; font-weight: 600; margin-bottom: 24px; }
    .cf input, .cf textarea { width: 100%; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 12px; outline: none; background: white; }
    .cf textarea { height: 100px; resize: none; }
    .cf button { width: 100%; background: ${primaryColor}; color: white; padding: 14px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; }

    footer { background: #0f172a; color: #475569; text-align: center; padding: 48px; font-size: 13px; }
    footer .f-name { color: white; font-size: 20px; font-weight: 700; margin-bottom: 8px; }

    @media (max-width: 768px) {
      .hero-inner, .booking-inner, .contact-grid { grid-template-columns: 1fr; }
      .hero-visual { height: 250px; }
      .services-grid, .reviews-grid { grid-template-columns: 1fr; }
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .hero, .services, .reviews, .contact { padding: 60px 20px; }
    }
  </style>
</head>
<body>

<div class="demo-banner">
  🎨 <strong>Web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<nav>
  <div class="nav-logo">
    <div class="nav-icon">${isDentist ? '🦷' : isPhysio ? '🩺' : '🏥'}</div>
    <div class="nav-name">${businessName}</div>
  </div>
  <div class="nav-links">
    <a href="#servicios">Servicios</a>
    <a href="#cita">Pedir cita</a>
    <a href="#resenas">Testimonios</a>
    <a href="#contacto">Contacto</a>
  </div>
  <a href="#cita" class="nav-cta">Pedir cita</a>
</nav>

<section class="hero" id="inicio">
  <div class="hero-inner">
    <div>
      <div class="hero-badge">✅ ${category || 'Centro médico'} · ${address ? address.split(',').pop().trim() : 'Valencia'}</div>
      <h1>Tu salud en las mejores manos</h1>
      <p>${description || 'Ofrecemos atención médica especializada con el máximo rigor profesional y un trato cercano. Porque tu bienestar es nuestra razón de ser.'}</p>
      <div class="hero-btns">
        <button class="btn-primary" onclick="document.getElementById('cita').scrollIntoView()">Pedir cita online</button>
        <button class="btn-outline" onclick="document.getElementById('servicios').scrollIntoView()">Ver servicios</button>
      </div>
      ${rating ? `
      <div class="hero-trust">
        <div class="trust-item">⭐ <strong>${rating}</strong> en Google</div>
        <div class="trust-item">✅ <strong>${reviewCount || 0}</strong> pacientes satisfechos</div>
      </div>` : ''}
    </div>
    <div class="hero-visual">
      ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${businessName}">` : (isDentist ? '🦷' : isPhysio ? '🏃' : '🏥')}
    </div>
  </div>
</section>

<section class="services" id="servicios">
  <div class="section-header">
    <p class="section-tag">Especialidades</p>
    <h2>Nuestros servicios</h2>
  </div>
  <div class="services-grid">
    <div class="service-card"><div class="service-icon">🔬</div><h3>Diagnóstico</h3><p>Evaluación completa y diagnóstico preciso para determinar el mejor tratamiento.</p></div>
    <div class="service-card"><div class="service-icon">💊</div><h3>Tratamientos</h3><p>Tratamientos personalizados adaptados a las necesidades específicas de cada paciente.</p></div>
    <div class="service-card"><div class="service-icon">📋</div><h3>Seguimiento</h3><p>Control y seguimiento continuo para garantizar los mejores resultados.</p></div>
    <div class="service-card"><div class="service-icon">🚑</div><h3>Urgencias</h3><p>Atención prioritaria para casos urgentes. Llamanos y te atendemos de inmediato.</p></div>
    <div class="service-card"><div class="service-icon">📱</div><h3>Consulta online</h3><p>Primera consulta online para resolver tus dudas sin necesidad de desplazarte.</p></div>
    <div class="service-card"><div class="service-icon">👥</div><h3>Medicina preventiva</h3><p>Revisiones periódicas y consejos para mantener tu salud en óptimas condiciones.</p></div>
  </div>
</section>

<section class="booking" id="cita">
  <div class="booking-inner">
    <div class="booking-text">
      <h2>Pide tu cita ahora</h2>
      <p>Sin esperas innecesarias. Selecciona el servicio y el horario que te va mejor. Te confirmamos en menos de 24h.</p>
    </div>
    <div class="booking-form">
      <input type="text" placeholder="Nombre completo">
      <input type="tel" placeholder="${phone || 'Teléfono de contacto'}">
      <input type="email" placeholder="Email">
      <select><option>Tipo de consulta...</option><option>Primera visita</option><option>Revisión</option><option>Urgencia</option></select>
      <input type="datetime-local">
      <button>Solicitar cita</button>
    </div>
  </div>
</section>

${rating ? `
<section class="reviews" id="resenas">
  <div class="section-header">
    <p class="section-tag">Testimonios</p>
    <h2>Pacientes satisfechos</h2>
  </div>
  <div class="reviews-score">
    <div class="score-big">${rating}</div>
    <div class="score-right">
      <div class="stars">${starsHtml}</div>
      <div class="total">${reviewCount || 0} valoraciones verificadas en Google</div>
    </div>
  </div>
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Atención excelente. El equipo es muy profesional y me explicaron todo con detalle. Muy recomendable."</p><div class="review-author">— Paciente verificado</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Instalaciones modernas y personal muy amable. Me sentí en buenas manos desde el primer momento."</p><div class="review-author">— María L.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"La cita online es muy cómoda. Rápidos, eficientes y con un trato muy humano. 100% recomendado."</p><div class="review-author">— José M.</div></div>
  </div>
</section>` : ''}

<section class="contact" id="contacto">
  <div class="section-header">
    <p class="section-tag">Localización</p>
    <h2>Cómo encontrarnos</h2>
  </div>
  <div class="contact-grid">
    <div class="contact-card">
      <h3>Información de contacto</h3>
      ${phone ? `<div class="contact-item"><div class="c-icon">📞</div><div><div class="c-label">Teléfono</div><div class="c-value">${phone}</div></div></div>` : ''}
      ${address ? `<div class="contact-item"><div class="c-icon">📍</div><div><div class="c-label">Dirección</div><div class="c-value">${address}</div></div></div>` : ''}
      ${email ? `<div class="contact-item"><div class="c-icon">✉️</div><div><div class="c-label">Email</div><div class="c-value">${email}</div></div></div>` : ''}
      <div class="contact-item"><div class="c-icon">🕐</div><div><div class="c-label">Horario</div><div class="c-value">Lun–Vie: 9:00–20:00<br>Sáb: 9:00–14:00</div></div></div>
    </div>
    <div class="contact-form-card">
      <h3>¿Tienes dudas? Escríbenos</h3>
      <div class="cf">
        <input type="text" placeholder="Tu nombre">
        <input type="email" placeholder="Tu email">
        <textarea placeholder="¿En qué podemos ayudarte?"></textarea>
        <button>Enviar consulta</button>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="f-name">${businessName}</div>
  <p>${address || ''} ${phone ? `· ${phone}` : ''}</p>
  <p style="margin-top:20px;font-size:12px;">Web de demostración por <a href="https://www.luisgranero.com" style="color:${primaryColor};">luisgranero.com</a></p>
</footer>

</body>
</html>`;
}
