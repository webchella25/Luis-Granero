import axios from 'axios';

export async function scrapeGoogleSearch(query, numResults = 20) {
  const API_KEY = process.env.SERPAPI_KEY;
  
  if (!API_KEY) {
    throw new Error('SERPAPI_KEY no configurada');
  }

  console.log(`🔍 Buscando en Google con SerpAPI: "${query}"`);
  
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: query,
        num: numResults,
        hl: 'es',
        gl: 'es',
        api_key: API_KEY
      },
      timeout: 15000
    });

    console.log(`✅ SerpAPI response recibida`);

    if (!response.data.organic_results) {
      console.log('⚠️ No se encontraron resultados');
      return [];
    }

    const results = response.data.organic_results.map((result, index) => {
      // Extraer dominio
      const domain = extractDomain(result.link);
      
      // Buscar rating en el snippet
      const snippet = result.snippet || '';
      const ratingMatch = snippet.match(/(\d+[,.]?\d*)\s*★|★\s*(\d+[,.]?\d*)/i);
      const rating = ratingMatch ? parseFloat((ratingMatch[1] || ratingMatch[2]).replace(',', '.')) : null;
      
      // Buscar review count
      const reviewMatch = snippet.match(/(\d+)\s*(?:reseñas?|opiniones?|reviews?|valoraciones?)/i);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : null;
      
      // Buscar ubicación
      const locationMatch = snippet.match(/([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*),?\s*España/i);
      const location = locationMatch ? locationMatch[1] : null;
      
      return {
        name: result.title,
        website: result.link,
        domain: domain,
        description: snippet,
        seoPosition: result.position || (index + 1),
        rating: rating,
        reviewCount: reviewCount,
        location: location,
        searchQuery: query,
        source: 'google_search',
        foundAt: new Date()
      };
    });

    console.log(`✅ ${results.length} resultados encontrados`);
    return results;

  } catch (error) {
    console.error('❌ Error en SerpAPI:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('API Key de SerpAPI inválida');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Límite de búsquedas alcanzado en SerpAPI');
    }
    
    throw new Error(`Error buscando en Google: ${error.message}`);
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