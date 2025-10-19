import { ApifyClient } from 'apify-client';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`📸 Iniciando búsqueda en Instagram: #${hashtag}`);
  
  try {
    // Inicializar cliente de Apify
    const client = new ApifyClient({ token: API_TOKEN });
    
    // Configuración del input
    const input = {
      directUrls: [`https://www.instagram.com/explore/tags/${hashtag}/`],
      resultsType: 'posts',
      resultsLimit: maxResults,
      searchType: 'hashtag',
      searchLimit: maxResults
    };
    
    console.log('📝 Input configurado:', input);
    
    // Iniciar el Actor y esperar a que termine
    console.log('🚀 Iniciando Actor de Instagram...');
    
    const run = await client.actor('apify/instagram-scraper').call(input, {
      waitSecs: 120 // Esperar máximo 2 minutos
    });
    
    console.log(`✅ Actor finalizado con status: ${run.status}`);
    
    if (run.status !== 'SUCCEEDED') {
      throw new Error(`Actor falló con status: ${run.status}`);
    }
    
    // Obtener resultados del dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`📊 ${items.length} items obtenidos del dataset`);
    
    if (items.length === 0) {
      console.warn('⚠️ No se encontraron resultados');
      return [];
    }
    
    // Mostrar estructura del primer item
    console.log('📝 Estructura del primer item:', JSON.stringify(items[0], null, 2));
    
    // Procesar resultados
    const profilesMap = new Map();
    
    items.forEach((item, index) => {
      // Intentar extraer username de diferentes campos
      const username = item.ownerUsername || 
                      item.owner?.username || 
                      item.shortCode;
      
      if (!username) {
        console.log(`⚠️ Item ${index} sin username:`, item);
        return;
      }
      
      if (profilesMap.has(username)) {
        return; // Ya tenemos este perfil
      }
      
      const profile = {
        name: item.ownerFullName || item.alt || username,
        username: username,
        website: null,
        bio: item.caption || '',
        followers: 0,
        posts: 0,
        isVerified: false,
        profilePicUrl: item.displayUrl || item.thumbnailSrc || null,
        category: null,
        source: 'instagram',
        searchQuery: hashtag,
        opportunityScore: calculateInstagramScore({ username, caption: item.caption })
      };
      
      profilesMap.set(username, profile);
      console.log(`✅ Perfil añadido: @${username}`);
    });
    
    const leads = Array.from(profilesMap.values());
    console.log(`🎯 Total perfiles únicos: ${leads.length}`);
    
    return leads;
    
  } catch (error) {
    console.error('❌ Error en Instagram scraping:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

function calculateInstagramScore(profile) {
  let score = 70; // Base score alto (sin web = oportunidad)
  
  // Si tiene caption larga = más profesional
  if (profile.caption && profile.caption.length > 100) {
    score += 10;
  }
  
  return Math.min(100, score);
}