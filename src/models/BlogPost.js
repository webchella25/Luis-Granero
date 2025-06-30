// src/models/BlogPost.js - Posts del blog (actualizado)
import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: String,
  category: {
    type: String,
    required: true
  },
  tags: [String],
  author: {
    name: { type: String, default: 'Luis Granero' },
    bio: String,
    avatar: String
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  readingTime: {
    type: Number,
    default: 5
  },
  difficulty: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado'],
    default: 'Intermedio'
  },
  codeLanguages: [String], // ['javascript', 'react', 'css']
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  lastModified: Date
}, {
  timestamps: true
});

// Índices para búsqueda y performance
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ isFeatured: 1 });
blogPostSchema.index({ status: 1 });

// Auto-generar slug si no existe
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);