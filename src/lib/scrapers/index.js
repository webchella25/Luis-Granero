// src/lib/scraper/index.js - ACTUALIZAR la función analyzeWebsite
import axios from 'axios';
import * as cheerio from 'cheerio';
import { findContactEmails, findSocialMedia } from './emailFinder.js';

export async function analyzeWebsite(url) {
  try {
    const startTime = Date.now();
    
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const loadTime = Date.now() - startTime;
    const $ = cheerio.load(response.data);
    
    // Análisis básico
    const hasMobile = $('meta[name="viewport"]').length > 0;
    const hasSSL = url.startsWith('https://');
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Encontrar emails y redes sociales - NUEVO
    const emails = await findContactEmails(url, title);
    const socialMedia = await findSocialMedia(url);
    
    // Detectar tecnologías
    let technology = 'Unknown';
    const html = response.data.toLowerCase();
    
    if (html.includes('wordpress') || html.includes('wp-content')) {
      technology = 'WordPress';
    } else if (html.includes('next.js') || html.includes('_next')) {
      technology = 'Next.js';
    } else if (html.includes('react')) {
      technology = 'React';
    } else if (html.includes('wix.com')) {
      technology = 'Wix';
    } else if (html.includes('shopify')) {
      technology = 'Shopify';
    }
    
    // Calcular issues
    const issues = [];
    if (loadTime > 3000) issues.push('Carga lenta (>3s)');
    if (!hasMobile) issues.push('No responsive');
    if (!hasSSL) issues.push('Sin certificado SSL');
    if (!description) issues.push('Sin meta description');
    if (emails.length === 0) issues.push('No se encontró email de contacto');
    
    // Calcular score
    let score = 100;
    if (loadTime > 3000) score -= 20;
    if (loadTime > 5000) score -= 10;
    if (!hasMobile) score -= 25;
    if (!hasSSL) score -= 30;
    if (!description) score -= 10;
    if (emails.length === 0) score -= 5;
    
    return {
      score: Math.max(score, 0),
      loadTime,
      issues,
      hasMobile,
      hasSSL,
      technology,
      hasEmail: emails.length > 0,
      emails,
      socialMedia,
      title,
      description
    };
    
  } catch (error) {
    console.error('Error analyzing website:', error.message);
    return {
      score: 0,
      loadTime: 0,
      issues: ['No se pudo analizar la web'],
      hasMobile: false,
      hasSSL: false,
      technology: 'Unknown',
      hasEmail: false,
      emails: [],
      socialMedia: {}
    };
  }
}