// src/models/Lead.js - ACTUALIZACIÓN COMPLETA
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contacto
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: String,
  
  // Web & Social
  website: String,
  username: { 
    type: String, 
    trim: true
  }, // Instagram/Twitter username
  bio: String, // Instagram bio
  followers: Number, // Instagram followers
  posts: Number, // Instagram posts count
  isVerified: Boolean, // Instagram verified
  profilePicUrl: String, // Instagram profile picture
  
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
  
  // Business info
  category: String,
  rating: Number,
  reviewCount: Number,
  
  // Google Maps specific
  placeId: String,
  
  // Google Search specific
  seoPosition: Number,
  domain: String,
  description: String,
  
  // Web analysis
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
  
  // Lead scoring
  opportunityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // Possible emails
  possibleEmails: [String],
  
  // Status & workflow
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing'],
    default: 'new'
  },
  
  // Source tracking
  source: {
    type: String,
    enum: ['google_maps', 'google_search', 'instagram', 'linkedin', 'manual', 'referral', 'other'],
    default: 'manual'
  },
  searchQuery: String,
  
  // Notes & history
  notes: String,
  
  // ✅ NUEVO: Historial de contacto mejorado
  contactHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'instagram_dm', 'whatsapp', 'other'],
      default: 'other'
    },
    channel: {
      type: String,
      enum: ['email', 'phone', 'instagram', 'whatsapp', 'in_person', 'other'],
      default: 'other'
    },
    subject: String,
    notes: String,
    outcome: {
      type: String,
      enum: ['success', 'no_response', 'interested', 'not_interested', 'follow_up', 'other'],
      default: 'other'
    },
    // ✅ NUEVO: Para plantillas de Instagram
    templateUsed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageTemplate'
    },
    templateName: String,
    messageContent: String, // El mensaje enviado
    responded: {
      type: Boolean,
      default: false
    },
    responseDate: Date,
    responseContent: String
  }],
  
  // Tags personalizados
  tags: [String],
  
  // Asignación
  assignedTo: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: Date
});

// Índices
leadSchema.index({ source: 1, status: 1 });
leadSchema.index({ opportunityScore: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ status: 1 });
leadSchema.index({ username: 1, source: 1 });

// Actualizar updatedAt automáticamente
leadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);