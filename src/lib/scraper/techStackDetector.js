// src/lib/scraper/techStackDetector.js
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * TECH STACK DETECTOR (100% Gratuito)
 * Detecta la tecnología usada en un website analizando el HTML
 */
export async function detectTechStack(url) {
  if (!url) return null;

  // Normalizar URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log(`\n🔍 Detectando tech stack: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const headers = response.headers;

    const techStack = {
      cms: detectCMS(html, $),
      framework: detectFramework(html, $),
      hosting: detectHosting(headers, html),
      analytics: detectAnalytics(html),
      ecommerce: detectEcommerce(html, $),
      email: detectEmailMarketing(html),
      chat: detectChat(html),
      cdn: detectCDN(html, headers),
      payment: detectPaymentGateway(html),
      security: detectSecurity(html, url),
      performance: detectPerformance(html),
      socialWidgets: detectSocialWidgets(html, $),
      plugins: detectPlugins(html, $)
    };

    // Generar recomendaciones
    const recommendations = generateRecommendations(techStack);

    // Detectar tecnologías obsoletas
    const obsolete = detectObsoleteTech(techStack, html);

    console.log('✅ Tech stack detectado');
    console.log('  CMS:', techStack.cms?.name || 'Ninguno');
    console.log('  Framework:', techStack.framework?.name || 'Ninguno');
    console.log('  Hosting:', techStack.hosting?.provider || 'Desconocido');

    return {
      ...techStack,
      recommendations,
      obsolete,
      detectedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Error detectando tech stack:', error.message);
    return null;
  }
}

/**
 * Detectar CMS (WordPress, Joomla, Drupal, etc.)
 */
function detectCMS(html, $) {
  const htmlLower = html.toLowerCase();

  // WordPress
  if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) {
    const versionMatch = html.match(/wordpress\s*(\d+\.\d+(\.\d+)?)/i);
    const version = versionMatch ? versionMatch[1] : 'Desconocida';

    return {
      name: 'WordPress',
      version,
      isOutdated: version && parseFloat(version) < 6.0,
      confidence: 95
    };
  }

  // Wix
  if (htmlLower.includes('wix.com') || htmlLower.includes('wix-code') || htmlLower.includes('_wix')) {
    return {
      name: 'Wix',
      version: null,
      isPropretary: true,
      limitations: ['No ownership', 'Limited customization', 'SEO constraints'],
      confidence: 95
    };
  }

  // Shopify
  if (htmlLower.includes('shopify') || htmlLower.includes('cdn.shopify.com')) {
    return {
      name: 'Shopify',
      version: null,
      isEcommerce: true,
      confidence: 95
    };
  }

  // Squarespace
  if (htmlLower.includes('squarespace')) {
    return {
      name: 'Squarespace',
      version: null,
      isPropretary: true,
      confidence: 90
    };
  }

  // Joomla
  if (htmlLower.includes('joomla') || htmlLower.includes('/components/com_')) {
    return {
      name: 'Joomla',
      version: null,
      isOutdated: true,
      confidence: 90
    };
  }

  // Drupal
  if (htmlLower.includes('drupal') || $('meta[name="generator"]').attr('content')?.includes('Drupal')) {
    return {
      name: 'Drupal',
      version: null,
      confidence: 85
    };
  }

  // PrestaShop
  if (htmlLower.includes('prestashop')) {
    return {
      name: 'PrestaShop',
      version: null,
      isEcommerce: true,
      confidence: 90
    };
  }

  // Magento
  if (htmlLower.includes('magento') || htmlLower.includes('mage/')) {
    return {
      name: 'Magento',
      version: null,
      isEcommerce: true,
      confidence: 85
    };
  }

  // Webflow
  if (htmlLower.includes('webflow')) {
    return {
      name: 'Webflow',
      version: null,
      isPropretary: true,
      confidence: 90
    };
  }

  return null;
}

/**
 * Detectar Framework JavaScript
 */
function detectFramework(html, $) {
  const htmlLower = html.toLowerCase();

  // React
  if (htmlLower.includes('react') || $('[data-reactroot]').length > 0 || htmlLower.includes('_next')) {
    return { name: 'React', type: 'frontend', confidence: 85 };
  }

  // Next.js
  if (htmlLower.includes('_next') || htmlLower.includes('next.js')) {
    return { name: 'Next.js', type: 'fullstack', confidence: 90 };
  }

  // Vue.js
  if (htmlLower.includes('vue') || $('[data-v-]').length > 0) {
    return { name: 'Vue.js', type: 'frontend', confidence: 85 };
  }

  // Angular
  if (htmlLower.includes('angular') || $('[ng-app]').length > 0 || $('[ng-controller]').length > 0) {
    return { name: 'Angular', type: 'frontend', confidence: 85 };
  }

  // Nuxt.js
  if (htmlLower.includes('nuxt')) {
    return { name: 'Nuxt.js', type: 'fullstack', confidence: 90 };
  }

  // Svelte
  if (htmlLower.includes('svelte')) {
    return { name: 'Svelte', type: 'frontend', confidence: 80 };
  }

  // jQuery (antiguo)
  const jqueryMatch = html.match(/jquery[\/\-](\d+\.\d+)/i);
  if (jqueryMatch) {
    const version = jqueryMatch[1];
    return {
      name: 'jQuery',
      version,
      type: 'library',
      isOutdated: parseFloat(version) < 3.0,
      confidence: 95
    };
  }

  return null;
}

/**
 * Detectar Hosting
 */
function detectHosting(headers, html) {
  const server = headers['server'] || '';
  const htmlLower = html.toLowerCase();

  // Vercel
  if (headers['x-vercel-id'] || server.includes('vercel')) {
    return { provider: 'Vercel', type: 'modern', confidence: 95 };
  }

  // Netlify
  if (headers['x-nf-request-id'] || server.includes('netlify')) {
    return { provider: 'Netlify', type: 'modern', confidence: 95 };
  }

  // Cloudflare
  if (headers['cf-ray'] || server.includes('cloudflare')) {
    return { provider: 'Cloudflare', type: 'cdn', confidence: 90 };
  }

  // AWS
  if (server.includes('amazon') || headers['x-amz-cf-id']) {
    return { provider: 'AWS', type: 'cloud', confidence: 85 };
  }

  // GoDaddy
  if (htmlLower.includes('godaddy') || server.includes('godaddy')) {
    return { provider: 'GoDaddy', type: 'shared', quality: 'low', confidence: 80 };
  }

  // Hostinger
  if (htmlLower.includes('hostinger') || server.includes('hostinger')) {
    return { provider: 'Hostinger', type: 'shared', quality: 'low', confidence: 80 };
  }

  // SiteGround
  if (server.includes('siteground')) {
    return { provider: 'SiteGround', type: 'shared', quality: 'medium', confidence: 85 };
  }

  // Apache/Nginx
  if (server.includes('apache')) {
    return { provider: 'Apache', type: 'server', confidence: 60 };
  }
  if (server.includes('nginx')) {
    return { provider: 'Nginx', type: 'server', confidence: 60 };
  }

  return { provider: 'Unknown', confidence: 0 };
}

/**
 * Detectar Analytics
 */
function detectAnalytics(html) {
  const tools = [];

  if (html.includes('google-analytics') || html.includes('gtag')) {
    tools.push('Google Analytics');
  }
  if (html.includes('googletagmanager')) {
    tools.push('Google Tag Manager');
  }
  if (html.includes('facebook.com/tr') || html.includes('fbq')) {
    tools.push('Facebook Pixel');
  }
  if (html.includes('hotjar')) {
    tools.push('Hotjar');
  }
  if (html.includes('clarity.ms') || html.includes('microsoft.clarity')) {
    tools.push('Microsoft Clarity');
  }
  if (html.includes('matomo') || html.includes('piwik')) {
    tools.push('Matomo');
  }

  return tools.length > 0 ? tools : null;
}

/**
 * Detectar E-commerce
 */
function detectEcommerce(html, $) {
  const htmlLower = html.toLowerCase();

  if (htmlLower.includes('woocommerce')) {
    return { platform: 'WooCommerce', type: 'WordPress plugin' };
  }
  if (htmlLower.includes('shopify')) {
    return { platform: 'Shopify', type: 'SaaS' };
  }
  if (htmlLower.includes('prestashop')) {
    return { platform: 'PrestaShop', type: 'Self-hosted' };
  }
  if (htmlLower.includes('magento')) {
    return { platform: 'Magento', type: 'Self-hosted' };
  }

  // Detectar carrito genérico
  if ($('[data-cart]').length > 0 || htmlLower.includes('add-to-cart')) {
    return { platform: 'Custom', type: 'Custom build' };
  }

  return null;
}

/**
 * Detectar Email Marketing
 */
function detectEmailMarketing(html) {
  const tools = [];

  if (html.includes('mailchimp')) tools.push('Mailchimp');
  if (html.includes('sendinblue') || html.includes('brevo')) tools.push('Brevo (Sendinblue)');
  if (html.includes('klaviyo')) tools.push('Klaviyo');
  if (html.includes('activecampaign')) tools.push('ActiveCampaign');
  if (html.includes('hubspot')) tools.push('HubSpot');
  if (html.includes('convertkit')) tools.push('ConvertKit');

  return tools.length > 0 ? tools : null;
}

/**
 * Detectar Chat
 */
function detectChat(html) {
  const tools = [];

  if (html.includes('intercom')) tools.push('Intercom');
  if (html.includes('drift')) tools.push('Drift');
  if (html.includes('tawk.to')) tools.push('Tawk.to');
  if (html.includes('crisp')) tools.push('Crisp');
  if (html.includes('zendesk')) tools.push('Zendesk');
  if (html.includes('livechat')) tools.push('LiveChat');
  if (html.includes('tidio')) tools.push('Tidio');

  return tools.length > 0 ? tools : null;
}

/**
 * Detectar CDN
 */
function detectCDN(html, headers) {
  const cdns = [];

  if (html.includes('cloudflare')) cdns.push('Cloudflare');
  if (html.includes('cloudfront')) cdns.push('CloudFront');
  if (html.includes('jsdelivr')) cdns.push('jsDelivr');
  if (html.includes('unpkg')) cdns.push('UNPKG');
  if (html.includes('cdnjs')) cdns.push('CDNJS');

  return cdns.length > 0 ? cdns : null;
}

/**
 * Detectar Payment Gateway
 */
function detectPaymentGateway(html) {
  const gateways = [];

  if (html.includes('stripe')) gateways.push('Stripe');
  if (html.includes('paypal')) gateways.push('PayPal');
  if (html.includes('redsys')) gateways.push('Redsys');
  if (html.includes('square')) gateways.push('Square');
  if (html.includes('mercadopago')) gateways.push('MercadoPago');

  return gateways.length > 0 ? gateways : null;
}

/**
 * Detectar Security
 */
function detectSecurity(html, url) {
  return {
    hasSSL: url.startsWith('https://'),
    hasCaptcha: html.includes('recaptcha') || html.includes('hcaptcha'),
    hasSecurityHeaders: false // Se podría mejorar analizando headers
  };
}

/**
 * Detectar Performance Tools
 */
function detectPerformance(html) {
  const tools = [];

  if (html.includes('wp-rocket')) tools.push('WP Rocket');
  if (html.includes('w3-total-cache')) tools.push('W3 Total Cache');
  if (html.includes('autoptimize')) tools.push('Autoptimize');

  return tools.length > 0 ? tools : null;
}

/**
 * Detectar Social Widgets
 */
function detectSocialWidgets(html, $) {
  const widgets = [];

  if (html.includes('addthis')) widgets.push('AddThis');
  if (html.includes('sharethis')) widgets.push('ShareThis');
  if ($('[class*="fb-"]').length > 0) widgets.push('Facebook Widget');
  if ($('[class*="twitter-"]').length > 0) widgets.push('Twitter Widget');

  return widgets.length > 0 ? widgets : null;
}

/**
 * Detectar WordPress Plugins
 */
function detectPlugins(html, $) {
  const plugins = [];

  if (html.includes('elementor')) plugins.push('Elementor');
  if (html.includes('yoast')) plugins.push('Yoast SEO');
  if (html.includes('contact-form-7')) plugins.push('Contact Form 7');
  if (html.includes('wpforms')) plugins.push('WPForms');
  if (html.includes('gravityforms')) plugins.push('Gravity Forms');

  return plugins.length > 0 ? plugins : null;
}

/**
 * Detectar tecnologías obsoletas
 */
function detectObsoleteTech(techStack, html) {
  const obsolete = [];

  // CMS obsoleto
  if (techStack.cms?.name === 'Joomla') {
    obsolete.push({
      tech: 'Joomla',
      reason: 'CMS obsoleto, difícil de mantener',
      severity: 'high',
      recommendation: 'Migrar a WordPress o framework moderno'
    });
  }

  // jQuery antiguo
  if (techStack.framework?.name === 'jQuery' && techStack.framework.isOutdated) {
    obsolete.push({
      tech: `jQuery ${techStack.framework.version}`,
      reason: 'Versión muy antigua de jQuery',
      severity: 'medium',
      recommendation: 'Actualizar a jQuery 3.x o migrar a framework moderno'
    });
  }

  // WordPress antiguo
  if (techStack.cms?.name === 'WordPress' && techStack.cms.isOutdated) {
    obsolete.push({
      tech: `WordPress ${techStack.cms.version}`,
      reason: 'Versión antigua con vulnerabilidades de seguridad',
      severity: 'high',
      recommendation: 'Actualizar inmediatamente a WordPress 6.x'
    });
  }

  // Diseño con tablas
  if (html.includes('<table') && html.includes('layout')) {
    obsolete.push({
      tech: 'Table Layout',
      reason: 'Diseño con tablas (años 90)',
      severity: 'high',
      recommendation: 'Rediseño completo con CSS moderno'
    });
  }

  // Frames
  if (html.includes('<frame') || html.includes('<frameset')) {
    obsolete.push({
      tech: 'Frames',
      reason: 'Tecnología obsoleta de los años 90',
      severity: 'critical',
      recommendation: 'Rediseño completo urgente'
    });
  }

  return obsolete;
}

/**
 * Generar recomendaciones personalizadas
 */
function generateRecommendations(techStack) {
  const recommendations = [];

  // Sin analytics
  if (!techStack.analytics) {
    recommendations.push({
      type: 'analytics',
      priority: 'high',
      message: 'No tiene Google Analytics instalado',
      action: 'Implementar Google Analytics 4 o Microsoft Clarity (gratis)'
    });
  }

  // Sin chat
  if (!techStack.chat) {
    recommendations.push({
      type: 'chat',
      priority: 'medium',
      message: 'No tiene chat en vivo',
      action: 'Instalar Tawk.to o Tidio (gratis)'
    });
  }

  // Sin SSL
  if (!techStack.security?.hasSSL) {
    recommendations.push({
      type: 'security',
      priority: 'critical',
      message: 'No tiene certificado SSL',
      action: 'Instalar Let\'s Encrypt SSL (gratis)'
    });
  }

  // Wix/Squarespace
  if (techStack.cms?.isPropretary) {
    recommendations.push({
      type: 'cms',
      priority: 'high',
      message: `Usa ${techStack.cms.name} (plataforma propietaria)`,
      action: 'Migrar a WordPress o sitio custom para mayor control'
    });
  }

  // Hosting barato
  if (techStack.hosting?.quality === 'low') {
    recommendations.push({
      type: 'hosting',
      priority: 'medium',
      message: `Hosting de baja calidad (${techStack.hosting.provider})`,
      action: 'Migrar a hosting premium (SiteGround, Cloudways)'
    });
  }

  return recommendations;
}
