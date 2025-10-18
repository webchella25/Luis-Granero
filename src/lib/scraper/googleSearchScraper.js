import * as cheerio from 'cheerio';

export async function scrapeGoogleSearch(query, numResults = 20) {
  const API_KEY = process.env.SCRAPERAPI_KEY;
  
  if (!API_KEY) {
    throw new Error('SCRAPERAPI_KEY no configurada en .env.local');
  }

  console.log(`🔍 Buscando en Google: "${query}"`);
  
  // Construir URL de Google Search
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}&hl=es&gl=es`;
  
  // URL de ScraperAPI
  const scraperUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(googleUrl)}&render=true&country_code=es`;
  
  try {
    const response = await fetch(scraperUrl);
    
    if (!response.ok) {
      throw new Error(`ScraperAPI error: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = [];
    let position = 1;
    
    // Seleccionar resultados orgánicos
    $('.g, .Gx5Zad').each((i, elem) => {
      try {
        const $elem = $(elem);
        
        // Título
        const title = $elem.find('h3').first().text().trim();
        if (!title) return; // Skip si no hay título
        
        // URL
        let url = $elem.find('a').first().attr('href');
        if (!url || url.startsWith('/search')) return; // Skip URLs internas de Google
        
        // Limpiar URL
        if (url.startsWith('/url?q=')) {
          url = url.split('/url?q=')[1].split('&')[0];
        }
        url = decodeURIComponent(url);
        
        // Snippet/Descripción
        const snippet = $elem.find('.VwiC3b, .yXK7lf, .s, .st').first().text().trim();
        
        // Extraer dominio
        const domain = extractDomain(url);
        
        // Rating (si aparece en snippet)
        const ratingMatch = snippet.match(/(\d+[,.]?\d*)\s*★|★\s*(\d+[,.]?\d*)|Rating:\s*(\d+[,.]?\d*)/i);
        const rating = ratingMatch ? parseFloat((ratingMatch[1] || ratingMatch[2] || ratingMatch[3]).replace(',', '.')) : null;
        
        // Review count (si aparece)
        const reviewMatch = snippet.match(/(\d+)\s*(?:reseñas?|opiniones?|reviews?|valoraciones?)/i);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null;
        
        // Ubicación (si aparece)
        const locationMatch = snippet.match(/(?:en|·)\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*),?\s*España/i);
        const location = locationMatch ? locationMatch[1] : null;
        
        results.push({
          name: title,
          website: url,
          domain: domain,
          description: snippet || '',
          seoPosition: position,
          rating: rating,
          reviewCount: reviewCount,
          location: location,
          searchQuery: query,
          source: 'google_search',
          foundAt: new Date()
        });
        
        position++;
        
      } catch (err) {
        console.error('Error parseando resultado:', err);
      }
    });
    
    console.log(`✅ ${results.length} resultados encontrados`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error en Google Search scraping:', error);
    throw error;
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Calcular score específico para Google Search
export function calculateSearchScore(lead) {
  let score = 0;
  
  // Posición en Google es MUY importante
  if (lead.seoPosition <= 3) {
    score += 30; // Top 3 = empresa que invierte en marketing
  } else if (lead.seoPosition <= 5) {
    score += 25;
  } else if (lead.seoPosition <= 10) {
    score += 20; // Primera página
  } else if (lead.seoPosition <= 20) {
    score += 10; // Segunda página
  }
  
  // Tiene website
  if (lead.website) {
    score += 40;
  }
  
  // Rating alto
  if (lead.rating) {
    if (lead.rating >= 4.5) score += 20;
    else if (lead.rating >= 4.0) score += 15;
    else if (lead.rating >= 3.5) score += 10;
  }
  
  // Muchas reviews = negocio establecido
  if (lead.reviewCount) {
    if (lead.reviewCount > 100) score += 15;
    else if (lead.reviewCount > 50) score += 10;
    else if (lead.reviewCount > 20) score += 5;
  }
  
  // Descripción completa
  if (lead.description && lead.description.length > 100) {
    score += 10;
  }
  
  // Ubicación conocida
  if (lead.location) {
    score += 5;
  }
  
  return Math.min(score, 100);
}