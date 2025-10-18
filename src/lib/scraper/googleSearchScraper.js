import * as cheerio from 'cheerio';

export async function scrapeGoogleSearch(query, numResults = 20) {
  const API_KEY = process.env.SCRAPERAPI_KEY;
  
  if (!API_KEY) {
    throw new Error('SCRAPERAPI_KEY no configurada');
  }

  console.log(`🔍 Buscando en Google: "${query}"`);
  
  // URL de Google Search
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}&hl=es&gl=es`;
  
  // URL de ScraperAPI - IMPORTANTE: usa HTTPS no HTTP
  const scraperUrl = `https://api.scraperapi.com/?api_key=${API_KEY}&url=${encodeURIComponent(googleUrl)}`;
  
  console.log(`🔑 Llamando a ScraperAPI...`);
  
  try {
    const response = await fetch(scraperUrl);
    
    console.log(`📊 ScraperAPI Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ScraperAPI Error: ${errorText}`);
      throw new Error(`ScraperAPI error: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`✅ HTML recibido: ${html.length} caracteres`);
    
    const $ = cheerio.load(html);
    
    const results = [];
    let position = 1;
    
    // Seleccionar resultados orgánicos de Google
    $('.g').each((i, elem) => {
      try {
        const $elem = $(elem);
        
        // Título
        const title = $elem.find('h3').first().text().trim();
        if (!title) return;
        
        // URL
        let url = $elem.find('a').first().attr('href');
        if (!url || url.startsWith('/search')) return;
        
        // Limpiar URL si viene con /url?q=
        if (url.startsWith('/url?q=')) {
          url = url.split('/url?q=')[1].split('&')[0];
        }
        url = decodeURIComponent(url);
        
        // Snippet/Descripción
        const snippet = $elem.find('.VwiC3b, .yXK7lf, .IsZvec').first().text().trim();
        
        // Extraer dominio
        const domain = extractDomain(url);
        
        // Rating (si aparece)
        const ratingMatch = snippet.match(/(\d+[,.]?\d*)\s*★|★\s*(\d+[,.]?\d*)/i);
        const rating = ratingMatch ? parseFloat((ratingMatch[1] || ratingMatch[2]).replace(',', '.')) : null;
        
        // Review count
        const reviewMatch = snippet.match(/(\d+)\s*(?:reseñas?|opiniones?|reviews?|valoraciones?)/i);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null;
        
        // Ubicación
        const locationMatch = snippet.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*),?\s*España/i);
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

export function calculateSearchScore(lead) {
  let score = 0;
  
  if (lead.seoPosition <= 3) score += 30;
  else if (lead.seoPosition <= 5) score += 25;
  else if (lead.seoPosition <= 10) score += 20;
  else if (lead.seoPosition <= 20) score += 10;
  
  if (lead.website) score += 40;
  
  if (lead.rating) {
    if (lead.rating >= 4.5) score += 20;
    else if (lead.rating >= 4.0) score += 15;
    else if (lead.rating >= 3.5) score += 10;
  }
  
  if (lead.reviewCount) {
    if (lead.reviewCount > 100) score += 15;
    else if (lead.reviewCount > 50) score += 10;
    else if (lead.reviewCount > 20) score += 5;
  }
  
  if (lead.description && lead.description.length > 100) score += 10;
  if (lead.location) score += 5;
  
  return Math.min(score, 100);
}