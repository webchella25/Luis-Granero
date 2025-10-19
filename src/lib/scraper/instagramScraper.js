import axios from 'axios';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`📸 Iniciando búsqueda en Instagram: #${hashtag}`);
  
  try {
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
      console.log(`✅ ${posts.length} posts obtenidos de Apify`);
      
      // 🔍 DEBUG: Ver estructura del primer post
      if (posts.length > 0) {
        console.log('📝 Estructura del primer post:', JSON.stringify(posts[0], null, 2));
      }
      
      // Extraer perfiles únicos
      const usernames = [...new Set(
        posts
          .map(post => {
            // Intentar diferentes campos donde puede estar el username
            const username = post.ownerUsername || 
                           post.owner?.username || 
                           post.user?.username ||
                           post.username;
            
            console.log(`🔍 Post username encontrado: ${username}`);
            return username;
          })
          .filter(Boolean)
      )];
      
      console.log(`👥 ${usernames.length} perfiles únicos encontrados`);
      console.log(`📋 Usernames:`, usernames);
      
      if (usernames.length === 0) {
        console.warn('⚠️ No se encontraron usernames. Revisa la estructura de datos.');
        console.log('📦 Muestra de posts:', posts.slice(0, 3));
      }
      
      const leads = usernames.map(username => {
        const post = posts.find(p => 
          p.ownerUsername === username || 
          p.owner?.username === username ||
          p.user?.username === username ||
          p.username === username
        );
        
        const lead = {
          name: post?.ownerFullName || post?.owner?.fullName || post?.displayName || username,
          username: username,
          website: post?.externalUrl || post?.owner?.externalUrl || null,
          bio: post?.biography || post?.owner?.biography || '',
          followers: post?.followersCount || post?.owner?.followersCount || 0,
          posts: post?.postsCount || post?.owner?.postsCount || 0,
          isVerified: post?.verified || post?.owner?.isVerified || false,
          profilePicUrl: post?.ownerProfilePicUrl || post?.owner?.profilePicUrl || null,
          category: post?.category || null,
          source: 'instagram',
          searchQuery: '', // Se añadirá en el route
          opportunityScore: 70
        };
        
        console.log(`✅ Lead procesado: @${username}`, lead);
        return lead;
      });
      
      console.log(`🎯 Total leads procesados: ${leads.length}`);
      
      return { status: 'SUCCEEDED', leads };
      
    } else if (status === 'FAILED' || status === 'ABORTED') {
      return { 
        status: 'FAILED', 
        error: statusResponse.data.data.error || 'Run failed',
        leads: []
      };
    } else {
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