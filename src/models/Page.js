// models/Page.js
import mongoose from 'mongoose'

const PageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: Object, // Para contenido estructurado
    required: true
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Page || mongoose.model('Page', PageSchema)