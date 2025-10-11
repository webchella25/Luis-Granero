// src/lib/scraper/emailFinder.js - NUEVO ARCHIVO
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function findContactEmails(website, businessName) {
  const emails = new Set();
  
  try {
    const baseUrl = website.startsWith('http') ? website : `https://${website}`;
    const domain = new URL(baseUrl).hostname.replace('www.', '');
    
    console.log(`🔍 Buscando emails para ${businessName}...`);
    
    // 1. Lista de páginas donde buscar
    const pagesToSearch = [
      baseUrl,
      `${baseUrl}/contacto`,
      `${baseUrl}/contact`,
      `${baseUrl}/contact-us`,
      `${baseUrl}/sobre-nosotros`,
      `${baseUrl}/about`,
      `${baseUrl}/about-us`,
      `${baseUrl}/quienes-somos`,
    ];
    
    // 2. Scraping de cada página
    for (const url of pagesToSearch) {
      try {
        const { data } = await axios.get(url, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // Regex para encontrar emails
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const foundEmails = data.match(emailRegex);
        
        if (foundEmails) {
          foundEmails.forEach(email => {
            // Filtrar emails no deseados
            const invalidDomains = [
              'example.com', 'sentry.io', 'gravatar.com', 
              'schema.org', 'w3.org', 'google.com',
              'facebook.com', 'twitter.com', 'instagram.com'
            ];
            
            const isInvalid = invalidDomains.some(invalid => email.includes(invalid));
            
            if (!isInvalid) {
              emails.add(email.toLowerCase().trim());
            }
          });
        }
        
        console.log(`✅ Escaneado: ${url} - ${emails.size} emails encontrados`);
      } catch (err) {
        console.log(`⚠️ No se pudo acceder a: ${url}`);
      }
    }
    
    // 3. Generar emails probables basados en el dominio
    const probableEmails = [
      `info@${domain}`,
      `contacto@${domain}`,
      `hola@${domain}`,
      `ventas@${domain}`,
      `comercial@${domain}`,
      `contact@${domain}`,
      `hello@${domain}`,
      `sales@${domain}`,
      `admin@${domain}`,
    ];
    
    probableEmails.forEach(email => emails.add(email));
    
    console.log(`📧 Total emails encontrados: ${emails.size}`);
    
    return Array.from(emails);
    
  } catch (error) {
    console.error('Error finding emails:', error.message);
    return [];
  }
}

export async function findSocialMedia(website) {
  try {
    const baseUrl = website.startsWith('http') ? website : `https://${website}`;
    const { data } = await axios.get(baseUrl, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    const socialMedia = {
      instagram: null,
      facebook: null,
      twitter: null,
      linkedin: null,
      youtube: null
    };
    
    // Buscar links de redes sociales
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      if (href.includes('instagram.com') && !socialMedia.instagram) {
        socialMedia.instagram = href;
      }
      if (href.includes('facebook.com') && !socialMedia.facebook) {
        socialMedia.facebook = href;
      }
      if ((href.includes('twitter.com') || href.includes('x.com')) && !socialMedia.twitter) {
        socialMedia.twitter = href;
      }
      if (href.includes('linkedin.com') && !socialMedia.linkedin) {
        socialMedia.linkedin = href;
      }
      if (href.includes('youtube.com') && !socialMedia.youtube) {
        socialMedia.youtube = href;
      }
    });
    
    console.log('🔗 Redes sociales encontradas:', socialMedia);
    
    return socialMedia;
    
  } catch (error) {
    console.error('Error finding social media:', error.message);
    return {};
  }
}