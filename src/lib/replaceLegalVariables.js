// src/lib/replaceLegalVariables.js

/**
 * Reemplaza variables en el contenido legal
 * Variables disponibles: {{companyName}}, {{ownerName}}, {{dni}}, {{address}}, etc.
 */
export function replaceLegalVariables(content, settings) {
  if (!content || !settings) return content;
  
  const variables = {
    '{{companyName}}': settings.companyName || 'Luis Granero',
    '{{ownerName}}': settings.ownerName || 'Luis Granero',
    '{{dni}}': settings.dni || '[DNI/NIF]',
    '{{address}}': settings.legalAddress || '[Dirección]',
    '{{city}}': settings.city || 'Madrid',
    '{{postalCode}}': settings.postalCode || '[CP]',
    '{{country}}': settings.country || 'España',
    '{{email}}': settings.email || 'contacto@luisgranero.com',
    '{{phone}}': settings.phone || '[Teléfono]',
    '{{website}}': settings.website || 'https://luisgranero.com',
    '{{registryData}}': settings.registryData || '',
    '{{vatNumber}}': settings.vatNumber || '',
    '{{currentYear}}': new Date().getFullYear().toString(),
    '{{currentDate}}': new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
  
  let processedContent = content;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    processedContent = processedContent.replace(regex, variables[key]);
  });
  
  return processedContent;
}

/**
 * Obtiene la lista de variables disponibles
 */
export function getAvailableVariables() {
  return [
    { key: '{{companyName}}', description: 'Nombre comercial' },
    { key: '{{ownerName}}', description: 'Nombre del propietario' },
    { key: '{{dni}}', description: 'DNI/NIF' },
    { key: '{{address}}', description: 'Dirección completa' },
    { key: '{{city}}', description: 'Ciudad' },
    { key: '{{postalCode}}', description: 'Código postal' },
    { key: '{{country}}', description: 'País' },
    { key: '{{email}}', description: 'Email de contacto' },
    { key: '{{phone}}', description: 'Teléfono' },
    { key: '{{website}}', description: 'URL del sitio web' },
    { key: '{{registryData}}', description: 'Datos registrales (opcional)' },
    { key: '{{vatNumber}}', description: 'CIF/NIF empresarial (opcional)' },
    { key: '{{currentYear}}', description: 'Año actual' },
    { key: '{{currentDate}}', description: 'Fecha actual' }
  ];
}