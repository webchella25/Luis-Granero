import axios from 'axios';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  console.log('🔍 Instagram Scraper iniciado');
  console.log('📌 Hashtag:', hashtag);
  console.log('🔢 Max results:', maxResults);
  console.log('🔑 API Token exists:', !!API_TOKEN);
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada en variables de entorno');
  }

  console.log(`📸 Buscando en Instagram: #${hashtag}`);
  
  try {
    // Iniciar scraping
    console.log('🚀 Iniciando run en Apify...');
    
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
    
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { params: { token: API_TOKEN } }
      );
      
      const status = statusResponse.data.data.status;
      console.log(`📊 Intento ${attempts + 1}/30 - Status: ${status}`);
      
      if (status === 'SUCCEEDED') {
        const dataResponse = await axios.get(
          `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
          { params: { token: API_TOKEN } }
        );
        
        results = dataResponse.data;
        console.log(`✅ Datos recibidos: ${results.length} items`);
        break;
      } else if (status === 'FAILED') {
        const error = statusResponse.data.data.error || 'Unknown error';
        throw new Error(`Apify run failed: ${error}`);
      }
      
      attempts++;
    }

    if (!results) {
      throw new Error('Timeout esperando resultados de Apify (60 segundos)');
    }

    console.log(`✅ ${results.length} perfiles encontrados`);

    // Procesar resultados
    const leads = results.map(profile => {
      console.log('📝 Procesando perfil:', profile.username);
      
      return {
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
        opportunityScore: calculateInstagramScore(profile)
      };
    });

    console.log(`🎯 Leads procesados: ${leads.length}`);
    return leads;

  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error response:', error.response?.data);
    throw error;
  }
}

function calculateInstagramScore(profile) {
  let score = 0;
  
  if (!profile.externalUrl) score += 40;
  if (profile.postsCount < 50) score += 20;
  else if (profile.postsCount < 100) score += 10;
  
  if (profile.followersCount > 1000 && profile.followersCount < 10000) {
    score += 20;
  } else if (profile.followersCount > 10000) {
    score += 10;
  }
  
  if (profile.category && profile.category.includes('Business')) {
    score += 15;
  }
  
  if (profile.biography && profile.biography.length > 50) {
    score += 5;
  }
  
  return Math.min(score, 100);
}