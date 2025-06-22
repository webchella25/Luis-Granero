// models/Project.js
import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  technologies: [String],
  images: [String],
  demoUrl: String,
  githubUrl: String,
  clientName: String,
  category: {
    type: String,
    enum: ['web-app', 'ecommerce', 'landing', 'dashboard', 'api'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  metrics: {
    performanceImprovement: String,
    loadTimeReduction: String,
    conversionIncrease: String
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)