// src/models/Lead.js - VERSIÓN CORREGIDA
import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  // Datos del negocio
  name: { type: String, required: true },
  companyName: String, // ← AÑADIDO
  address: String,
  location: String, // ← AÑADIDO
  phone: String, // Teléfono principal (legacy)
  phoneNumbers: [String], // ← AÑADIDO - Array de teléfonos
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
    isResponsive: Boolean, // ← AÑADIDO
    technology: String,
    technologies: [String], // ← AÑADIDO
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
    enum: ['new', 'contacted', 'interested', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'rejected', 'client'],
    default: 'new'
  },
  
  // Historial de contacto
  contactHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'whatsapp', 'meeting', 'note'] },
    notes: String,
    subject: String, // ← AÑADIDO para emails
    emailSubject: String, // legacy
    emailContent: String
  }],
  
  // Notas
  notes: String,
  
  // Tags
  tags: [String],
  
  // Metadata
  source: { type: String, default: 'google_maps' },
  searchQuery: String,
  campaign: String, // ← AÑADIDO
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

// Middleware: Si existe phone pero no phoneNumbers, migrar
LeadSchema.pre('save', function(next) {
  if (this.phone && (!this.phoneNumbers || this.phoneNumbers.length === 0)) {
    this.phoneNumbers = [this.phone];
  }
  next();
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);