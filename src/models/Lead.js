// src/models/Lead.js (NO .ts)
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
  placeId: { type: String, unique: true }, // Para evitar duplicados
  
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
    type: { type: String, enum: ['email', 'phone', 'meeting', 'note'] },
    notes: String,
    emailSubject: String,
    emailContent: String
  }],
  
  // Notas
  notes: String,
  
  // Tags
  tags: [String],
  
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
LeadSchema.index({ placeId: 1 }, { unique: true });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);