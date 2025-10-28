// src/models/Project.js - VERSIÓN MEJORADA
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true
    // NO ponemos unique: true aquí para evitar duplicado
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
  image: String, // Emoji o URL
  category: {
    type: String,
    required: true,
    enum: ['ecommerce', 'webapp', 'dashboard', 'landing', 'api', 'mobile']
  },
  technologies: [String],
  features: [String],
  
  // ✅ CAMBIO: Metrics como objeto flexible
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  urls: {
    live: String,
    github: String,
    case_study: String
  },
  status: {
    type: String,
    enum: ['En producción', 'En desarrollo', 'Finalizado', 'Pausado'],
    default: 'Finalizado'
  },
  year: Number,
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
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// ✅ ÍNDICES DEFINIDOS UNA SOLA VEZ
projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ category: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ orderIndex: 1 });
projectSchema.index({ isActive: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);