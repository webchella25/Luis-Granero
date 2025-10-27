// src/lib/getLegalSettings.js
import connectDB from '@/lib/mongodb';
import SiteConfig from '@/models/SiteConfig';

/**
 * Obtiene la configuración del sitio incluyendo datos legales
 * Usado por las páginas legales públicas
 */
export async function getLegalSettings() {
  try {
    await connectDB();
    
    const siteConfig = await SiteConfig.findOne({ key: 'site_info' }).lean();
    
    if (!siteConfig || !siteConfig.value) {
      // Valores por defecto si no hay configuración
      return {
        companyName: 'Luis Granero',
        ownerName: 'Luis Granero',
        dni: '[DNI/NIF]',
        legalAddress: '[Dirección]',
        city: 'Madrid',
        postalCode: '[CP]',
        country: 'España',
        email: 'contacto@luisgranero.com',
        phone: '[Teléfono]',
        website: 'https://luisgranero.com'
      };
    }
    
    // Combinar datos del sitio con datos legales
    const settings = siteConfig.value;
    
    return {
      companyName: settings.legal?.companyName || settings.site?.name || 'Luis Granero',
      ownerName: settings.legal?.ownerName || settings.site?.name || 'Luis Granero',
      dni: settings.legal?.dni || '[DNI/NIF]',
      legalAddress: settings.legal?.legalAddress || settings.site?.address || '[Dirección]',
      city: settings.legal?.city || 'Madrid',
      postalCode: settings.legal?.postalCode || '[CP]',
      country: settings.legal?.country || 'España',
      email: settings.site?.email || settings.email?.contactEmail || 'contacto@luisgranero.com',
      phone: settings.site?.phone || '[Teléfono]',
      website: 'https://luisgranero.com',
      registryData: settings.legal?.registryData || '',
      vatNumber: settings.legal?.vatNumber || ''
    };
  } catch (error) {
    console.error('Error getting legal settings:', error);
    // Devolver valores por defecto en caso de error
    return {
      companyName: 'Luis Granero',
      ownerName: 'Luis Granero',
      dni: '[DNI/NIF]',
      legalAddress: '[Dirección]',
      city: 'Madrid',
      postalCode: '[CP]',
      country: 'España',
      email: 'contacto@luisgranero.com',
      phone: '[Teléfono]',
      website: 'https://luisgranero.com'
    };
  }
}