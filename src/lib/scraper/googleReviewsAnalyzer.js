// src/lib/scraper/googleReviewsAnalyzer.js
import axios from 'axios';

/**
 * GOOGLE REVIEWS ANALYZER
 * Extrae y analiza reviews de Google usando SerpAPI
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Obtener reviews de un negocio por Place ID
 */
export async function getGoogleReviews(placeId, maxReviews = 20) {
  if (!SERPAPI_KEY) {
    console.warn('⚠️ SERPAPI_KEY no configurada');
    return null;
  }

  if (!placeId) {
    console.warn('⚠️ Place ID no proporcionado');
    return null;
  }

  console.log(`\n🔍 Obteniendo reviews para Place ID: ${placeId}`);

  try {
    const url = 'https://serpapi.com/search.json';

    const params = {
      engine: 'google_maps_reviews',
      place_id: placeId,
      api_key: SERPAPI_KEY,
      hl: 'es', // Idioma español
      num: Math.min(maxReviews, 50) // Máximo 50 por request
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (!data.reviews || data.reviews.length === 0) {
      console.log('⚠️ No se encontraron reviews');
      return null;
    }

    console.log(`✅ ${data.reviews.length} reviews obtenidas`);

    // Procesar reviews
    const processedReviews = data.reviews.map(review => ({
      author: review.user?.name || 'Anónimo',
      rating: review.rating || 0,
      date: review.date || null,
      text: review.snippet || review.text || '',
      likes: review.likes || 0,
      responseFromOwner: review.response ? {
        text: review.response.text,
        date: review.response.date
      } : null
    }));

    // Analizar reviews
    const analysis = analyzeReviews(processedReviews);

    return {
      placeId,
      totalReviews: data.reviews.length,
      reviews: processedReviews,
      analysis,
      extractedAt: new Date()
    };

  } catch (error) {
    console.error('❌ Error obteniendo reviews:', error.message);
    return null;
  }
}

/**
 * Obtener reviews por nombre de negocio (busca primero en Maps)
 */
export async function getReviewsByBusinessName(businessName, location = null) {
  if (!SERPAPI_KEY) {
    console.warn('⚠️ SERPAPI_KEY no configurada');
    return null;
  }

  console.log(`\n🔍 Buscando reviews para: ${businessName}`);

  try {
    // Primero buscar el negocio en Google Maps
    const searchUrl = 'https://serpapi.com/search.json';

    const searchParams = {
      engine: 'google_maps',
      q: businessName,
      api_key: SERPAPI_KEY,
      hl: 'es'
    };

    if (location) {
      searchParams.ll = location; // Ej: "@40.7128,-74.0060,15z"
    }

    const searchResponse = await axios.get(searchUrl, { params: searchParams });
    const searchData = searchResponse.data;

    if (!searchData.local_results || searchData.local_results.length === 0) {
      console.log('⚠️ Negocio no encontrado en Google Maps');
      return null;
    }

    // Tomar el primer resultado
    const business = searchData.local_results[0];
    const placeId = business.place_id;

    console.log(`✅ Negocio encontrado: ${business.title}`);
    console.log(`   Place ID: ${placeId}`);
    console.log(`   Rating: ${business.rating} (${business.reviews} reviews)`);

    // Obtener reviews
    return await getGoogleReviews(placeId);

  } catch (error) {
    console.error('❌ Error buscando reviews:', error.message);
    return null;
  }
}

/**
 * Analizar reviews (sentimiento, temas, oportunidades)
 */
function analyzeReviews(reviews) {
  const analysis = {
    overall: {
      avgRating: 0,
      totalReviews: reviews.length,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    sentiment: {
      positive: 0,
      neutral: 0,
      negative: 0
    },
    engagement: {
      ownerResponses: 0,
      responseRate: 0,
      avgResponseTime: null
    },
    insights: {
      strengths: [],
      weaknesses: [],
      opportunities: []
    },
    keywords: {
      positive: new Map(),
      negative: new Map()
    }
  };

  // Calcular distribución y promedio
  let totalRating = 0;
  reviews.forEach(review => {
    const rating = review.rating;
    totalRating += rating;
    analysis.overall.distribution[rating]++;

    // Clasificar sentimiento
    if (rating >= 4) analysis.sentiment.positive++;
    else if (rating === 3) analysis.sentiment.neutral++;
    else analysis.sentiment.negative++;

    // Contar respuestas del dueño
    if (review.responseFromOwner) {
      analysis.engagement.ownerResponses++;
    }

    // Extraer keywords del texto
    extractKeywords(review.text, rating, analysis.keywords);
  });

  analysis.overall.avgRating = (totalRating / reviews.length).toFixed(1);
  analysis.engagement.responseRate =
    ((analysis.engagement.ownerResponses / reviews.length) * 100).toFixed(1) + '%';

  // Generar insights
  generateInsights(analysis);

  return analysis;
}

/**
 * Extraer keywords de las reviews
 */
function extractKeywords(text, rating, keywords) {
  if (!text) return;

  const positiveWords = [
    'excelente', 'bueno', 'genial', 'recomiendo', 'perfecto', 'increíble',
    'profesional', 'rápido', 'amable', 'calidad', 'satisfecho', 'feliz',
    'maravilloso', 'fantástico', 'mejor', 'great', 'excellent', 'amazing',
    'love', 'best', 'perfect', 'wonderful', 'fantastic', 'recommend'
  ];

  const negativeWords = [
    'malo', 'terrible', 'pésimo', 'lento', 'caro', 'decepción', 'problema',
    'error', 'nunca', 'peor', 'horrible', 'desastre', 'fraude', 'estafa',
    'bad', 'terrible', 'awful', 'slow', 'expensive', 'disappointed', 'worst',
    'horrible', 'never', 'disaster', 'scam', 'fraud'
  ];

  const textLower = text.toLowerCase();

  if (rating >= 4) {
    // Review positivo
    positiveWords.forEach(word => {
      if (textLower.includes(word)) {
        keywords.positive.set(word, (keywords.positive.get(word) || 0) + 1);
      }
    });
  } else if (rating <= 2) {
    // Review negativo
    negativeWords.forEach(word => {
      if (textLower.includes(word)) {
        keywords.negative.set(word, (keywords.negative.get(word) || 0) + 1);
      }
    });
  }
}

/**
 * Generar insights basados en el análisis
 */
function generateInsights(analysis) {
  const { overall, sentiment, engagement } = analysis;

  // Fortalezas
  if (overall.avgRating >= 4.5) {
    analysis.insights.strengths.push('Excelente reputación online (4.5+ estrellas)');
  }

  if (sentiment.positive / overall.totalReviews >= 0.8) {
    analysis.insights.strengths.push('Más del 80% de reviews positivos');
  }

  if (parseFloat(engagement.responseRate) >= 70) {
    analysis.insights.strengths.push('Alta tasa de respuesta del propietario');
  }

  // Debilidades
  if (overall.avgRating < 3.5) {
    analysis.insights.weaknesses.push('Rating bajo (menor a 3.5 estrellas)');
  }

  if (sentiment.negative / overall.totalReviews >= 0.3) {
    analysis.insights.weaknesses.push('30% o más de reviews negativos');
  }

  if (parseFloat(engagement.responseRate) < 30) {
    analysis.insights.weaknesses.push('Baja tasa de respuesta a reviews');
  }

  // Oportunidades
  if (overall.totalReviews < 10) {
    analysis.insights.opportunities.push('Pocos reviews: oportunidad para aumentar reputación online');
  }

  if (parseFloat(engagement.responseRate) < 50) {
    analysis.insights.opportunities.push('Oportunidad: mejorar engagement respondiendo a reviews');
  }

  if (overall.avgRating < 4.0 && overall.avgRating >= 3.0) {
    analysis.insights.opportunities.push('Rating mejorable: oportunidad de optimización de servicio');
  }

  if (sentiment.negative > 0 && parseFloat(engagement.responseRate) < 50) {
    analysis.insights.opportunities.push('Reviews negativos sin responder: gestión de reputación crítica');
  }

  // Keywords más mencionados
  const topPositive = Array.from(analysis.keywords.positive.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  const topNegative = Array.from(analysis.keywords.negative.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  if (topPositive.length > 0) {
    analysis.insights.strengths.push(`Palabras positivas frecuentes: ${topPositive.join(', ')}`);
  }

  if (topNegative.length > 0) {
    analysis.insights.weaknesses.push(`Palabras negativas frecuentes: ${topNegative.join(', ')}`);
  }
}

/**
 * Generar pitch basado en reviews
 */
export function generateReviewsPitch(reviewsData) {
  if (!reviewsData || !reviewsData.analysis) {
    return null;
  }

  const { analysis } = reviewsData;
  const pitchPoints = [];

  // Basado en debilidades
  if (analysis.insights.weaknesses.length > 0) {
    analysis.insights.weaknesses.forEach(weakness => {
      if (weakness.includes('Rating bajo')) {
        pitchPoints.push('Tu rating en Google es bajo - afecta directamente tus ventas');
      }
      if (weakness.includes('reviews negativos')) {
        pitchPoints.push('Tienes muchos reviews negativos sin gestionar');
      }
      if (weakness.includes('Baja tasa de respuesta')) {
        pitchPoints.push('No respondes a tus clientes en Google - pierdes confianza');
      }
    });
  }

  // Basado en oportunidades
  if (analysis.insights.opportunities.length > 0) {
    analysis.insights.opportunities.forEach(opp => {
      if (opp.includes('Pocos reviews')) {
        pitchPoints.push('Solo tienes ' + analysis.overall.totalReviews + ' reviews - necesitas más reputación online');
      }
      if (opp.includes('mejorar engagement')) {
        pitchPoints.push('Respondes menos del 50% de reviews - pierdes oportunidades de engagement');
      }
      if (opp.includes('gestión de reputación crítica')) {
        pitchPoints.push('Reviews negativos sin responder dañan tu reputación');
      }
    });
  }

  if (pitchPoints.length === 0) {
    return null;
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: 'Te ayudamos a mejorar tu reputación online y gestionar reviews profesionalmente'
  };
}

/**
 * Calcular score de oportunidad basado en reviews
 */
export function calculateReviewsOpportunityScore(reviewsData) {
  if (!reviewsData || !reviewsData.analysis) {
    return 50; // Score neutral si no hay datos
  }

  let score = 0;
  const { analysis } = reviewsData;

  // Rating bajo = alta oportunidad
  if (analysis.overall.avgRating < 3.0) {
    score += 40;
  } else if (analysis.overall.avgRating < 4.0) {
    score += 25;
  } else if (analysis.overall.avgRating < 4.5) {
    score += 10;
  }

  // Pocos reviews = oportunidad
  if (analysis.overall.totalReviews < 10) {
    score += 20;
  } else if (analysis.overall.totalReviews < 30) {
    score += 10;
  }

  // Baja tasa de respuesta = oportunidad
  const responseRate = parseFloat(analysis.engagement.responseRate);
  if (responseRate < 30) {
    score += 25;
  } else if (responseRate < 50) {
    score += 15;
  }

  // Reviews negativos sin responder = alta oportunidad
  if (analysis.sentiment.negative > 0 && responseRate < 50) {
    score += 15;
  }

  return Math.min(100, score);
}

/**
 * Obtener fotos del negocio desde Google Maps (para demos)
 * Usa engine google_maps con type=place para extraer fotos del listing
 */
export async function getGooglePlacePhotos(placeId, maxPhotos = 10) {
  if (!SERPAPI_KEY) {
    console.warn('⚠️ SERPAPI_KEY no configurada');
    return [];
  }

  if (!placeId) return [];

  console.log(`\n📸 Obteniendo fotos del negocio (Place ID: ${placeId})`);

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_maps',
        type: 'place',
        place_id: placeId,
        api_key: SERPAPI_KEY,
        hl: 'es'
      }
    });

    const data = response.data;
    const rawPhotos = data.place_results?.photos || data.photos || [];

    if (rawPhotos.length === 0) {
      console.log('   ⚠️ No se encontraron fotos');
      return [];
    }

    // Extraer URLs limpias y filtrar thumbnails pequeños
    const photos = rawPhotos
      .slice(0, maxPhotos)
      .map((photo, index) => ({
        index,
        url: photo.image || photo.url || photo.thumbnail || null,
        thumbnail: photo.thumbnail || photo.image || null,
        width: photo.width || null,
        height: photo.height || null
      }))
      .filter(p => p.url !== null);

    console.log(`   ✅ ${photos.length} fotos obtenidas`);
    return photos;

  } catch (error) {
    console.error('❌ Error obteniendo fotos:', error.message);
    return [];
  }
}

/**
 * Generar reporte de reviews para lead
 */
export function generateReviewsReport(reviewsData) {
  if (!reviewsData || !reviewsData.analysis) {
    return null;
  }

  const { analysis } = reviewsData;

  return {
    summary: `${analysis.overall.avgRating}/5 estrellas (${analysis.overall.totalReviews} reviews)`,
    rating: parseFloat(analysis.overall.avgRating),
    totalReviews: analysis.overall.totalReviews,
    sentiment: {
      positive: `${((analysis.sentiment.positive / analysis.overall.totalReviews) * 100).toFixed(0)}%`,
      negative: `${((analysis.sentiment.negative / analysis.overall.totalReviews) * 100).toFixed(0)}%`
    },
    responseRate: analysis.engagement.responseRate,
    strengths: analysis.insights.strengths,
    weaknesses: analysis.insights.weaknesses,
    opportunities: analysis.insights.opportunities,
    opportunityScore: calculateReviewsOpportunityScore(reviewsData)
  };
}
