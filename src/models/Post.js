// src/models/Post.js
import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  featuredImage: String,
  author: {
    type: String,
    default: 'Luis Granero'
  },
  readTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
})

// Índices para búsqueda
PostSchema.index({ title: 'text', content: 'text' })
PostSchema.index({ tags: 1 })
PostSchema.index({ category: 1 })
PostSchema.index({ publishDate: -1 })

export default mongoose.models.Post || mongoose.model('Post', PostSchema)