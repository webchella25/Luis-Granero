// src/lib/demo-generator/templates/beauty.js — Peluquerías, estéticas, spas, barberías
export function renderBeauty(data) {
  const { businessName, address, phone, email, rating, reviewCount, description, profilePicUrl, primaryColor, category } = data;
  const stars = Math.round(rating || 5);
  const starsHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  const isBarber = category?.toLowerCase().includes('barber') || category?.toLowerCase().includes('barbería');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; }

    .demo-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: linear-gradient(90deg, #0ea5e9, #6366f1);
      color: white; text-align: center; padding: 10px 16px; font-size: 13px;
    }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    nav {
      background: white; border-bottom: 1px solid #f0f0f0;
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 48px; position: sticky; top: 42px; z-index: 100;
    }
    .nav-logo { font-size: 20px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; }
    .nav-logo span { color: ${primaryColor}; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: #666; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; transition: color 0.2s; }
    .nav-links a:hover { color: ${primaryColor}; }
    .nav-book { background: ${primaryColor}; color: white; padding: 10px 24px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }

    .hero {
      min-height: 90vh; background: #faf9f7;
      display: grid; grid-template-columns: 1fr 1fr;
    }
    .hero-text { display: flex; flex-direction: column; justify-content: center; padding: 80px 64px; }
    .hero-tag { color: ${primaryColor}; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 24px; }
    .hero-text h1 { font-size: clamp(40px, 5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 24px; }
    .hero-text h1 em { color: ${primaryColor}; font-style: normal; }
    .hero-text p { color: #888; font-size: 16px; line-height: 1.7; margin-bottom: 40px; max-width: 420px; }
    .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn-primary { background: ${primaryColor}; color: white; padding: 16px 36px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }
    .btn-outline { background: transparent; color: #1a1a1a; padding: 16px 36px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: 2px solid #1a1a1a; cursor: pointer; }
    .hero-img {
      background: ${primaryColor}10; display: flex; align-items: center; justify-content: center;
      font-size: 100px; overflow: hidden;
    }
    .hero-img img { width: 100%; height: 100%; object-fit: cover; }

    .services { padding: 100px 48px; background: white; }
    .section-header { text-align: center; margin-bottom: 64px; }
    .section-tag { color: ${primaryColor}; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .section-header h2 { font-size: 44px; font-weight: 300; }
    .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #f0f0f0; max-width: 1000px; margin: 0 auto; }
    .service-item { background: white; padding: 40px 28px; text-align: center; transition: background 0.2s; }
    .service-item:hover { background: ${primaryColor}08; }
    .service-icon { font-size: 40px; margin-bottom: 20px; }
    .service-item h3 { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
    .service-item p { color: #999; font-size: 13px; line-height: 1.6; }
    .service-price { color: ${primaryColor}; font-size: 18px; font-weight: bold; margin-top: 16px; }

    .booking { padding: 80px 48px; background: ${primaryColor}; }
    .booking-inner { max-width: 600px; margin: 0 auto; text-align: center; }
    .booking h2 { color: white; font-size: 44px; font-weight: 300; margin-bottom: 16px; }
    .booking p { color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 40px; }
    .booking-form { display: flex; flex-direction: column; gap: 12px; }
    .booking-form input, .booking-form select {
      padding: 14px 16px; border: none; background: white; font-size: 14px; outline: none;
    }
    .booking-form button { background: #1a1a1a; color: white; padding: 16px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }

    .reviews { padding: 100px 48px; background: #faf9f7; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto; }
    .review-card { background: white; padding: 32px; }
    .review-stars { color: #fbbf24; font-size: 14px; margin-bottom: 12px; }
    .review-text { color: #555; font-size: 15px; line-height: 1.7; font-style: italic; margin-bottom: 20px; }
    .review-author { font-size: 12px; color: #999; letter-spacing: 1px; text-transform: uppercase; }
    .reviews-badge { text-align: center; margin-bottom: 48px; }
    .reviews-badge .score { font-size: 72px; font-weight: 300; color: ${primaryColor}; line-height: 1; }
    .reviews-badge .stars { font-size: 24px; color: #fbbf24; margin: 4px 0; }
    .reviews-badge .total { color: #999; font-size: 13px; }

    .contact { padding: 100px 48px; background: white; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 900px; margin: 0 auto; }
    .contact-item { margin-bottom: 32px; }
    .contact-label { color: ${primaryColor}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
    .contact-value { font-size: 15px; color: #333; line-height: 1.6; }
    .contact-map { background: #f0f0f0; height: 250px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px; }

    footer { background: #1a1a1a; color: #555; text-align: center; padding: 48px; font-size: 13px; }
    footer .f-name { color: white; font-size: 20px; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 16px; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .hero-text { padding: 48px 24px; }
      .hero-img { height: 300px; }
      .services { padding: 60px 20px; }
      .services-grid { grid-template-columns: 1fr 1fr; }
      .booking { padding: 60px 20px; }
      .reviews { padding: 60px 20px; }
      .reviews-grid { grid-template-columns: 1fr; }
      .contact { padding: 60px 20px; }
      .contact-grid { grid-template-columns: 1fr; gap: 40px; }
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<div class="demo-banner">
  🎨 <strong>Web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<nav>
  <div class="nav-logo">${businessName.split(' ').slice(0,1).join('')}<span>.</span></div>
  <div class="nav-links">
    <a href="#servicios">Servicios</a>
    <a href="#reservas">Reservar</a>
    <a href="#resenas">Reseñas</a>
    <a href="#contacto">Contacto</a>
  </div>
  <a href="#reservas" class="nav-book">Reservar cita</a>
</nav>

<section class="hero">
  <div class="hero-text">
    <p class="hero-tag">${category || 'Centro de Belleza'} · ${address ? address.split(',').pop().trim() : 'Valencia'}</p>
    <h1>Tu belleza,<br>nuestra <em>pasión</em></h1>
    <p>${description || 'Expertos en cuidado personal con los mejores productos y técnicas del sector. Tu satisfacción es nuestra prioridad.'}</p>
    <div class="hero-ctas">
      <button class="btn-primary" onclick="document.getElementById('reservas').scrollIntoView()">Reservar cita</button>
      <button class="btn-outline" onclick="document.getElementById('servicios').scrollIntoView()">Ver servicios</button>
    </div>
  </div>
  <div class="hero-img">
    ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${businessName}">` : (isBarber ? '💈' : '💇')}
  </div>
</section>

<section class="services" id="servicios">
  <div class="section-header">
    <p class="section-tag">Nuestros servicios</p>
    <h2>Lo que ofrecemos</h2>
  </div>
  <div class="services-grid">
    <div class="service-item"><div class="service-icon">${isBarber ? '✂️' : '💇‍♀️'}</div><h3>${isBarber ? 'Corte y arreglo' : 'Corte y peinado'}</h3><p>Servicio completo adaptado a tu estilo</p><div class="service-price">desde 15€</div></div>
    <div class="service-item"><div class="service-icon">🎨</div><h3>${isBarber ? 'Color y mechas' : 'Coloración'}</h3><p>Técnicas modernas para un resultado perfecto</p><div class="service-price">desde 35€</div></div>
    <div class="service-item"><div class="service-icon">✨</div><h3>Tratamientos</h3><p>Hidratación, keratina y cuidado capilar</p><div class="service-price">desde 25€</div></div>
    <div class="service-item"><div class="service-icon">💅</div><h3>Estética</h3><p>Manicura, pedicura y depilación</p><div class="service-price">desde 12€</div></div>
  </div>
</section>

<section class="booking" id="reservas">
  <div class="booking-inner">
    <h2>Reserva tu cita</h2>
    <p>Sin esperas. Elige el servicio y horario que mejor te venga y te confirmamos en minutos.</p>
    <div class="booking-form">
      <input type="text" placeholder="Tu nombre">
      <input type="tel" placeholder="${phone || 'Tu teléfono'}">
      <select><option>Selecciona el servicio...</option><option>Corte</option><option>Color</option><option>Tratamiento</option><option>Otro</option></select>
      <input type="datetime-local">
      <button>Solicitar cita</button>
    </div>
  </div>
</section>

${rating ? `
<section class="reviews" id="resenas">
  <div class="section-header">
    <p class="section-tag">Opiniones</p>
    <h2>Lo que dicen nuestros clientes</h2>
  </div>
  <div class="reviews-badge">
    <div class="score">${rating}</div>
    <div class="stars">${starsHtml}</div>
    <div class="total">${reviewCount || 0} reseñas en Google</div>
  </div>
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Profesionales increíbles. El resultado siempre supera mis expectativas. ¡No voy a ningún otro sitio!"</p><div class="review-author">— María R.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"El mejor equipo que he visitado. Atienden con muchísimo cuidado y el local es precioso."</p><div class="review-author">— Ana G.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Piden cita online, son puntuales y el servicio es de 10. Totalmente recomendable."</p><div class="review-author">— Carlos M.</div></div>
  </div>
</section>` : ''}

<section class="contact" id="contacto">
  <div class="section-header">
    <p class="section-tag">Encuéntranos</p>
    <h2>Contacto</h2>
  </div>
  <div class="contact-grid">
    <div>
      ${phone ? `<div class="contact-item"><div class="contact-label">Teléfono</div><div class="contact-value">${phone}</div></div>` : ''}
      ${address ? `<div class="contact-item"><div class="contact-label">Dirección</div><div class="contact-value">${address}</div></div>` : ''}
      ${email ? `<div class="contact-item"><div class="contact-label">Email</div><div class="contact-value">${email}</div></div>` : ''}
      <div class="contact-item"><div class="contact-label">Horario</div><div class="contact-value">Lun–Sáb: 9:00–20:00<br>Cerrado domingos</div></div>
    </div>
    <div class="contact-map">📍 ${address || 'Tu dirección aquí'}</div>
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
