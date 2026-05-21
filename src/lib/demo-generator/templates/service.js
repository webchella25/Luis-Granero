// src/lib/demo-generator/templates/service.js — Talleres, fontaneros, electricistas, cerrajeros
export function renderService(data) {
  const { businessName, address, phone, email, rating, reviewCount, description, profilePicUrl, primaryColor, category } = data;
  const stars = Math.round(rating || 4.8);
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  const getCategoryIcon = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('taller') || c.includes('mecánic')) return '🔧';
    if (c.includes('fontanero') || c.includes('fontaner') || c.includes('plomer')) return '🔩';
    if (c.includes('electri')) return '⚡';
    if (c.includes('cerrajer')) return '🔑';
    if (c.includes('pintores') || c.includes('pintor')) return '🎨';
    if (c.includes('carpinter')) return '🪚';
    if (c.includes('climatiz') || c.includes('aire')) return '❄️';
    return '🛠️';
  };

  const categoryIcon = getCategoryIcon(category);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Servicios profesionales</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111827; }

    .demo-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: linear-gradient(90deg, #0ea5e9, #6366f1); color: white; text-align: center; padding: 10px 16px; font-size: 13px; }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    nav { background: #111827; display: flex; justify-content: space-between; align-items: center; padding: 18px 48px; position: sticky; top: 42px; z-index: 100; }
    .nav-logo { color: white; font-size: 20px; font-weight: 700; }
    .nav-logo span { color: ${primaryColor}; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { color: #9ca3af; font-size: 14px; transition: color 0.2s; }
    .nav-links a:hover { color: white; }
    .nav-tel { color: ${primaryColor}; font-size: 16px; font-weight: 700; }

    .hero { background: #111827; padding: 100px 48px; }
    .hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .hero-label { display: inline-block; background: ${primaryColor}; color: white; padding: 4px 12px; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
    .hero h1 { font-size: clamp(36px, 4.5vw, 60px); color: white; line-height: 1.1; margin-bottom: 20px; font-weight: 800; }
    .hero h1 span { color: ${primaryColor}; }
    .hero p { color: #9ca3af; font-size: 17px; line-height: 1.7; margin-bottom: 36px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn-call { background: ${primaryColor}; color: white; padding: 16px 36px; font-size: 16px; font-weight: 700; border: none; cursor: pointer; border-radius: 4px; }
    .btn-contact { background: transparent; color: white; padding: 16px 36px; font-size: 16px; font-weight: 600; border: 2px solid #374151; cursor: pointer; border-radius: 4px; }
    .hero-badges { display: flex; gap: 24px; margin-top: 40px; flex-wrap: wrap; }
    .badge { display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; }
    .badge strong { color: white; }
    .hero-visual { background: #1f2937; border-radius: 12px; min-height: 360px; display: flex; align-items: center; justify-content: center; font-size: 80px; overflow: hidden; }
    .hero-visual img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }

    .services { padding: 100px 48px; background: white; }
    .section-header { text-align: center; margin-bottom: 60px; }
    .section-tag { color: ${primaryColor}; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
    .section-header h2 { font-size: 44px; font-weight: 800; color: #111827; }
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
    .service-card { border: 2px solid #f3f4f6; border-radius: 8px; padding: 32px 24px; transition: all 0.2s; }
    .service-card:hover { border-color: ${primaryColor}; box-shadow: 0 4px 20px ${primaryColor}20; }
    .s-icon { font-size: 32px; margin-bottom: 16px; }
    .service-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .service-card p { color: #6b7280; font-size: 14px; line-height: 1.6; }

    .urgency { background: ${primaryColor}; padding: 60px 48px; }
    .urgency-inner { max-width: 700px; margin: 0 auto; text-align: center; }
    .urgency h2 { color: white; font-size: 40px; font-weight: 800; margin-bottom: 16px; }
    .urgency p { color: rgba(255,255,255,0.85); font-size: 17px; margin-bottom: 32px; }
    .urgency-phone { display: inline-block; background: white; color: #111827; padding: 18px 48px; border-radius: 4px; font-size: 22px; font-weight: 800; }

    .why { padding: 100px 48px; background: #f9fafb; }
    .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1000px; margin: 0 auto; }
    .why-item { text-align: center; }
    .why-num { font-size: 52px; font-weight: 800; color: ${primaryColor}; line-height: 1; }
    .why-label { font-size: 15px; color: #374151; margin-top: 8px; font-weight: 500; }
    .why-sub { font-size: 13px; color: #9ca3af; margin-top: 4px; }

    ${rating ? `
    .reviews { padding: 100px 48px; background: white; }
    .reviews-header { display: grid; grid-template-columns: auto 1fr; gap: 48px; align-items: center; max-width: 1000px; margin: 0 auto 60px; }
    .score-block { background: #111827; border-radius: 12px; padding: 32px 40px; text-align: center; }
    .score-num { font-size: 64px; font-weight: 800; color: white; line-height: 1; }
    .score-stars { font-size: 20px; color: #fbbf24; margin: 8px 0; }
    .score-total { color: #6b7280; font-size: 12px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
    .review-card { background: #f9fafb; border-radius: 8px; padding: 24px; }
    .review-stars { color: #fbbf24; font-size: 13px; margin-bottom: 10px; }
    .review-text { color: #374151; font-size: 14px; line-height: 1.7; font-style: italic; margin-bottom: 14px; }
    .review-author { font-size: 12px; color: #9ca3af; font-weight: 600; }` : ''}

    .contact { padding: 100px 48px; background: #111827; }
    .contact h2 { text-align: center; font-size: 44px; font-weight: 800; color: white; margin-bottom: 60px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; max-width: 900px; margin: 0 auto; }
    .contact-info { display: flex; flex-direction: column; gap: 28px; }
    .ci-item { display: flex; gap: 16px; align-items: flex-start; }
    .ci-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .ci-label { font-size: 11px; color: ${primaryColor}; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .ci-value { font-size: 15px; color: #e5e7eb; }
    .contact-form { display: flex; flex-direction: column; gap: 12px; }
    .contact-form input, .contact-form textarea, .contact-form select {
      padding: 13px 16px; border: 1px solid #374151; background: #1f2937; color: #e5e7eb; font-size: 14px; border-radius: 4px; outline: none;
    }
    .contact-form textarea { height: 100px; resize: none; }
    .contact-form button { background: ${primaryColor}; color: white; padding: 14px; font-size: 15px; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; }

    footer { background: #0a0f1a; color: #4b5563; text-align: center; padding: 40px; font-size: 13px; }
    footer .f-name { color: white; font-size: 18px; font-weight: 700; margin-bottom: 8px; }

    @media (max-width: 768px) {
      .hero-inner, .contact-grid { grid-template-columns: 1fr; }
      .hero-visual { height: 250px; }
      .services-grid { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr 1fr; }
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .hero, .services, .why, .reviews, .contact { padding: 60px 20px; }
    }
  </style>
</head>
<body>

<div class="demo-banner">
  🎨 <strong>Web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<nav>
  <div class="nav-logo">${categoryIcon} ${businessName.split(' ').slice(0,2).join(' ')}<span>.</span></div>
  <div class="nav-links">
    <a href="#servicios">Servicios</a>
    <a href="#nosotros">Nosotros</a>
    <a href="#contacto">Contacto</a>
  </div>
  ${phone ? `<a class="nav-tel" href="tel:${phone}">📞 ${phone}</a>` : '<div class="nav-tel">📞 Llámanos</div>'}
</nav>

<section class="hero" id="inicio">
  <div class="hero-inner">
    <div>
      <div class="hero-label">${category || 'Servicio técnico'} · ${address ? address.split(',').pop().trim() : 'Valencia'}</div>
      <h1>Servicio <span>profesional</span><br>rápido y fiable</h1>
      <p>${description || 'Técnicos especializados con más de 10 años de experiencia. Presupuesto sin compromiso y garantía en todos los trabajos.'}</p>
      <div class="hero-actions">
        ${phone ? `<a href="tel:${phone}" class="btn-call">📞 Llamar ahora</a>` : '<button class="btn-call">📞 Llamar ahora</button>'}
        <button class="btn-contact" onclick="document.getElementById('contacto').scrollIntoView()">Pedir presupuesto</button>
      </div>
      <div class="hero-badges">
        ${rating ? `<div class="badge">⭐ <strong>${rating}/5</strong> en Google</div>` : ''}
        <div class="badge">⚡ <strong>Atención urgente</strong> disponible</div>
        <div class="badge">✅ <strong>Presupuesto gratis</strong></div>
      </div>
    </div>
    <div class="hero-visual">
      ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${businessName}">` : categoryIcon}
    </div>
  </div>
</section>

<section class="services" id="servicios">
  <div class="section-header">
    <p class="section-tag">Nuestros servicios</p>
    <h2>¿En qué podemos ayudarte?</h2>
  </div>
  <div class="services-grid">
    <div class="service-card"><div class="s-icon">🔧</div><h3>Reparaciones</h3><p>Solucionamos cualquier avería de forma rápida y eficiente con garantía de resultado.</p></div>
    <div class="service-card"><div class="s-icon">📋</div><h3>Presupuesto gratis</h3><p>Revisamos el trabajo y te damos un presupuesto detallado sin compromiso.</p></div>
    <div class="service-card"><div class="s-icon">🏠</div><h3>Instalaciones</h3><p>Nuevas instalaciones para viviendas, locales y empresas con materiales de calidad.</p></div>
    <div class="service-card"><div class="s-icon">🔄</div><h3>Mantenimiento</h3><p>Contratos de mantenimiento preventivo para evitar problemas futuros.</p></div>
    <div class="service-card"><div class="s-icon">🚨</div><h3>Urgencias 24h</h3><p>Disponibles para emergencias. Llegamos en el menor tiempo posible.</p></div>
    <div class="service-card"><div class="s-icon">✅</div><h3>Garantía</h3><p>Todos nuestros trabajos cuentan con garantía. Tu satisfacción es nuestra prioridad.</p></div>
  </div>
</section>

${phone ? `
<section class="urgency">
  <div class="urgency-inner">
    <h2>¿Tienes una urgencia?</h2>
    <p>Llámanos ahora mismo. Estamos disponibles para atenderte y resolver tu problema lo antes posible.</p>
    <a href="tel:${phone}" class="urgency-phone">📞 ${phone}</a>
  </div>
</section>` : ''}

<section class="why" id="nosotros">
  <div class="section-header">
    <p class="section-tag">Por qué elegirnos</p>
    <h2>Números que hablan</h2>
  </div>
  <div class="why-grid">
    <div class="why-item"><div class="why-num">+10</div><div class="why-label">Años de experiencia</div><div class="why-sub">en el sector</div></div>
    ${reviewCount ? `<div class="why-item"><div class="why-num">${reviewCount}</div><div class="why-label">Clientes satisfechos</div><div class="why-sub">en Google</div></div>` : '<div class="why-item"><div class="why-num">500+</div><div class="why-label">Clientes satisfechos</div><div class="why-sub">y contando</div></div>'}
    <div class="why-item"><div class="why-num">24h</div><div class="why-label">Disponibilidad</div><div class="why-sub">urgencias atendidas</div></div>
    <div class="why-item"><div class="why-num">100%</div><div class="why-label">Garantía</div><div class="why-sub">en todos los trabajos</div></div>
  </div>
</section>

${rating ? `
<section class="reviews">
  <div class="reviews-header">
    <div class="score-block">
      <div class="score-num">${rating}</div>
      <div class="score-stars">${starsHtml}</div>
      <div class="score-total">${reviewCount || 0} reseñas en Google</div>
    </div>
    <div>
      <p class="section-tag">Opiniones</p>
      <h2 style="font-size:36px;font-weight:800;">Lo que dicen nuestros clientes</h2>
    </div>
  </div>
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Rápidos, eficientes y con un precio muy razonable. Llegaron en menos de una hora y solucionaron el problema."</p><div class="review-author">— Pedro A.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Muy profesionales. Explicaron el problema claramente y dieron presupuesto antes de empezar. Sin sorpresas."</p><div class="review-author">— Isabel R.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Los llamo siempre que necesito algo. Trabajo impecable, precio justo y muy puntuales. Totalmente recomendable."</p><div class="review-author">— Manuel G.</div></div>
  </div>
</section>` : ''}

<section class="contact" id="contacto">
  <h2>Contacta con nosotros</h2>
  <div class="contact-grid">
    <div class="contact-info">
      ${phone ? `<div class="ci-item"><div class="ci-icon">📞</div><div><div class="ci-label">Teléfono</div><div class="ci-value">${phone}</div></div></div>` : ''}
      ${address ? `<div class="ci-item"><div class="ci-icon">📍</div><div><div class="ci-label">Dirección</div><div class="ci-value">${address}</div></div></div>` : ''}
      ${email ? `<div class="ci-item"><div class="ci-icon">✉️</div><div><div class="ci-label">Email</div><div class="ci-value">${email}</div></div></div>` : ''}
      <div class="ci-item"><div class="ci-icon">🕐</div><div><div class="ci-label">Horario</div><div class="ci-value">Lun–Vie: 8:00–20:00<br>Sáb: 9:00–14:00</div></div></div>
    </div>
    <div class="contact-form">
      <input type="text" placeholder="Tu nombre">
      <input type="tel" placeholder="Teléfono de contacto">
      <input type="email" placeholder="Email (opcional)">
      <textarea placeholder="Describe el trabajo que necesitas..."></textarea>
      <button>Solicitar presupuesto gratis</button>
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
