// src/models/Project.js - Portfolio de proyectos
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
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
  image: String, // Emoji o URL
  category: {
    type: String,
    required: true,
    enum: ['ecommerce', 'webapp', 'dashboard', 'landing', 'api', 'mobile']
  },
  technologies: [String],
  features: [String],
  metrics: [{
    key: String,
    value: String,
    label: String
  }],
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
  codeSnippet: String, // Código destacado del proyecto
  results: String, // Resultados obtenidos
  challenges: [String], // Desafíos técnicos
  learnings: [String], // Aprendizajes del proyecto
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

projectSchema.index({ category: 1 });
projectSchema.index({ isFeatured: 1 });
projectSchema.index({ orderIndex: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);