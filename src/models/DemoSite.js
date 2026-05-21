// src/models/DemoSite.js
import mongoose from 'mongoose';

const demoSiteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },

  // Datos del negocio capturados al generar la demo
  businessName: { type: String, required: true },
  sector: {
    type: String,
    enum: ['restaurant', 'beauty', 'health', 'shop', 'service', 'generic'],
    default: 'generic'
  },
  category: String,
  address: String,
  phone: String,
  email: String,
  description: String,
  rating: Number,
  reviewCount: Number,
  profilePicUrl: String,
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String
  },

  // Colores del tema
  primaryColor: { type: String, default: '#0ea5e9' },
  secondaryColor: { type: String, default: '#0f172a' },

  // Tracking de visitas
  visitCount: { type: Number, default: 0 },
  firstVisitedAt: Date,
  lastVisitedAt: Date,
  visitIps: [String],

  // Estado
  isActive: { type: Boolean, default: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  },

  createdAt: { type: Date, default: Date.now }
});

demoSiteSchema.index({ leadId: 1 });
demoSiteSchema.index({ expiresAt: 1 });

export default mongoose.models.DemoSite || mongoose.model('DemoSite', demoSiteSchema);
