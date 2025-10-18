import axios from 'axios';
import * as cheerio from 'cheerio';

// Buscar emails con Hunter.io
export async function findEmailsWithHunter(domain) {
  const API_KEY = process.env.HUNTER_IO_API_KEY;
  
  if (!API_KEY) {
    console.warn('⚠️ HUNTER_IO_API_KEY no configurada');
    return [];
  }
  
  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${API_KEY}&limit=5`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.emails) {
      const emails = data.data.emails
        .filter(e => e.type === 'personal' && e.confidence > 50)
        .map(e => e.value)
        .slice(0, 3);
      
      console.log(`📧 Hunter.io encontró ${emails.length} emails para ${domain}`);
      return emails;
    }
    
    return [];
    
  } catch (error) {
    console.error('Error en Hunter.io:', error);
    return [];
  }
}

// Buscar emails directamente en la web
export async function findEmailsInWebsite(website) {
  try {
    const response = await fetch(website, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await response.text();
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const foundEmails = html.match(emailRegex) || [];
    
    const invalidDomains = [
      'example.com', 'sentry.io', 'gravatar.com', 
      'schema.org', 'w3.org', 'google.com',
      'facebook.com', 'twitter.com', 'instagram.com'
    ];
    
    const validEmails = foundEmails
      .filter(email => !invalidDomains.some(invalid => email.includes(invalid)))
      .map(e => e.toLowerCase().trim())
      .slice(0, 5);
    
    return [...new Set(validEmails)];
    
  } catch (error) {
    console.error('Error buscando emails en website:', error);
    return [];
  }
}

// Combinar ambos métodos
export async function findAllEmails(website, domain) {
  const emails = new Set();
  
  const hunterEmails = await findEmailsWithHunter(domain);
  hunterEmails.forEach(e => emails.add(e));
  
  const webEmails = await findEmailsInWebsite(website);
  webEmails.forEach(e => emails.add(e));
  
  return Array.from(emails);
}

// Función original para contacto
export async function findContactEmails(website, businessName) {
  const emails = new Set();
  
  try {
    const baseUrl = website.startsWith('http') ? website : `https://${website}`;
    const domain = new URL(baseUrl).hostname.replace('www.', '');
    
    console.log(`🔍 Buscando emails para ${businessName}...`);
    
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
    
    for (const url of pagesToSearch) {
      try {
        const { data } = await axios.get(url, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const foundEmails = data.match(emailRegex);
        
        if (foundEmails) {
          foundEmails.forEach(email => {
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