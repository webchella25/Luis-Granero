// src/models/Lead.js - ACTUALIZADO CON CAMPOS DE TRACKING
import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  // Datos del negocio
  name: { type: String, required: true },
  address: String,
  phone: String,
  website: String,
  rating: Number,
  reviewCount: Number,
  category: String,
  placeId: String,
  
  // Análisis web
  webAnalysis: {
    score: Number,
    loadTime: Number,
    issues: [String],
    hasMobile: Boolean,
    hasSSL: Boolean,
    technology: String,
    hasEmail: Boolean,
    emails: [String]
  },
  
  // Emails posibles
  possibleEmails: [String],
  
  // Redes sociales
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  
  // Score de oportunidad
  opportunityScore: { type: Number, default: 0 },
  
  // Estado del lead
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'rejected', 'client'],
    default: 'new'
  },
  
  // Historial de contacto
  contactHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'whatsapp', 'meeting', 'note'] },
    notes: String,
    emailSubject: String,
    emailContent: String
  }],
  
  // Notas
  notes: String,
  
  // Tags
  tags: [String],
  
  // ===== 🆕 CAMPOS NUEVOS PARA TRACKING =====
  
  // Última interacción con el lead
  lastInteraction: Date,
  
  // Tipo de última interacción
  lastInteractionType: {
    type: String,
    enum: ['email_sent', 'email_opened', 'email_clicked', 'phone_call', 'whatsapp', 'meeting', 'note']
  },
  
  // Si el usuario se dio de baja
  unsubscribed: {
    type: Boolean,
    default: false
  },
  
  // Si marcó el email como spam o pidió no ser contactado
  doNotContact: {
    type: Boolean,
    default: false
  },
  
  // ===== FIN CAMPOS NUEVOS =====
  
  // Metadata
  source: { type: String, default: 'google_maps' },
  searchQuery: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
LeadSchema.index({ name: 'text', address: 'text', category: 'text' });
LeadSchema.index({ status: 1, opportunityScore: -1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ placeId: 1 }, { unique: true, sparse: true });
LeadSchema.index({ lastInteraction: -1 }); // 🆕 Índice para ordenar por última interacción
LeadSchema.index({ unsubscribed: 1, doNotContact: 1 }); // 🆕 Índice para filtrar usuarios válidos

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);