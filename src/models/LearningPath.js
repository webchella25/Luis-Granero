// src/models/LearningPath.js
import mongoose from 'mongoose';

const LearningPathSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🎓'
  },
  
  // Learning details
  duration: {
    type: String,
    default: '4 semanas'
  },
  level: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Principiante → Avanzado', 'Intermedio → Avanzado'],
    default: 'Intermedio'
  },
  topics: [{
    type: String
  }],
  prerequisites: [{
    type: String
  }],
  learningObjectives: [{
    type: String
  }],
  
  // Articles/lessons
  articles: [{
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost'
    },
    order: {
      type: Number,
      required: true
    },
    title: String,
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Stats
  enrollments: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Timestamps
  publishedAt: Date,
  
}, {
  timestamps: true
});

// Índices para búsquedas
LearningPathSchema.index({ slug: 1 });
LearningPathSchema.index({ isPublished: 1, isFeatured: -1 });
LearningPathSchema.index({ topics: 1 });
LearningPathSchema.index({ level: 1 });

// Virtual para obtener número total de artículos
LearningPathSchema.virtual('totalArticles').get(function() {
  return this.articles ? this.articles.length : 0;
});

// Método para ordenar artículos
LearningPathSchema.methods.sortArticles = function() {
  this.articles.sort((a, b) => a.order - b.order);
  return this.articles;
};

export default mongoose.models.LearningPath || mongoose.model('LearningPath', LearningPathSchema);