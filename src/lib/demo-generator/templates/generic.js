// src/lib/demo-generator/templates/generic.js — Template universal para cualquier negocio
export function renderGeneric(data) {
  const { businessName, address, phone, email, rating, reviewCount, description, profilePicUrl, primaryColor, category } = data;
  const stars = Math.round(rating || 4.5);
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; }

    .demo-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: linear-gradient(90deg, #0ea5e9, #6366f1); color: white; text-align: center; padding: 10px 16px; font-size: 13px; }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    nav { background: white; box-shadow: 0 1px 16px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; padding: 18px 48px; position: sticky; top: 42px; z-index: 100; }
    .nav-logo { font-size: 20px; font-weight: 700; color: #0f172a; }
    .nav-logo span { color: ${primaryColor}; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { color: #64748b; font-size: 14px; transition: color 0.2s; }
    .nav-links a:hover { color: ${primaryColor}; }
    .nav-cta { background: ${primaryColor}; color: white; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 500; }

    .hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 85vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 80px 48px; }
    .hero-inner { max-width: 760px; }
    .hero-chip { display: inline-block; background: ${primaryColor}20; color: ${primaryColor}; padding: 6px 18px; border-radius: 100px; font-size: 13px; font-weight: 500; margin-bottom: 28px; border: 1px solid ${primaryColor}30; }
    .hero h1 { font-size: clamp(40px, 6vw, 80px); color: white; font-weight: 800; line-height: 1.05; margin-bottom: 24px; }
    .hero h1 span { color: ${primaryColor}; }
    .hero p { color: #94a3b8; font-size: 18px; line-height: 1.7; margin-bottom: 40px; }
    .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary { background: ${primaryColor}; color: white; padding: 15px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; }
    .btn-secondary { background: transparent; color: #e2e8f0; padding: 15px 36px; border-radius: 8px; font-size: 15px; font-weight: 500; border: 2px solid #334155; cursor: pointer; }
    ${rating ? `.hero-rating { margin-top: 48px; display: flex; gap: 8px; justify-content: center; align-items: center; color: #64748b; font-size: 14px; }
    .hero-rating strong { color: white; }` : ''}

    .features { padding: 80px 48px; background: white; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 900px; margin: 0 auto; }
    .feature { text-align: center; padding: 32px 24px; border-radius: 12px; transition: all 0.2s; }
    .feature:hover { background: #f8fafc; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .f-icon { width: 56px; height: 56px; background: ${primaryColor}15; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
    .feature h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; color: #0f172a; }
    .feature p { color: #64748b; font-size: 14px; line-height: 1.6; }

    .about { padding: 100px 48px; background: #f8fafc; }
    .about-inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .about-img { background: ${primaryColor}15; border-radius: 20px; height: 380px; display: flex; align-items: center; justify-content: center; font-size: 80px; overflow: hidden; }
    .about-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; }
    .section-tag { color: ${primaryColor}; font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
    .about-text h2 { font-size: 40px; font-weight: 700; margin-bottom: 20px; color: #0f172a; line-height: 1.2; }
    .about-text p { color: #64748b; font-size: 16px; line-height: 1.8; }
    .about-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
    .stat { background: white; padding: 20px; border-radius: 10px; border-left: 3px solid ${primaryColor}; }
    .stat-num { font-size: 32px; font-weight: 700; color: ${primaryColor}; }
    .stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }

    ${rating ? `
    .reviews { padding: 100px 48px; background: white; }
    .reviews-header { text-align: center; margin-bottom: 60px; }
    .reviews-score { text-align: center; margin-bottom: 48px; }
    .rs-num { font-size: 72px; font-weight: 800; color: ${primaryColor}; line-height: 1; }
    .rs-stars { font-size: 22px; color: #fbbf24; margin: 8px 0; }
    .rs-total { color: #94a3b8; font-size: 13px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; }
    .review-card { background: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .review-stars { color: #fbbf24; font-size: 14px; margin-bottom: 12px; }
    .review-text { color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; margin-bottom: 16px; }
    .review-author { font-size: 12px; color: #94a3b8; font-weight: 500; }` : ''}

    .contact-section { padding: 100px 48px; background: #0f172a; }
    .contact-section h2 { text-align: center; font-size: 44px; font-weight: 700; color: white; margin-bottom: 60px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; max-width: 900px; margin: 0 auto; }
    .contact-info { }
    .ci { display: flex; gap: 16px; margin-bottom: 28px; }
    .ci-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .ci-content .label { font-size: 11px; color: ${primaryColor}; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .ci-content .value { font-size: 15px; color: #e2e8f0; }
    .contact-form { display: flex; flex-direction: column; gap: 12px; }
    .cf-input { padding: 13px 16px; border: 1px solid #1e293b; background: #1e293b; color: #e2e8f0; font-size: 14px; border-radius: 8px; outline: none; transition: border 0.2s; }
    .cf-input:focus { border-color: ${primaryColor}; }
    textarea.cf-input { height: 100px; resize: none; }
    .cf-btn { background: ${primaryColor}; color: white; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; }

    footer { background: #080f1c; color: #374151; text-align: center; padding: 48px; font-size: 13px; }
    footer .fn { color: white; font-size: 18px; font-weight: 700; margin-bottom: 8px; }

    @media (max-width: 768px) {
      .about-inner, .contact-grid { grid-template-columns: 1fr; }
      .about-img { height: 250px; }
      .features-grid { grid-template-columns: 1fr; }
      .reviews-grid { grid-template-columns: 1fr; }
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .hero, .features, .about, .reviews, .contact-section { padding: 60px 20px; }
    }
  </style>
</head>
<body>

<div class="demo-banner">
  🎨 <strong>Web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<nav>
  <div class="nav-logo">${businessName.split(' ').slice(0,2).join(' ')}<span>.</span></div>
  <div class="nav-links">
    <a href="#servicios">Servicios</a>
    <a href="#nosotros">Nosotros</a>
    <a href="#contacto">Contacto</a>
  </div>
  <a href="#contacto" class="nav-cta">Contactar</a>
</nav>

<section class="hero">
  <div class="hero-inner">
    <div class="hero-chip">✨ ${category || 'Negocio profesional'} · ${address ? address.split(',').pop().trim() : 'Valencia'}</div>
    <h1>${businessName.split(' ').slice(0,3).join(' ')}<br><span>a tu servicio</span></h1>
    <p>${description || 'Ofrecemos el mejor servicio con profesionalismo, experiencia y dedicación. Tu satisfacción es nuestra prioridad.'}</p>
    <div class="hero-btns">
      <button class="btn-primary" onclick="document.getElementById('contacto').scrollIntoView()">Contactar ahora</button>
      <button class="btn-secondary" onclick="document.getElementById('nosotros').scrollIntoView()">Saber más</button>
    </div>
    ${rating ? `<div class="hero-rating">⭐ <strong>${rating}/5</strong> en Google · <strong>${reviewCount || 0}</strong> valoraciones verificadas</div>` : ''}
  </div>
</section>

<section class="features" id="servicios">
  <div class="features-grid">
    <div class="feature"><div class="f-icon">⚡</div><h3>Servicio rápido</h3><p>Respondemos a tu solicitud en el menor tiempo posible.</p></div>
    <div class="feature"><div class="f-icon">🏆</div><h3>Calidad garantizada</h3><p>Trabajamos con los mejores estándares de calidad en todo lo que hacemos.</p></div>
    <div class="feature"><div class="f-icon">🤝</div><h3>Atención personalizada</h3><p>Cada cliente es único. Te damos el trato que mereces.</p></div>
  </div>
</section>

<section class="about" id="nosotros">
  <div class="about-inner">
    <div class="about-img">
      ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${businessName}">` : '🏢'}
    </div>
    <div class="about-text">
      <p class="section-tag">Sobre nosotros</p>
      <h2>${businessName}</h2>
      <p>${description || 'Somos un equipo comprometido con ofrecer el mejor servicio posible. Llevamos años en el sector y conocemos bien las necesidades de nuestros clientes.'}</p>
      <div class="about-stats">
        ${reviewCount ? `<div class="stat"><div class="stat-num">${reviewCount}</div><div class="stat-label">Clientes satisfechos</div></div>` : '<div class="stat"><div class="stat-num">10+</div><div class="stat-label">Años de experiencia</div></div>'}
        ${rating ? `<div class="stat"><div class="stat-num">${rating}★</div><div class="stat-label">Valoración en Google</div></div>` : '<div class="stat"><div class="stat-num">100%</div><div class="stat-label">Compromiso calidad</div></div>'}
      </div>
    </div>
  </div>
</section>

${rating ? `
<section class="reviews">
  <div class="reviews-header">
    <p class="section-tag">Testimonios</p>
    <h2 style="font-size:44px;font-weight:700;">Lo que dicen de nosotros</h2>
  </div>
  <div class="reviews-score">
    <div class="rs-num">${rating}</div>
    <div class="rs-stars">${starsHtml}</div>
    <div class="rs-total">${reviewCount || 0} valoraciones en Google</div>
  </div>
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Servicio excelente de principio a fin. Muy profesionales y atentos. Volvería sin dudarlo."</p><div class="review-author">— Cliente satisfecho</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Lo mejor que he encontrado en la zona. Resolutivos, amables y con precios justos."</p><div class="review-author">— María S.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"No busques más. Aquí están los profesionales de verdad. 100% recomendable sin ninguna duda."</p><div class="review-author">— Roberto P.</div></div>
  </div>
</section>` : ''}

<section class="contact-section" id="contacto">
  <h2>Contacta con nosotros</h2>
  <div class="contact-grid">
    <div class="contact-info">
      ${phone ? `<div class="ci"><div class="ci-icon">📞</div><div class="ci-content"><div class="label">Teléfono</div><div class="value">${phone}</div></div></div>` : ''}
      ${address ? `<div class="ci"><div class="ci-icon">📍</div><div class="ci-content"><div class="label">Dirección</div><div class="value">${address}</div></div></div>` : ''}
      ${email ? `<div class="ci"><div class="ci-icon">✉️</div><div class="ci-content"><div class="label">Email</div><div class="value">${email}</div></div></div>` : ''}
      <div class="ci"><div class="ci-icon">🕐</div><div class="ci-content"><div class="label">Horario</div><div class="value">Lun–Vie: 9:00–19:00</div></div></div>
    </div>
    <div class="contact-form">
      <input type="text" placeholder="Tu nombre" class="cf-input">
      <input type="email" placeholder="Tu email" class="cf-input">
      <input type="tel" placeholder="${phone || 'Teléfono'}" class="cf-input">
      <textarea placeholder="¿En qué podemos ayudarte?" class="cf-input"></textarea>
      <button class="cf-btn">Enviar mensaje</button>
    </div>
  </div>
</section>

<footer>
  <div class="fn">${businessName}</div>
  <p>${address || ''} ${phone ? `· ${phone}` : ''}</p>
  <p style="margin-top:20px;font-size:12px;">Web de demostración por <a href="https://www.luisgranero.com" style="color:${primaryColor};">luisgranero.com</a></p>
</footer>

</body>
</html>`;
}
