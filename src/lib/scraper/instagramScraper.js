import axios from 'axios';

export async function scrapeInstagramHashtag(hashtag, maxResults = 20) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  if (!API_TOKEN) {
    throw new Error('APIFY_API_TOKEN no configurada');
  }

  console.log(`📸 Iniciando búsqueda en Instagram: #${hashtag}`);
  
  try {
    // URL del webhook (debe ser pública - tu dominio de Vercel)
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/apify`;
    
    console.log('🔗 Webhook URL:', webhookUrl);
    
    const runResponse = await axios.post(
      'https://api.apify.com/v2/acts/apify~instagram-scraper/runs',
      {
        hashtags: [hashtag],
        resultsLimit: maxResults * 2,
        resultsType: 'posts',
        addParentData: false
      },
      {
        params: { 
          token: API_TOKEN,
          webhooks: JSON.stringify([{
            eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
            requestUrl: webhookUrl
          }])
        },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const runId = runResponse.data.data.id;
    console.log(`✅ Run iniciado: ${runId}`);
    console.log(`⏳ Apify nos avisará cuando termine vía webhook`);
    
    return { runId }; // Retornamos solo el runId
    
  } catch (error) {
    console.error('❌ Error iniciando run:', error.message);
    throw error;
  }
}

export async function getInstagramResults(runId) {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  
  try {
    // Intentar obtener de nuestra DB temporal primero
    const dbConnect = (await import('@/lib/mongodb')).default;
    const mongoose = (await import('mongoose')).default;
    
    const ApifyResultSchema = new mongoose.Schema({
      runId: String,
      status: String,
      results: Array,
      error: String
    });
    
    const ApifyResult = mongoose.models.ApifyResult || mongoose.model('ApifyResult', ApifyResultSchema);
    
    await dbConnect();
    
    const cached = await ApifyResult.findOne({ runId });
    
    if (cached) {
      console.log('✅ Resultados encontrados en cache');
      
      if (cached.status === 'SUCCEEDED') {
        // Procesar resultados
        const posts = cached.results;
        const usernames = [...new Set(
          posts
            .map(post => post.ownerUsername)
            .filter(Boolean)
        )];
        
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
            opportunityScore: 70
          };
        });
        
        return { status: 'SUCCEEDED', leads };
      } else {
        return { status: 'FAILED', error: cached.error };
      }
    }
    
    // Si no está en cache, verificar status en Apify
    const statusResponse = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { params: { token: API_TOKEN } }
    );
    
    const status = statusResponse.data.data.status;
    
    return { status, leads: [] };
    
  } catch (error) {
    console.error('❌ Error obteniendo resultados:', error);
    throw error;
  }
}