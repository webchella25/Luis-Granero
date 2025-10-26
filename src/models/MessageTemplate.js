// src/models/MessageTemplate.js
import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Contenido del mensaje
  subject: {
    type: String,
    trim: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Metadata
  category: {
    type: String,
    enum: ['presentacion', 'propuesta', 'seguimiento', 'oferta', 'otro'],
    default: 'presentacion'
  },
  
  // Para qué tipo de leads es esta plantilla
  targetSource: {
    type: String,
    enum: ['instagram', 'google_maps', 'google_search', 'all'],
    default: 'all'
  },
  
  // Estadísticas de uso
  usageCount: {
    type: Number,
    default: 0
  },
  
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Control
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Variables disponibles en esta plantilla
  // Ejemplo: ['nombre', 'username', 'categoria', 'ubicacion', 'followers']
  availableVariables: [{
    type: String
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar updatedAt automáticamente
messageTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Índices
messageTemplateSchema.index({ category: 1, isActive: 1 });
messageTemplateSchema.index({ targetSource: 1 });

export default mongoose.models.MessageTemplate || mongoose.model('MessageTemplate', messageTemplateSchema);
