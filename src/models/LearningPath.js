// src/models/LearningPath.js
import mongoose from 'mongoose'

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
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
  duration: {
    type: String, // "8 semanas", "2 meses"
    required: true
  },
  level: {
    type: String,
    enum: ['Principiante', 'Intermedio', 'Avanzado', 'Principiante → Intermedio', 'Intermedio → Avanzado', 'Principiante → Avanzado'],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  topics: [{
    type: String,
    required: true
  }],
  articles: [{
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    order: {
      type: Number,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  prerequisites: [String],
  learningObjectives: [String],
  estimatedHours: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#06B6D4'
  },
  icon: {
    type: String,
    default: '🎯'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrollments: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Generar slug automáticamente
learningPathSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
  }
  next()
})

export default mongoose.models.LearningPath || mongoose.model('LearningPath', learningPathSchema)