// src/lib/scrapers/googleMapsScraper.ts jjhj
import axios from 'axios';

export interface BusinessLead {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  placeId: string | null;
}

export async function scrapeGoogleMaps(
  query: string,
  location: string,
  maxResults: number = 20
): Promise<BusinessLead[]> {
  
  console.log(`🔍 Buscando con SerpAPI: "${query}" en "${location}"`);
  
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        q: `${query} ${location}`,
        type: 'search',
        api_key: process.env.SERPAPI_KEY,
        num: Math.min(maxResults, 20), // SerpAPI máximo 20 por request
        hl: 'es', // Idioma español
        gl: 'es'  // Geolocalización España
      },
      timeout: 15000
    });

    if (!response.data.local_results) {
      console.log('⚠️ No se encontraron resultados');
      return [];
    }

    const businesses: BusinessLead[] = response.data.local_results.map((result: any) => ({
      name: result.title || null,
      address: result.address || null,
      phone: result.phone || null,
      website: result.website || null,
      rating: result.rating || null,
      reviewCount: result.reviews || null,
      category: result.type || null,
      placeId: result.place_id || null
    }));

    console.log(`✅ SerpAPI encontró ${businesses.length} negocios`);
    return businesses;

  } catch (error: any) {
    console.error('❌ Error en SerpAPI:', error.message);
    
    if (error.response?.status === 401) {
      throw new Error('API Key de SerpAPI inválida. Verifica SERPAPI_KEY en variables de entorno.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Límite de búsquedas alcanzado. SerpAPI Free: 100 búsquedas/mes.');
    }
    
    throw new Error(`Error buscando en Google Maps: ${error.message}`);
  }
}

// Función auxiliar para obtener más detalles de un negocio específico
export async function getBusinessDetails(placeId: string) {
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        type: 'place',
        place_id: placeId,
        api_key: process.env.SERPAPI_KEY,
        hl: 'es'
      },
      timeout: 10000
    });

    return response.data;
  } catch (error: any) {
    console.error('Error obteniendo detalles:', error.message);
    return null;
  }
}