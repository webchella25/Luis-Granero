// src/lib/scraper/facebookScraper.js
import axios from 'axios';
import { validateSocialResult } from './socialMediaValidator.js';

/**
 * FACEBOOK SCRAPER — versión simplificada
 * Solo busca la URL de la página via SerpApi. Sin Apify.
 *
 * Lo que devuelve el enrichment:
 *   - hasPresence: true/false
 *   - url: URL de la página encontrada
 *   - foundUrl: presente si se descubrió en este run (para guardar en DB)
 *   - oportunidades basadas en presencia/ausencia (sin métricas de likes)
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY;

/**
 * Buscar URL de Facebook de un negocio via SerpApi
 * Query: site:facebook.com "[nombre negocio]" [ciudad]
 */
export async function searchFacebookUrlViaSerpApi(businessName, address = null, phone = null) {
  if (!SERPAPI_KEY) {
    console.warn('   ⚠️ SERPAPI_KEY no configurada — no se puede buscar URL de Facebook');
    return null;
  }

  // Extraer ciudad del address (penúltimo segmento separado por comas)
  let city = '';
  if (address) {
    const parts = address.split(',').map(s => s.trim()).filter(Boolean);
    city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
  }

  const query = `site:facebook.com "${businessName}"${city ? ` ${city}` : ''}`;
  console.log(`   🔎 SerpApi query: ${query}`);

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: { engine: 'google', q: query, api_key: SERPAPI_KEY, num: 5, hl: 'es' },
      timeout: 10000
    });

    const results = response.data?.organic_results || [];

    for (const result of results) {
      const link = result.link || '';
      // Solo slugs de páginas reales — descartar grupos, eventos y búsquedas
      const match = link.match(/^https?:\/\/(www\.)?facebook\.com\/(?!search|groups|events|pages\/search)([^/?#]+)/);
      if (!match) continue;

      const validation = validateSocialResult(result, businessName, phone);
      if (!validation.valid) {
        console.log(`   ⚠️ Resultado descartado: ${validation.reason}`);
        continue;
      }

      return link.split('?')[0].replace(/\/$/, '');
    }

    return null;

  } catch (error) {
    console.warn(`   ⚠️ Error buscando en SerpApi: ${error.message}`);
    return null;
  }
}

/**
 * Analizar presencia de Facebook de un negocio.
 * Si facebookUrl es null, busca via SerpApi automáticamente.
 * No intenta scrapear métricas — solo confirma presencia y guarda la URL.
 */
export async function analyzeFacebookPresence(businessName, facebookUrl = null, address = null, phone = null) {
  console.log(`\n🔍 [Facebook] Analizando: ${businessName}`);

  let foundViaSearch = false;

  if (!facebookUrl) {
    console.log('   📋 Sin URL de Facebook en el lead — buscando via SerpApi...');
    facebookUrl = await searchFacebookUrlViaSerpApi(businessName, address, phone);

    if (facebookUrl) {
      console.log(`   📋 Facebook URL encontrada via SerpApi: ${facebookUrl}`);
      foundViaSearch = true;
    } else {
      console.log(`   📋 Sin página de Facebook encontrada para "${businessName}"`);
      return {
        hasPresence: false,
        notFound: true,
        opportunities: [
          'No tiene página de Facebook — oportunidad de crear presencia en redes sociales',
          'Sin presencia en Facebook pierde visibilidad local y recomendaciones de clientes'
        ]
      };
    }
  } else {
    console.log(`   📋 Facebook URL encontrada: ${facebookUrl}`);
  }

  console.log(`   ✅ Tiene página de Facebook: Sí — ${facebookUrl}`);

  return {
    hasPresence: true,
    url: facebookUrl,
    // foundUrl presente solo si se descubrió en este run (para que el route lo persista en DB)
    ...(foundViaSearch && { foundUrl: facebookUrl }),
    opportunities: [
      'Tiene presencia en Facebook — verificar que el perfil esté completo y actualizado',
      'Añadir enlace a la web en la página de Facebook para generar tráfico'
    ]
  };
}

/**
 * Generar pitch basado en presencia/ausencia en Facebook
 */
export function generateFacebookPitch(facebookData) {
  if (!facebookData?.hasPresence) {
    return {
      mainMessage: 'No tiene página de Facebook — pierde visibilidad local y recomendaciones de clientes',
      additionalPoints: [
        'El 70% de los consumidores buscan negocios locales en Facebook',
        'Sin presencia en redes sociales, la web tiene menos credibilidad'
      ],
      callToAction: 'Creamos y optimizamos tu presencia digital completa: web + redes sociales'
    };
  }

  return {
    mainMessage: 'Tiene página de Facebook pero puede estar incompleta o desactualizada',
    additionalPoints: [
      'Una página de Facebook sin web pierde el 70% del tráfico potencial',
      'Integrar web y Facebook multiplica la visibilidad del negocio'
    ],
    callToAction: 'Conectamos tu presencia en Facebook con una web profesional optimizada'
  };
}
