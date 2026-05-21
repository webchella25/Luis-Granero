// src/lib/demo-generator/templates/shop.js — Tiendas, comercios, boutiques
export function renderShop(data) {
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
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; }

    .demo-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 9999; background: linear-gradient(90deg, #0ea5e9, #6366f1); color: white; text-align: center; padding: 10px 16px; font-size: 13px; }
    .demo-banner a { color: #fbbf24; font-weight: bold; text-decoration: underline; }
    body { padding-top: 42px; }

    .top-bar { background: #111; color: #9ca3af; text-align: center; padding: 8px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
    .top-bar span { color: ${primaryColor}; }
    nav { background: white; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; padding: 20px 48px; position: sticky; top: 42px; z-index: 100; }
    .nav-logo { font-size: 24px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; }
    .nav-links { display: flex; gap: 32px; }
    .nav-links a { color: #374151; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; transition: color 0.2s; }
    .nav-links a:hover { color: ${primaryColor}; }

    .hero { min-height: 85vh; background: #f9fafb; display: grid; grid-template-columns: 1fr 1fr; }
    .hero-text { display: flex; flex-direction: column; justify-content: center; padding: 80px 64px; }
    .hero-label { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 20px; }
    .hero h1 { font-size: clamp(40px, 5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 20px; }
    .hero p { color: #6b7280; font-size: 17px; line-height: 1.7; margin-bottom: 36px; max-width: 440px; }
    .hero-btns { display: flex; gap: 16px; }
    .btn-solid { background: #111; color: white; padding: 16px 40px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: none; cursor: pointer; }
    .btn-light { background: transparent; color: #111; padding: 16px 40px; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: 2px solid #111; cursor: pointer; }
    .hero-img { background: ${primaryColor}15; display: flex; align-items: center; justify-content: center; font-size: 80px; overflow: hidden; }
    .hero-img img { width: 100%; height: 100%; object-fit: cover; }

    .features { display: grid; grid-template-columns: repeat(3, 1fr); background: #111; }
    .feature-item { padding: 32px 28px; border-right: 1px solid #1f2937; text-align: center; }
    .feature-item:last-child { border-right: none; }
    .feature-icon { font-size: 28px; margin-bottom: 12px; }
    .feature-item h3 { color: white; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
    .feature-item p { color: #6b7280; font-size: 13px; }

    .products { padding: 100px 48px; background: white; }
    .section-header { text-align: center; margin-bottom: 60px; }
    .section-tag { color: ${primaryColor}; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 12px; }
    .section-header h2 { font-size: 44px; font-weight: 300; }
    .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #f3f4f6; max-width: 1100px; margin: 0 auto; }
    .product-card { background: white; overflow: hidden; }
    .product-img { height: 220px; background: #f9fafb; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .product-info { padding: 20px; }
    .product-cat { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
    .product-name { font-size: 15px; margin-bottom: 8px; }
    .product-price { color: ${primaryColor}; font-size: 18px; font-weight: bold; }

    .cta-section { background: ${primaryColor}; padding: 80px 48px; text-align: center; }
    .cta-section h2 { color: white; font-size: 44px; font-weight: 300; margin-bottom: 16px; }
    .cta-section p { color: rgba(255,255,255,0.85); font-size: 17px; margin-bottom: 36px; }
    .cta-btn { display: inline-block; background: white; color: #111; padding: 18px 48px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }

    ${rating ? `
    .reviews { padding: 100px 48px; background: #f9fafb; }
    .reviews-meta { text-align: center; margin-bottom: 48px; }
    .reviews-score { font-size: 64px; font-weight: 300; color: #111; }
    .reviews-stars { font-size: 24px; color: #fbbf24; margin: 4px 0; }
    .reviews-total { color: #9ca3af; font-size: 13px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px; margin: 0 auto; }
    .review-card { background: white; padding: 28px; border: 1px solid #f3f4f6; }
    .review-stars { color: #fbbf24; font-size: 13px; margin-bottom: 12px; }
    .review-text { color: #6b7280; font-size: 14px; line-height: 1.7; font-style: italic; margin-bottom: 16px; }
    .review-author { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }` : ''}

    .contact { padding: 100px 48px; background: white; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 900px; margin: 0 auto; }
    .contact-info { }
    .contact-item { margin-bottom: 28px; }
    .c-label { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 6px; }
    .c-value { font-size: 15px; color: #374151; }
    .subscribe-box { background: #f9fafb; padding: 36px; }
    .subscribe-box h3 { font-size: 22px; font-weight: 300; margin-bottom: 12px; }
    .subscribe-box p { color: #9ca3af; font-size: 14px; margin-bottom: 24px; }
    .subscribe-form { display: flex; gap: 0; }
    .subscribe-form input { flex: 1; padding: 14px 16px; border: 2px solid #e5e7eb; border-right: none; font-size: 14px; outline: none; background: white; }
    .subscribe-form button { background: #111; color: white; padding: 14px 24px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; border: none; cursor: pointer; white-space: nowrap; }

    footer { background: #111; color: #4b5563; text-align: center; padding: 48px; font-size: 13px; }
    footer .f-logo { color: white; font-size: 22px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 16px; }

    @media (max-width: 768px) {
      .hero { grid-template-columns: 1fr; }
      .hero-text { padding: 48px 24px; }
      .hero-img { height: 280px; }
      .features { grid-template-columns: 1fr; }
      .products-grid { grid-template-columns: 1fr 1fr; }
      .reviews-grid { grid-template-columns: 1fr; }
      .contact-grid { grid-template-columns: 1fr; gap: 40px; }
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .products, .reviews, .contact { padding: 60px 20px; }
    }
  </style>
</head>
<body>

<div class="demo-banner">
  🎨 <strong>Web de demostración</strong> creada por <a href="https://www.luisgranero.com" target="_blank">luisgranero.com</a> para ${businessName} — ¿Te gusta? <a href="https://www.luisgranero.com/contacto" target="_blank">Hablemos →</a>
</div>

<div class="top-bar">Envío gratuito en pedidos superiores a <span>50€</span> · Atención personalizada: ${phone || 'contacto directo'}</div>

<nav>
  <div class="nav-logo">${businessName.split(' ').slice(0,1)[0]}</div>
  <div class="nav-links">
    <a href="#productos">Productos</a>
    <a href="#nosotros">Nosotros</a>
    <a href="#contacto">Contacto</a>
  </div>
</nav>

<section class="hero" id="inicio">
  <div class="hero-text">
    <p class="hero-label">${category || 'Tienda'} · ${address ? address.split(',').pop().trim() : 'Valencia'}</p>
    <h1>Calidad que<br>se nota</h1>
    <p>${description || 'Descubre nuestra selección de productos cuidadosamente elegidos para ti. Calidad, diseño y atención personalizada.'}</p>
    <div class="hero-btns">
      <button class="btn-solid" onclick="document.getElementById('productos').scrollIntoView()">Ver productos</button>
      <button class="btn-light" onclick="document.getElementById('contacto').scrollIntoView()">Contactar</button>
    </div>
  </div>
  <div class="hero-img">
    ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${businessName}">` : '🛍️'}
  </div>
</section>

<div class="features">
  <div class="feature-item"><div class="feature-icon">🚚</div><h3>Envío rápido</h3><p>En 24-48h a toda España</p></div>
  <div class="feature-item"><div class="feature-icon">↩️</div><h3>Devoluciones fáciles</h3><p>30 días sin preguntas</p></div>
  <div class="feature-item"><div class="feature-icon">💬</div><h3>Atención personalizada</h3><p>Te asesoramos en tu compra</p></div>
</div>

<section class="products" id="productos">
  <div class="section-header">
    <p class="section-tag">Catálogo</p>
    <h2>Nuestros productos</h2>
  </div>
  <div class="products-grid">
    <div class="product-card"><div class="product-img">📦</div><div class="product-info"><p class="product-cat">Colección</p><p class="product-name">Producto destacado</p><p class="product-price">29,99€</p></div></div>
    <div class="product-card"><div class="product-img">🎁</div><div class="product-info"><p class="product-cat">Oferta</p><p class="product-name">Producto en oferta</p><p class="product-price">19,99€</p></div></div>
    <div class="product-card"><div class="product-img">⭐</div><div class="product-info"><p class="product-cat">Más vendido</p><p class="product-name">Producto estrella</p><p class="product-price">39,99€</p></div></div>
    <div class="product-card"><div class="product-img">✨</div><div class="product-info"><p class="product-cat">Novedad</p><p class="product-name">Nuevo producto</p><p class="product-price">24,99€</p></div></div>
  </div>
</section>

<section class="cta-section">
  <h2>Visítanos en tienda</h2>
  <p>Ven a ver nuestros productos en persona. Te atendemos con el mismo cariño de siempre.</p>
  ${address ? `<a href="https://maps.google.com/?q=${encodeURIComponent(address)}" class="cta-btn">📍 Ver ubicación</a>` : '<a href="#contacto" class="cta-btn">Contactar</a>'}
</section>

${rating ? `
<section class="reviews">
  <div class="section-header">
    <p class="section-tag">Opiniones</p>
    <h2>Lo que dicen de nosotros</h2>
  </div>
  <div class="reviews-meta">
    <div class="reviews-score">${rating}</div>
    <div class="reviews-stars">${starsHtml}</div>
    <div class="reviews-total">${reviewCount || 0} valoraciones en Google</div>
  </div>
  <div class="reviews-grid">
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Calidad increíble y servicio excepcional. Todo llegó perfectamente embalado y en tiempo récord."</p><div class="review-author">— Laura P.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"El personal es muy amable y te ayudan a elegir. Los productos son de muy buena calidad."</p><div class="review-author">— Miguel A.</div></div>
    <div class="review-card"><div class="review-stars">★★★★★</div><p class="review-text">"Ya es mi tienda de referencia. Siempre tienen lo que busco y a precios muy competitivos."</p><div class="review-author">— Sara F.</div></div>
  </div>
</section>` : ''}

<section class="contact" id="contacto">
  <div class="section-header">
    <p class="section-tag">Visítanos</p>
    <h2>Contacto y tienda</h2>
  </div>
  <div class="contact-grid">
    <div class="contact-info">
      ${phone ? `<div class="contact-item"><div class="c-label">Teléfono</div><div class="c-value">${phone}</div></div>` : ''}
      ${address ? `<div class="contact-item"><div class="c-label">Tienda física</div><div class="c-value">${address}</div></div>` : ''}
      ${email ? `<div class="contact-item"><div class="c-label">Email</div><div class="c-value">${email}</div></div>` : ''}
      <div class="contact-item"><div class="c-label">Horario</div><div class="c-value">Lun–Sáb: 10:00–20:30<br>Dom: 11:00–14:00</div></div>
    </div>
    <div class="subscribe-box">
      <h3>Recibe nuestras novedades</h3>
      <p>Suscríbete y sé el primero en saber las novedades y ofertas exclusivas.</p>
      <div class="subscribe-form">
        <input type="email" placeholder="tu@email.com">
        <button>Suscribirse</button>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="f-logo">${businessName.split(' ').slice(0,1)[0]}</div>
  <p>${address || ''} ${phone ? `· ${phone}` : ''}</p>
  <p style="margin-top:20px;font-size:12px;">Web de demostración por <a href="https://www.luisgranero.com" style="color:${primaryColor};">luisgranero.com</a></p>
</footer>

</body>
</html>`;
}
