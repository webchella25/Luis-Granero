// lib/analyzers/websiteAnalyzer.ts

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
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  console.log(`🔍 Analizando: ${url}`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    const loadTime = Date.now() - startTime;
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Inicializar análisis
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
      issues.push('Sin certificado SSL (HTTP)');
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
      // Detectar si es muy antiguo
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
    
// 7. Buscar emails en el HTML
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const foundEmails: string[] = html.match(emailRegex) || [];
const uniqueEmails: string[] = [...new Set(foundEmails)];

// Filtrar emails basura
const validEmails = uniqueEmails.filter((email) => 
  !email.includes('example.com') &&
  !email.includes('domain.com') &&
  !email.includes('sentry') &&
  !email.includes('wixpress')
);

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

// Función para adivinar emails comunes
export function guessBusinessEmails(businessName: string, website: string): string[] {
  if (!website) return [];
  
  const domain = website
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .split('/')[0]
    .toLowerCase();
  
  const commonPatterns = [
    `info@${domain}`,
    `contacto@${domain}`,
    `hola@${domain}`,
    `ventas@${domain}`,
    `comercial@${domain}`,
    `administracion@${domain}`
  ];
  
  return commonPatterns;
}