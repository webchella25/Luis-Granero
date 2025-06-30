// src/models/SiteConfig.js - Configuración del sitio
import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed, // Permite cualquier tipo de dato
  description: String,
  category: {
    type: String,
    enum: ['general', 'homepage', 'seo', 'contact', 'social', 'analytics', 'blog'],
    default: 'general'
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    default: 'string'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);