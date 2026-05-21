// src/models/Project.js - CORREGIDO SIN ÍNDICE DUPLICADO
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true // 🔥 SOLO aquí, NO en schema.index()
  },
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  image: String, // Compatibilidad con proyectos antiguos
  images: [String], // 🔥 Array de URLs de Cloudinary
  category: {
    type: String,
    required: true,
    enum: ['ecommerce', 'webapp', 'dashboard', 'landing', 'api', 'mobile', 'saas']
  },
  technologies: [String],
  features: [String],
  metrics: {
    performanceImprovement: String,
    loadTimeReduction: String,
    conversionIncrease: String,
    userSatisfaction: String,
    completionTime: String,
    budget: String
  },
  urls: {
    live: String,
    github: String,
    case_study: String
  },
  status: {
    type: String,
    enum: ['En producción', 'En desarrollo', 'Finalizado', 'Pausado', 'Mantenimiento'],
    default: 'Finalizado'
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  client: {
    name: String,
    company: String,
    testimonial: String
  },
  codeSnippet: String,
  results: String,
  challenges: [String],
  learnings: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOwnProject: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// 🔥 ÍNDICES (sin slug porque ya tiene unique: true arriba)
projectSchema.index({ category: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ isPublished: 1 });
projectSchema.index({ isActive: 1 });
projectSchema.index({ orderIndex: 1 });

// 🔥 Virtual para obtener la imagen principal
projectSchema.virtual('mainImage').get(function() {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
  return this.image || null;
});

// 🔥 Asegurar que virtuals se incluyan en JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);