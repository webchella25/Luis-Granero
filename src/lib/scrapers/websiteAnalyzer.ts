// src/lib/scrapers/websiteAnalyzer.ts - VERSIÓN COMPLETA
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface WebAnalysis {
  score: number;
  loadTime: number;
  issues: string[];
  hasMobile: boolean;
  hasSSL: boolean;
  technology: string;
  hasEmail: boolean;
  emails: string[];
}

export async function analyzeWebsite(url: string): Promise<WebAnalysis | null> {
  if (!url) return null;
  
  // Normalizar URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  if (url.startsWith('http://')) {
    const httpsUrl = url.replace('http://', 'https://');
    try {
      await axios.head(httpsUrl, { timeout: 3000, maxRedirects: 5 });
      url = httpsUrl;
    } catch {
      console.log(`  ℹ️ ${url} no soporta HTTPS, usando HTTP`);
    }
  }
  
  console.log(`🔍 Analizando: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const loadTime = Date.now() - startTime;
    const html = response.data;
    const $ = cheerio.load(html);
    
    let score = 100;
    const issues: string[] = [];
    
    // 1. Velocidad de carga
    if (loadTime > 5000) {
      issues.push(`Muy lenta (${(loadTime / 1000).toFixed(1)}s)`);
      score -= 30;
    } else if (loadTime > 3000) {
      issues.push(`Lenta (${(loadTime / 1000).toFixed(1)}s)`);
      score -= 20;
    }
    
    // 2. Mobile responsive
    const hasMobile = $('meta[name="viewport"]').length > 0;
    if (!hasMobile) {
      issues.push('No adaptada a móviles');
      score -= 25;
    }
    
    // 3. SSL/HTTPS
    const hasSSL = url.startsWith('https://');
    if (!hasSSL) {
      issues.push('Sin certificado SSL');
      score -= 20;
    }
    
    // 4. SEO básico
    const title = $('title').text().trim();
    if (!title || title.length < 10) {
      issues.push('Sin título SEO o muy corto');
      score -= 15;
    }
    
    const metaDescription = $('meta[name="description"]').attr('content');
    if (!metaDescription || metaDescription.length < 50) {
      issues.push('Sin meta description');
      score -= 10;
    }
    
    // 5. Detectar tecnología
    const htmlLower = html.toLowerCase();
    let technology = 'Desconocido';
    
    if (htmlLower.includes('wordpress') || htmlLower.includes('wp-content')) {
      technology = 'WordPress';
      if (htmlLower.includes('jquery/1.') || htmlLower.includes('jquery/2.')) {
        issues.push('WordPress con jQuery antiguo');
        score -= 10;
      }
    } else if (htmlLower.includes('wix.com') || htmlLower.includes('wix-code')) {
      technology = 'Wix';
    } else if (htmlLower.includes('squarespace')) {
      technology = 'Squarespace';
    } else if (htmlLower.includes('shopify')) {
      technology = 'Shopify';
    } else if (htmlLower.includes('joomla')) {
      technology = 'Joomla';
      issues.push('Joomla (CMS obsoleto)');
      score -= 15;
    }
    
    // 6. Diseño obsoleto
    if (html.includes('<table') && html.includes('layout')) {
      issues.push('Diseño con tablas (muy antiguo)');
      score -= 25;
    }
    
    if (html.includes('<frame') || html.includes('<frameset')) {
      issues.push('Usa frames (obsoleto años 90)');
      score -= 30;
    }
    
    // 7. Buscar emails en el HTML - CON FILTROS
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails: string[] = html.match(emailRegex) || [];
    const uniqueEmails: string[] = [...new Set(foundEmails)];

    // Lista de dominios inválidos
    const INVALID_DOMAINS = [
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'linkedin.com',
      'youtube.com',
      'tiktok.com',
      'example.com',
      'domain.com',
      'test.com',
      'sentry.io',
      'wixpress.com',
      'schema.org',
      'w3.org',
      'googleapis.com',
      'gravatar.com'
    ];

    // Filtrar emails válidos
    const validEmails = uniqueEmails.filter((email) => {
      const domain = email.split('@')[1]?.toLowerCase() || '';
      return !INVALID_DOMAINS.some(invalid => domain.includes(invalid));
    });

    return {
      score: Math.max(0, score),
      loadTime,
      issues,
      hasMobile,
      hasSSL,
      technology,
      hasEmail: validEmails.length > 0,
      emails: validEmails.slice(0, 3)
    };
    
  } catch (error: any) {
    console.error(`❌ Error analizando ${url}:`, error.message);
    
    return {
      score: 0,
      loadTime: 0,
      issues: ['Web inaccesible o caída'],
      hasMobile: false,
      hasSSL: false,
      technology: 'Error',
      hasEmail: false,
      emails: []
    };
  }
}

// Función para adivinar emails comunes - CON FILTROS
export function guessBusinessEmails(businessName: string, website: string): string[] {
  if (!website) return [];
  
  // Lista de dominios a excluir
  const INVALID_DOMAINS = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'youtube.com',
    'tiktok.com',
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'example.com',
    'test.com',
    'wix.com',
    'wordpress.com',
    'blogspot.com',
    'weebly.com',
    'squarespace.com'
  ];
  
  try {
    const domain = website
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('/')[0]
      .toLowerCase();
    
    // Verificar si el dominio está en la lista de inválidos
    const isInvalidDomain = INVALID_DOMAINS.some(invalid => domain.includes(invalid));
    
    if (isInvalidDomain) {
      console.log(`⚠️ Dominio excluido: ${domain}`);
      return [];
    }

    const commonPatterns = [
      `info@${domain}`,
      `contacto@${domain}`,
      `hola@${domain}`,
      `ventas@${domain}`,
      `comercial@${domain}`,
      `administracion@${domain}`
    ];
    
    return commonPatterns;
  } catch (error) {
    return [];
  }
}