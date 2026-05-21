// src/lib/scraper/instagramScraper.js
import axios from 'axios';
import { validateSocialResult } from './socialMediaValidator.js';

/**
 * INSTAGRAM SCRAPER — sin Apify
 *
 * Flujo:
 *   1. SerpApi: buscar URL del perfil (site:instagram.com)
 *   2. fetchInstagramProfileData: intenta dos métodos sin auth:
 *        a) API móvil de Instagram (x-ig-app-id)
 *        b) Fetch de la página + parsing de og:description / og:title
 *   3. Regex sobre bio: extrae emails y teléfonos
 *   4. Si fetch bloqueado → devuelve URL + hasPresence: true sin métricas
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// ─────────────────────────────────────────────
// STUBS DE FUNCIONES ANTIGUAS (compatibilidad)
// ─────────────────────────────────────────────

/** @deprecated Usaba apify/instagram-scraper — desactivado */
export async function scrapeInstagramHashtag() {
  console.warn('⚠️ scrapeInstagramHashtag desactivado — requería Apify de pago');
  return [];
}

/** @deprecated Usaba apify/instagram-scraper — desactivado */
export async function scrapeInstagramProfile() {
  return null;
}

// ─────────────────────────────────────────────
// BÚSQUEDA DE URL VIA SERPAPI
// ─────────────────────────────────────────────

export async function searchInstagramUrlViaSerpApi(businessName, address = null, phone = null) {
  if (!SERPAPI_KEY) {
    console.warn('   ⚠️ SERPAPI_KEY no configurada — no se puede buscar Instagram');
    return null;
  }

  let city = '';
  if (address) {
    const parts = address.split(',').map(s => s.trim()).filter(Boolean);
    city = parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
  }

  const query = `site:instagram.com "${businessName}"${city ? ` ${city}` : ''}`;
  console.log(`   🔎 SerpApi query: ${query}`);

  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: { engine: 'google', q: query, api_key: SERPAPI_KEY, num: 5, hl: 'es' },
      timeout: 10000
    });

    const results = response.data?.organic_results || [];

    for (const result of results) {
      const link = result.link || '';
      // Solo usernames: instagram.com/[username] — descartar /p/, /reel/, /explore/, /stories/
      const match = link.match(/^https?:\/\/(www\.)?instagram\.com\/(?!p\/|reel\/|explore\/|stories\/|accounts\/)([^/?#]+)/);
      if (!match || !match[2]) continue;

      const validation = validateSocialResult(result, businessName, phone);
      if (!validation.valid) {
        console.log(`   ⚠️ Resultado descartado: ${validation.reason}`);
        continue;
      }

      const username = match[2].replace(/\/$/, '');
      return { url: `https://www.instagram.com/${username}/`, username };
    }

    return null;

  } catch (error) {
    console.warn(`   ⚠️ Error buscando Instagram en SerpApi: ${error.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// FETCH DE DATOS DEL PERFIL (sin Apify)
// ─────────────────────────────────────────────

/**
 * Intenta obtener datos del perfil por dos métodos sin autenticación.
 * Devuelve null si ambos fallan (perfil privado o bloqueado).
 */
async function fetchInstagramProfileData(username) {
  // Método 1: API móvil de Instagram (funciona para perfiles públicos)
  try {
    const resp = await axios.get(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          'x-ig-app-id': '936619743392459',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram/303.2.0.11.111'
        },
        timeout: 8000
      }
    );

    const user = resp.data?.data?.user;
    if (user) {
      console.log('   📡 Datos obtenidos via API móvil de Instagram');
      return mapInstagramApiUser(user, username);
    }
  } catch {
    // Silencioso — probar método 2
  }

  // Método 2: Fetch de la página pública + parsing de meta tags
  try {
    const resp = await axios.get(`https://www.instagram.com/${username}/`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      },
      timeout: 8000
    });

    const parsed = parseInstagramMetaTags(resp.data, username);
    if (parsed) {
      console.log('   📡 Datos obtenidos via meta tags de la página');
      return parsed;
    }
  } catch {
    // Silencioso — devolver null
  }

  console.log('   ⚠️ Fetch bloqueado — solo URL disponible');
  return null;
}

/**
 * Mapear respuesta de la API móvil de Instagram
 */
function mapInstagramApiUser(user, username) {
  const bio = user.biography || '';
  return {
    username: user.username || username,
    fullName: user.full_name || null,
    bio,
    followers: user.edge_followed_by?.count ?? user.follower_count ?? 0,
    following: user.edge_follow?.count ?? user.following_count ?? 0,
    posts: user.edge_owner_to_timeline_media?.count ?? user.media_count ?? 0,
    website: user.external_url || null,
    isVerified: user.is_verified || false,
    isBusinessAccount: user.is_business_account || false,
    businessCategory: user.business_category_name || null,
    profilePicUrl: user.profile_pic_url || null,
    emails: extractEmails(bio),
    phones: extractPhones(bio)
  };
}

/**
 * Parsear meta tags OG de la página pública de Instagram
 * og:description suele tener: "1,234 Followers, 567 Following, 89 Posts - ..."
 */
function parseInstagramMetaTags(html, username) {
  const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);

  if (!descMatch) return null;

  const desc = descMatch[1];
  const title = titleMatch?.[1] || '';

  const followers = parseInstagramNumber(desc.match(/(\d[\d,.]+)\s*Followers/i)?.[1]);
  const following = parseInstagramNumber(desc.match(/(\d[\d,.]+)\s*Following/i)?.[1]);
  const posts = parseInstagramNumber(desc.match(/(\d[\d,.]+)\s*Posts/i)?.[1]);

  // Nombre completo del og:title: "Full Name (@username) • Instagram"
  const fullNameMatch = title.match(/^(.+?)\s*\(@/);
  const fullName = fullNameMatch?.[1]?.trim() || null;

  return {
    username,
    fullName,
    bio: null, // No disponible en meta tags sin auth
    followers,
    following,
    posts,
    website: null,
    isVerified: false,
    isBusinessAccount: false,
    businessCategory: null,
    profilePicUrl: null,
    emails: [],
    phones: []
  };
}

function parseInstagramNumber(str) {
  if (!str) return 0;
  return parseInt(str.replace(/[.,]/g, '').replace(/[^\d]/g, ''), 10) || 0;
}

// ─────────────────────────────────────────────
// EXTRACCIÓN DE CONTACTO DE LA BIO
// ─────────────────────────────────────────────

function extractEmails(text) {
  if (!text) return [];
  const matches = text.match(/[\w.+%-]+@[\w-]+\.[a-z]{2,}/gi) || [];
  return [...new Set(matches.map(e => e.toLowerCase()))];
}

function extractPhones(text) {
  if (!text) return [];
  const patterns = [
    /(?:\+34|0034)?[\s.-]?[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g, // España
    /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}/g  // Internacional
  ];
  const found = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    found.push(...matches.map(p => p.replace(/[\s.-]/g, '')));
  }
  return [...new Set(found)].filter(p => p.replace(/\D/g, '').length >= 9);
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────

/**
 * Analizar presencia en Instagram de un negocio.
 * Si instagramUrl es null, busca via SerpApi.
 * Si no encuentra nada → { hasPresence: false, notFound: true }.
 */
export async function analyzeInstagramPresence(businessName, instagramUrl = null, address = null, phone = null) {
  console.log(`\n🔍 [Instagram] Analizando: ${businessName}`);

  let username = null;
  let foundViaSearch = false;

  if (instagramUrl) {
    const match = instagramUrl.match(/instagram\.com\/([^/?#]+)/);
    username = match?.[1]?.replace(/\/$/, '') || null;
    console.log(`   📋 Instagram URL encontrada: ${instagramUrl}`);
  } else {
    console.log('   📋 Sin URL de Instagram en el lead — buscando via SerpApi...');
    const found = await searchInstagramUrlViaSerpApi(businessName, address, phone);

    if (found) {
      instagramUrl = found.url;
      username = found.username;
      foundViaSearch = true;
      console.log(`   📋 Instagram URL encontrada via SerpApi: ${instagramUrl}`);
    } else {
      console.log(`   📋 Sin perfil de Instagram encontrado para "${businessName}"`);
      return {
        hasPresence: false,
        notFound: true,
        opportunities: [
          'No tiene Instagram — oportunidad de crear presencia visual del negocio',
          'Sin Instagram pierde clientes que descubren negocios locales por fotos'
        ]
      };
    }
  }

  // Intentar obtener datos del perfil
  const profileData = username ? await fetchInstagramProfileData(username) : null;

  const opportunities = [];
  const bioEmails = profileData?.emails || [];
  const bioPhones = profileData?.phones || [];

  if (profileData) {
    if (profileData.followers < 500) {
      opportunities.push(`Cuenta de Instagram poco desarrollada (${profileData.followers} seguidores) — oportunidad de crecimiento`);
    }
    if (!profileData.website) {
      opportunities.push('No tiene website en la bio de Instagram — pierde tráfico potencial');
    }
    if (profileData.posts < 20) {
      opportunities.push(`Perfil poco activo (${profileData.posts} posts) — necesita estrategia de contenido`);
    }
    if (!profileData.isBusinessAccount) {
      opportunities.push('Usa cuenta personal en vez de cuenta de empresa — pierde estadísticas y funciones');
    }
  } else {
    opportunities.push('Tiene Instagram pero el perfil puede estar desactualizado o incompleto');
  }

  console.log(`   ✅ Instagram encontrado: @${username}${profileData ? ` — ${profileData.followers} seguidores` : ' (métricas no disponibles)'}`);
  if (bioEmails.length) console.log(`   📧 Emails en bio: ${bioEmails.join(', ')}`);
  if (bioPhones.length) console.log(`   📞 Teléfonos en bio: ${bioPhones.join(', ')}`);

  return {
    hasPresence: true,
    url: instagramUrl,
    username,
    ...(foundViaSearch && { foundUrl: instagramUrl }),
    profile: profileData || { username, url: instagramUrl },
    metrics: profileData ? {
      followers: profileData.followers,
      following: profileData.following,
      posts: profileData.posts,
      isVerified: profileData.isVerified
    } : null,
    contactFromBio: {
      emails: bioEmails,
      phones: bioPhones
    },
    opportunities
  };
}

// ─────────────────────────────────────────────
// PITCH
// ─────────────────────────────────────────────

export function generateInstagramPitch(instagramData) {
  if (!instagramData?.hasPresence) {
    return {
      mainMessage: 'No tiene Instagram — pierde clientes que descubren negocios locales por fotos',
      additionalPoints: [
        'El 60% de los usuarios de Instagram descubren nuevos negocios en la plataforma',
        'Sin presencia visual, el negocio es invisible para una generación entera'
      ],
      callToAction: 'Creamos su presencia digital completa: web profesional + estrategia de redes sociales'
    };
  }

  const profile = instagramData.profile;
  const pitchPoints = [];

  if (!profile?.website) {
    pitchPoints.push('No tiene website en su bio de Instagram — pierde clientes que quieren saber más');
  }
  if (profile?.followers < 500) {
    pitchPoints.push(`Solo ${profile.followers} seguidores en Instagram — su competencia le supera online`);
  }
  if (profile?.posts < 20) {
    pitchPoints.push('Perfil de Instagram poco activo — los clientes perciben abandono');
  }
  if (!profile?.isBusinessAccount) {
    pitchPoints.push('Usa cuenta personal en vez de empresa — pierde estadísticas y credibilidad');
  }

  if (!pitchPoints.length) {
    pitchPoints.push('Su presencia en Instagram puede optimizarse para captar más clientes locales');
  }

  return {
    mainMessage: pitchPoints[0],
    additionalPoints: pitchPoints.slice(1),
    callToAction: 'Conectamos Instagram con una web profesional para convertir seguidores en clientes'
  };
}
