// src/models/SiteSettings.js
import mongoose from 'mongoose';

const SiteSettingsSchema = new mongoose.Schema({
  // Solo habrá UN documento en esta colección
  _id: {
    type: String,
    default: 'site-settings'
  },
  
  // Datos del propietario/empresa
  companyName: {
    type: String,
    default: 'Luis Granero'
  },
  ownerName: {
    type: String,
    default: 'Luis Granero'
  },
  dni: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'Madrid'
  },
  postalCode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'España'
  },
  
  // Contacto
  email: {
    type: String,
    default: 'hola@luisgranero.com'
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: 'https://luisgranero.com'
  },
  
  // Redes sociales
  socialMedia: {
    linkedin: String,
    github: String,
    twitter: String,
    instagram: String
  },
  
  // Configuración de cookies
  cookieConsent: {
    enabled: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      default: 'Este sitio web utiliza cookies para mejorar tu experiencia de navegación.'
    }
  },
  
  // Google Analytics (opcional)
  analytics: {
    googleAnalyticsId: String,
    googleTagManagerId: String
  },
  
  // Timestamps
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para actualizar updatedAt
SiteSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);

export default SiteSettings;