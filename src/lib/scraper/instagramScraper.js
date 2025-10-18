import axios from 'axios';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`📸 Iniciando búsqueda en Instagram: #${hashtag}`);
  
  try {
    // SIN WEBHOOK - Versión simplificada
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${API_TOKEN}`,
      {
        hashtags: [hashtag],
        resultsLimit: maxResults * 2,
        resultsType: 'posts',
        addParentData: false
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const runId = runResponse.data.data.id;
    console.log(`✅ Run iniciado: ${runId}`);
    
    return { runId };
    
  } catch (error) {
    console.error('❌ Error iniciando run:', error.message);
    console.error('Response data:', error.response?.data);
    throw error;
  }
}

export async function getInstagramResults(runId) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  try {
    // Verificar status del run
    const statusResponse = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${API_TOKEN}`
    );
    
    const status = statusResponse.data.data.status;
    console.log(`📊 Status del run ${runId}: ${status}`);
    
    if (status === 'SUCCEEDED') {
      // Obtener resultados
      const dataResponse = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${API_TOKEN}`
      );
      
      const posts = dataResponse.data;
      console.log(`✅ ${posts.length} posts obtenidos`);
      
      // Extraer perfiles únicos
      const usernames = [...new Set(
        posts
          .map(post => post.ownerUsername)
          .filter(Boolean)
      )];
      
      console.log(`👥 ${usernames.length} perfiles únicos`);
      
      const leads = usernames.map(username => {
        const post = posts.find(p => p.ownerUsername === username);
        
        return {
          name: post?.ownerFullName || username,
          username: username,
          website: null,
          bio: '',
          followers: 0,
          posts: 0,
          isVerified: false,
          profilePicUrl: post?.ownerProfilePicUrl || null,
          category: null,
          source: 'instagram',
          searchQuery: '', // Se añadirá después
          opportunityScore: 70
        };
      });
      
      return { status: 'SUCCEEDED', leads };
      
    } else if (status === 'FAILED' || status === 'ABORTED') {
      return { 
        status: 'FAILED', 
        error: statusResponse.data.data.error || 'Run failed',
        leads: []
      };
    } else {
      // RUNNING, READY, etc.
      return { 
        status: 'RUNNING',
        leads: []
      };
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo resultados:', error.message);
    throw error;
  }
}