// lib/scrapers/googleMapsScraper.ts

import puppeteer from 'puppeteer';

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
  
  console.log(`🔍 Buscando: "${query}" en "${location}"`);
  
  const browser = await puppeteer.launch({
    headless: true, // Cambia a false para ver el navegador
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // User agent para parecer un navegador real
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Construir URL de búsqueda
    const searchQuery = `${query} ${location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    
    console.log(`📍 Navegando a: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Esperar a que carguen los resultados
    await page.waitForSelector('[role="feed"]', { timeout: 10000 });
    
    console.log('✅ Resultados cargados, comenzando scraping...');

    // Hacer scroll para cargar más resultados
    await autoScroll(page, maxResults);

    // Extraer información de todos los negocios
    const businesses = await page.evaluate(() => {
      const results: BusinessLead[] = [];
      
      // Selector de cada negocio en la lista
      const businessCards = document.querySelectorAll('[role="feed"] > div > div > a');
      
      businessCards.forEach((card: any) => {
        try {
          // Nombre del negocio
          const nameElement = card.querySelector('.fontHeadlineSmall');
          const name = nameElement?.textContent?.trim() || null;
          
          if (!name) return; // Si no hay nombre, skip
          
          // Rating y cantidad de reseñas
          const ratingElement = card.querySelector('.MW4etd');
          const ratingText = ratingElement?.textContent?.trim();
          const rating = ratingText ? parseFloat(ratingText.replace(',', '.')) : null;
          
          const reviewElement = card.querySelector('.UY7F9');
          const reviewText = reviewElement?.textContent?.trim();
          const reviewCount = reviewText ? parseInt(reviewText.replace(/\D/g, '')) : null;
          
          // Categoría del negocio
          const categoryElement = card.querySelector('.W4Efsd:last-of-type .W4Efsd:first-of-type span');
          const category = categoryElement?.textContent?.trim() || null;
          
          // Dirección (segundo span en la info)
          const addressElements = card.querySelectorAll('.W4Efsd:last-of-type .W4Efsd span');
          const address = addressElements[1]?.textContent?.trim() || null;
          
          // Extraer place_id del href para luego obtener más datos
          const href = card.getAttribute('href');
          const placeIdMatch = href?.match(/!1s([^!]+)/);
          const placeId = placeIdMatch ? placeIdMatch[1] : null;
          
          results.push({
            name,
            address,
            phone: null, // Lo obtendremos en el siguiente paso
            website: null, // Lo obtendremos en el siguiente paso
            rating,
            reviewCount,
            category,
            placeId
          });
          
        } catch (error) {
          console.error('Error extrayendo negocio:', error);
        }
      });
      
      return results;
    });

    console.log(`✅ Encontrados ${businesses.length} negocios`);

    // Obtener detalles adicionales (teléfono, website) de cada negocio
    const detailedBusinesses = await getBusinessDetails(page, businesses, maxResults);
    
    return detailedBusinesses;

  } catch (error) {
    console.error('❌ Error en scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Función para hacer scroll y cargar más resultados
async function autoScroll(page: any, maxResults: number) {
  const scrollableSelector = '[role="feed"]';
  
  await page.evaluate(async (selector: string, max: number) => {
    const scrollableDiv = document.querySelector(selector);
    if (!scrollableDiv) return;
    
    let lastHeight = scrollableDiv.scrollHeight;
    let scrollAttempts = 0;
    const maxScrolls = Math.ceil(max / 10); // Cada scroll carga ~10 resultados
    
    while (scrollAttempts < maxScrolls) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
      
      // Esperar a que carguen más resultados
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newHeight = scrollableDiv.scrollHeight;
      if (newHeight === lastHeight) break; // No hay más resultados
      
      lastHeight = newHeight;
      scrollAttempts++;
    }
  }, scrollableSelector, maxResults);
  
  console.log(`📜 Scroll completado`);
}

// Función para obtener detalles individuales de cada negocio
async function getBusinessDetails(
  page: any, 
  businesses: BusinessLead[], 
  limit: number
): Promise<BusinessLead[]> {
  
  const detailedBusinesses: BusinessLead[] = [];
  const businessesToProcess = businesses.slice(0, limit);
  
  console.log(`🔎 Obteniendo detalles de ${businessesToProcess.length} negocios...`);
  
  for (let i = 0; i < businessesToProcess.length; i++) {
    const business = businessesToProcess[i];
    
    try {
      // Hacer click en el negocio para ver sus detalles
      const businessSelector = `a[href*="${business.placeId}"]`;
      await page.click(businessSelector);
      
      // Esperar a que cargue el panel de detalles
      await page.waitForTimeout(2000);
      
      // Extraer teléfono y website
      const details = await page.evaluate(() => {
        // Buscar botón de teléfono
        const phoneButton = Array.from(document.querySelectorAll('button[data-item-id]'))
          .find(btn => btn.getAttribute('data-item-id')?.includes('phone'));
        const phone = phoneButton?.getAttribute('data-item-id')?.replace('phone:tel:', '') || null;
        
        // Buscar botón de website
        const websiteLink = Array.from(document.querySelectorAll('a[data-item-id]'))
          .find(link => link.getAttribute('data-item-id')?.includes('authority'));
        const website = websiteLink?.getAttribute('href') || null;
        
        return { phone, website };
      });
      
      detailedBusinesses.push({
        ...business,
        phone: details.phone,
        website: details.website
      });
      
      console.log(`  ✓ [${i + 1}/${businessesToProcess.length}] ${business.name}`);
      
    } catch (error) {
      console.log(`  ⚠ [${i + 1}/${businessesToProcess.length}] ${business.name} (sin detalles)`);
      detailedBusinesses.push(business);
    }
  }
  
  return detailedBusinesses;
}