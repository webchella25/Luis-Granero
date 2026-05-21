// src/lib/demo-generator/templates/restaurant.js
export function renderRestaurant(data) {
  const { businessName, address, phone, email, rating, reviewCount, description, profilePicUrl, primaryColor, socialMedia } = data;
  const stars = Math.round(rating || 4.5);
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Restaurante</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a1a; }
    a { color: inherit; text-decoration: none; }

    /* DEMO BANNER */
    .demo-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: linear-gradient(90deg, #0ea5e9, #6366f1);
      color: white; text-align: center; padding: 10px 16px; font-family: sans-serif; font-size: 13px;
    }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    /* NAV */
    nav {
      background: rgba(0,0,0,0.95); position: sticky; top: 42px; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 48px;
    }
    .nav-logo { color: white; font-size: 22px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: #e5e7eb; font-family: sans-serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
    .nav-links a:hover { color: ${primaryColor}; }

    /* HERO */
    .hero {
      min-height: 85vh; background: linear-gradient(135deg, #0f0f0f 0%, #1a0a00 100%);
      display: flex; align-items: center; justify-content: center; text-align: center;
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at center, rgba(234,88,12,0.2) 0%, transparent 70%);
    }
    .hero-content { position: relative; z-index: 1; padding: 40px 20px; }
    .hero-tag { color: ${primaryColor}; font-family: sans-serif; font-size: 13px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 24px; }
    .hero h1 { color: white; font-size: clamp(48px, 8vw, 96px); line-height: 1; margin-bottom: 24px; }
    .hero-sub { color: #9ca3af; font-family: sans-serif; font-size: 18px; margin-bottom: 40px; max-width: 500px; }
    .hero-cta { display: inline-block; background: ${primaryColor}; color: white; padding: 16px 40px; border-radius: 2px; font-family: sans-serif; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }

    /* ABOUT */
    .about { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .about-img { background: ${primaryColor}; min-height: 400px; display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .about-text { padding: 80px 60px; background: #fafaf8; }
    .section-tag { color: ${primaryColor}; font-family: sans-serif; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; }
    .about-text h2 { font-size: 40px; margin-bottom: 24px; line-height: 1.2; }
    .about-text p { color: #6b7280; line-height: 1.8; font-size: 16px; }

    /* MENU */
    .menu { padding: 100px 48px; background: white; }
    .menu h2 { text-align: center; font-size: 48px; margin-bottom: 16px; }
    .menu-subtitle { text-align: center; color: #9ca3af; font-family: sans-serif; margin-bottom: 64px; }
    .menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; max-width: 900px; margin: 0 auto; }
    .menu-item { background: #fafaf8; padding: 36px 28px; text-align: center; }
    .menu-item-icon { font-size: 36px; margin-bottom: 16px; }
    .menu-item h3 { font-size: 18px; margin-bottom: 8px; }
    .menu-item p { color: #9ca3af; font-family: sans-serif; font-size: 14px; }
    .menu-item .price { color: ${primaryColor}; font-size: 20px; margin-top: 12px; font-weight: bold; }

    /* REVIEWS */
    .reviews { padding: 100px 48px; background: #0f0f0f; }
    .reviews h2 { text-align: center; font-size: 48px; color: white; margin-bottom: 16px; }
    .reviews-sub { text-align: center; color: #6b7280; font-family: sans-serif; margin-bottom: 64px; }
    .reviews-score { text-align: center; margin-bottom: 48px; }
    .big-rating { font-size: 80px; color: ${primaryColor}; font-weight: bold; line-height: 1; }
    .stars-big { font-size: 28px; color: #fbbf24; letter-spacing: 4px; margin: 8px 0; }
    .reviews-count { color: #6b7280; font-family: sans-serif; font-size: 14px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto; }
    .review-card { background: #1a1a1a; padding: 28px; border-left: 3px solid ${primaryColor}; }
    .review-stars { color: #fbbf24; font-size: 14px; margin-bottom: 12px; }
    .review-text { color: #d1d5db; font-family: sans-serif; font-size: 14px; line-height: 1.7; margin-bottom: 16px; }
    .review-author { color: #6b7280; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

    /* CONTACT */
    .contact { padding: 100px 48px; background: #fafaf8; }
    .contact h2 { text-align: center; font-size: 48px; margin-bottom: 64px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; max-width: 800px; margin: 0 auto; }
    .contact-info { display: flex; flex-direction: column; gap: 32px; }
    .contact-item { display: flex; gap: 16px; align-items: flex-start; }
    .contact-icon { font-size: 24px; flex-shrink: 0; margin-top: 4px; }
    .contact-label { font-family: sans-serif; font-size: 12px; color: ${primaryColor}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .contact-value { font-size: 16px; color: #1a1a1a; }
    .contact-form { display: flex; flex-direction: column; gap: 16px; }
    .contact-form input, .contact-form textarea {
      padding: 14px 16px; border: 2px solid #e5e7eb; background: white; font-family: sans-serif; font-size: 14px; outline: none; transition: border 0.2s;
    }
    .contact-form input:focus, .contact-form textarea:focus { border-color: ${primaryColor}; }
    .contact-form textarea { height: 120px; resize: none; }
    .contact-form button { background: ${primaryColor}; color: white; padding: 16px; font-family: sans-serif; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }

    /* FOOTER */
    footer { background: #0f0f0f; color: #6b7280; text-align: center; padding: 40px; font-family: sans-serif; font-size: 14px; }
    footer .footer-name { color: white; font-size: 24px; font-family: serif; margin-bottom: 16px; }

    @media (max-width: 768px) {
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .about { grid-template-columns: 1fr; }
      .about-text { padding: 48px 24px; }
      .menu { padding: 60px 20px; }
      .menu-grid { grid-template-columns: 1fr; }
      .reviews { padding: 60px 20px; }
      .reviews-grid { grid-template-columns: 1fr; }
      .contact { padding: 60px 20px; }
      .contact-grid { grid-template-columns: 1fr; gap: 40px; }
    }
  </style>
</head>
<body>

<!-- DEMO BANNER -->
<div class="demo-banner">
  🎨 Esta es una <strong>web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — Sin compromiso. ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<!-- NAV -->
<nav>
  <div class="nav-logo">${businessName}</div>
  <div class="nav-links">
    <a href="#inicio">Inicio</a>
    <a href="#nosotros">Nosotros</a>
    <a href="#carta">Carta</a>
    <a href="#resenas">Reseñas</a>
    <a href="#contacto">Contacto</a>
  </div>
</nav>

<!-- HERO -->
<section class="hero" id="inicio">
  <div class="hero-content">
    <p class="hero-tag">Restaurante · ${address ? address.split(',')[address.split(',').length - 1].trim() : 'Valencia'}</p>
    <h1>${businessName}</h1>
    <p class="hero-sub">${description || 'Cocina auténtica elaborada con productos frescos de temporada y la mejor tradición culinaria.'}</p>
    <a href="#carta" class="hero-cta">Ver nuestra carta</a>
  </div>
</section>

<!-- ABOUT -->
<section class="about" id="nosotros">
  <div class="about-img">${profilePicUrl ? `<img src="${profilePicUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${businessName}">` : '🍽️'}</div>
  <div class="about-text">
    <p class="section-tag">Nuestra historia</p>
    <h2>Pasión por la buena mesa desde el primer día</h2>
    <p>${description || 'Somos un restaurante comprometido con la calidad y el sabor auténtico. Cada plato que sale de nuestra cocina es el resultado de años de experiencia y amor por la gastronomía local.'}</p>
    ${rating ? `<br><p style="font-family:sans-serif;font-size:14px;color:#6b7280;">⭐ ${rating} estrellas · ${reviewCount || 0} reseñas en Google</p>` : ''}
  </div>
</section>

<!-- MENU -->
<section class="menu" id="carta">
  <p class="section-tag" style="text-align:center;">Lo que ofrecemos</p>
  <h2>Nuestra Carta</h2>
  <p class="menu-subtitle">Productos frescos, sabores auténticos, experiencias memorables.</p>
  <div class="menu-grid">
    <div class="menu-item"><div class="menu-item-icon">🥗</div><h3>Entrantes</h3><p>Selección de productos frescos de temporada</p><div class="price">desde 8€</div></div>
    <div class="menu-item"><div class="menu-item-icon">🍖</div><h3>Platos Principales</h3><p>Elaborados con ingredientes de primera calidad</p><div class="price">desde 14€</div></div>
    <div class="menu-item"><div class="menu-item-icon">🍰</div><h3>Postres</h3><p>Dulces tentaciones hechas en casa</p><div class="price">desde 5€</div></div>
  </div>
</section>

<!-- REVIEWS -->
<section class="reviews" id="resenas">
  <p class="section-tag" style="text-align:center;color:${primaryColor};">Lo que dicen nuestros clientes</p>
  <h2>Reseñas</h2>
  <p class="reviews-sub">La satisfacción de nuestros clientes habla por nosotros</p>
  ${rating ? `
  <div class="reviews-score">
    <div class="big-rating">${rating}</div>
    <div class="stars-big">${starsHtml}</div>
    <div class="reviews-count">${reviewCount || 0} reseñas verificadas en Google</div>
  </div>` : ''}
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Excelente comida y un trato inmejorable. Sin duda el mejor restaurante de la zona. Volveremos."</p><div class="review-author">— Cliente satisfecho</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"La calidad de los ingredientes se nota en cada plato. El ambiente es perfecto para cualquier ocasión."</p><div class="review-author">— Visitante frecuente</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Servicio impecable y una carta con opciones para todos los gustos. Totalmente recomendable."</p><div class="review-author">— Familia García</div></div>
  </div>
</section>

<!-- CONTACT -->
<section class="contact" id="contacto">
  <p class="section-tag" style="text-align:center;">Encuéntranos</p>
  <h2>Contacto y Reservas</h2>
  <div class="contact-grid">
    <div class="contact-info">
      ${phone ? `<div class="contact-item"><div class="contact-icon">📞</div><div><div class="contact-label">Teléfono</div><div class="contact-value">${phone}</div></div></div>` : ''}
      ${address ? `<div class="contact-item"><div class="contact-icon">📍</div><div><div class="contact-label">Dirección</div><div class="contact-value">${address}</div></div></div>` : ''}
      ${email ? `<div class="contact-item"><div class="contact-icon">✉️</div><div><div class="contact-label">Email</div><div class="contact-value">${email}</div></div></div>` : ''}
      <div class="contact-item"><div class="contact-icon">🕐</div><div><div class="contact-label">Horario</div><div class="contact-value">Mar–Sáb: 13:00–16:00 y 20:00–23:00<br>Dom: 13:00–16:00</div></div></div>
    </div>
    <div class="contact-form">
      <input type="text" placeholder="Tu nombre">
      <input type="email" placeholder="Tu email">
      <input type="tel" placeholder="Teléfono">
      <textarea placeholder="¿Para cuántas personas? ¿Fecha y hora preferida?"></textarea>
      <button>Solicitar Reserva</button>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-name">${businessName}</div>
  <p>${address || ''}</p>
  <p style="margin-top:8px;">${phone || ''} ${email ? `· ${email}` : ''}</p>
  <p style="margin-top:24px;font-size:12px;color:#374151;">Web de demostración creada por <a href="https://www.luisgranero.com" style="color:${primaryColor};">luisgranero.com</a></p>
</footer>

</body>
</html>`;
}
