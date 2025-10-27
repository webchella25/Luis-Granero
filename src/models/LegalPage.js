// src/models/LegalPage.js
import mongoose from 'mongoose';

const LegalPageSchema = new mongoose.Schema({
  // Tipo de página legal
  pageType: {
    type: String,
    enum: ['aviso-legal', 'privacidad', 'cookies', 'terminos'],
    required: true,
    unique: true
  },
  
  // Metadata
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  metaDescription: {
    type: String,
    default: ''
  },
  
  // Contenido (con variables que se reemplazan)
  content: {
    type: String,
    required: true
  },
  
  // Estado
  isPublished: {
    type: Boolean,
    default: true
  },
  
  // Tracking
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Índices
LegalPageSchema.index({ pageType: 1 });
LegalPageSchema.index({ slug: 1 });
LegalPageSchema.index({ isPublished: 1 });

// Middleware para actualizar lastUpdated
LegalPageSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const LegalPage = mongoose.models.LegalPage || mongoose.model('LegalPage', LegalPageSchema);

export default LegalPage;