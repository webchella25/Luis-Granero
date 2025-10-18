import axios from 'axios';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`📸 Buscando en Instagram: #${hashtag}`);
  
  try {
    // Iniciar scraping
    const runResponse = await axios.post(
      'https://api.apify.com/v2/acts/apify~instagram-scraper/runs',
      {
        hashtags: [hashtag],
        resultsLimit: maxResults,
        searchType: 'hashtag'
      },
      {
        params: { token: API_TOKEN },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const runId = runResponse.data.data.id;
    console.log(`⏳ Run ID: ${runId} - Esperando resultados...`);

    // Esperar a que termine (polling)
    let results = null;
    let attempts = 0;
    
    while (attempts < 30) { // Max 30 intentos (60 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s
      
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { params: { token: API_TOKEN } }
      );
      
      const status = statusResponse.data.data.status;
      
      if (status === 'SUCCEEDED') {
        // Obtener resultados
        const dataResponse = await axios.get(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
          { params: { token: API_TOKEN } }
        );
        
        results = dataResponse.data;
        break;
      } else if (status === 'FAILED') {
        throw new Error('Apify run failed');
      }
      
      attempts++;
    }

    if (!results) {
      throw new Error('Timeout esperando resultados de Apify');
    }

    console.log(`✅ ${results.length} perfiles encontrados`);

    // Procesar resultados
    const leads = results.map(profile => ({
      name: profile.fullName || profile.username,
      username: profile.username,
      website: profile.externalUrl || null,
      bio: profile.biography || '',
      followers: profile.followersCount || 0,
      posts: profile.postsCount || 0,
      isVerified: profile.verified || false,
      profilePicUrl: profile.profilePicUrl || null,
      category: profile.category || null,
      source: 'instagram',
      searchQuery: hashtag,
      
      // Calcular opportunity score
      opportunityScore: calculateInstagramScore(profile)
    }));

    return leads;

  } catch (error) {
    console.error('❌ Error en Instagram scraping:', error.message);
    throw error;
  }
}

function calculateInstagramScore(profile) {
  let score = 0;
  
  // Sin link en bio = ALTA oportunidad (necesita web)
  if (!profile.externalUrl) score += 40;
  
  // Pocos posts = negocio nuevo o descuidado
  if (profile.postsCount < 50) score += 20;
  else if (profile.postsCount < 100) score += 10;
  
  // Buenos seguidores = negocio establecido
  if (profile.followersCount > 1000 && profile.followersCount < 10000) {
    score += 20; // Sweet spot: tiene clientes pero aún es pequeño
  } else if (profile.followersCount > 10000) {
    score += 10; // Ya es grande, menos probabilidad
  }
  
  // Categoría de negocio
  if (profile.category && profile.category.includes('Business')) {
    score += 15;
  }
  
  // Bio completa = más profesional
  if (profile.biography && profile.biography.length > 50) {
    score += 5;
  }
  
  return Math.min(score, 100);
}

export async function scrapeInstagramLocation(locationId, maxResults = 20) {
  // Similar al de hashtag pero con location
  // Lo implementamos si lo necesitas
}