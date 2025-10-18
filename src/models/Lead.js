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
    sparse: true,
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
  placeId: {
    type: String,
    sparse: true
  },
  
  // Google Search specific
  seoPosition: Number, // Posición en Google Search
  domain: String, // Dominio extraído de la URL
  description: String, // Meta description o snippet
  
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
  searchQuery: String, // Query usada para encontrar este lead
  
  // Notes & history
  notes: String,
  contactHistory: [{
    date: Date,
    type: {
      type: String,
      enum: ['email', 'call', 'meeting', 'message', 'other']
    },
    notes: String,
    emailSubject: String
  }],
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Tags
  tags: [String],
  
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
}, {
  timestamps: true
});

// Indexes
leadSchema.index({ email: 1 }, { sparse: true });
leadSchema.index({ phone: 1 }, { sparse: true });
leadSchema.index({ placeId: 1 }, { sparse: true });
leadSchema.index({ username: 1, source: 1 }, { sparse: true }); // Instagram username único por source
leadSchema.index({ status: 1 });
leadSchema.index({ opportunityScore: -1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual para el nombre completo del negocio
leadSchema.virtual('displayName').get(function() {
  return this.name || this.username || 'Sin nombre';
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);