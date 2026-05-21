// src/lib/demo-generator/index.js
import crypto from 'crypto';
import { renderRestaurant } from './templates/restaurant.js';
import { renderBeauty } from './templates/beauty.js';
import { renderHealth } from './templates/health.js';
import { renderShop } from './templates/shop.js';
import { renderService } from './templates/service.js';
import { renderGeneric } from './templates/generic.js';

/**
 * Determina el sector de un negocio a partir de su categoría
 * @param {string} category - Categoría del lead (de Google Maps)
 * @returns {'restaurant'|'beauty'|'health'|'shop'|'service'|'generic'}
 */
export function categorizeSector(category = '') {
  const c = category.toLowerCase();

  const SECTORS = {
    restaurant: ['restauran', 'bar', 'cafeter', 'tapas', 'pizz', 'sushi', 'hamburgues', 'bocadillo', 'carne', 'mariscos', 'food', 'comida', 'gastronom', 'parrilla', 'asador', 'cervec'],
    beauty: ['peluquer', 'salón', 'salon', 'estética', 'estetica', 'spa', 'barber', 'manicur', 'pedicur', 'uñas', 'beauty', 'belleza', 'cosmet', 'nail', 'massag', 'masaje'],
    health: ['clínica', 'clinica', 'médico', 'medico', 'doctor', 'fisio', 'dentist', 'odontol', 'psicól', 'psicol', 'óptica', 'optica', 'farmaci', 'veterinar', 'hospital', 'salud', 'health', 'terapia'],
    shop: ['tienda', 'shop', 'boutique', 'bazar', 'ferretería', 'ferreteria', 'moda', 'ropa', 'zapater', 'joyería', 'joyeria', 'florist', 'librer', 'papeler', 'frutería', 'fruteria', 'supermercado', 'carnicer', 'panadería', 'panaderia'],
    service: ['taller', 'mecánic', 'mecanico', 'fontanero', 'fontaner', 'electricista', 'electric', 'cerrajer', 'pintor', 'carpinter', 'climatiz', 'aire acondicionado', 'limpieza', 'jardinero', 'jardiner', 'mudanza', 'seguridad', 'mantenimiento']
  };

  for (const [sector, keywords] of Object.entries(SECTORS)) {
    if (keywords.some(kw => c.includes(kw))) {
      return sector;
    }
  }

  return 'generic';
}

/**
 * Devuelve colores por sector
 */
function getSectorColors(sector) {
  const colorMap = {
    restaurant: { primary: '#d97706', secondary: '#0f0f0f' },
    beauty: { primary: '#ec4899', secondary: '#1a1a2e' },
    health: { primary: '#0ea5e9', secondary: '#0f172a' },
    shop: { primary: '#7c3aed', secondary: '#111' },
    service: { primary: '#f97316', secondary: '#111827' },
    generic: { primary: '#0ea5e9', secondary: '#0f172a' }
  };
  return colorMap[sector] || colorMap.generic;
}

/**
 * Genera el HTML de la demo a partir de los datos del lead
 * @param {object} lead - Documento Lead de MongoDB
 * @returns {{ html: string, sector: string, primaryColor: string, secondaryColor: string }}
 */
export function generateDemoHtml(lead) {
  const sector = lead.sector || categorizeSector(lead.category);
  const { primary: primaryColor, secondary: secondaryColor } = getSectorColors(sector);

  const data = {
    businessName: lead.name,
    sector,
    category: lead.category,
    address: lead.address,
    phone: lead.phone || (lead.phoneNumbers && lead.phoneNumbers[0]),
    email: lead.email || (lead.possibleEmails && lead.possibleEmails[0]),
    rating: lead.rating,
    reviewCount: lead.reviewCount,
    description: lead.description || lead.bio,
    profilePicUrl: lead.profilePicUrl,
    socialMedia: lead.socialMedia,
    primaryColor,
    secondaryColor
  };

  const renderers = {
    restaurant: renderRestaurant,
    beauty: renderBeauty,
    health: renderHealth,
    shop: renderShop,
    service: renderService,
    generic: renderGeneric
  };

  const renderer = renderers[sector] || renderGeneric;
  const html = renderer(data);

  return { html, sector, primaryColor, secondaryColor };
}

/**
 * Genera un token único para una demo
 */
export function generateDemoToken() {
  return crypto.randomBytes(20).toString('hex');
}
