// src/models/EmailCourse.js
import mongoose from 'mongoose'

const EmailCourseSchema = new mongoose.Schema({
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
  shortDescription: String,

  // Configuración visual
  icon: {
    type: String,
    default: '📧'
  },
  color: {
    type: String,
    default: 'cyan'
  },

  // Contenido del curso
  totalDays: {
    type: Number,
    required: true,
    default: 5
  },

  emails: [{
    day: Number,
    subject: String,
    htmlContent: String,
    previewText: String
  }],

  // Landing page content
  benefits: [String],
  whatYouLearn: [String],
  testimonials: [{
    name: String,
    text: String,
    avatar: String
  }],

  // CTA y conversión
  ctaText: {
    type: String,
    default: 'Comenzar Gratis'
  },

  // Configuración de envío
  sendTime: {
    type: String,
    default: '09:00' // Hora del día para enviar
  },

  // Estado
  isActive: {
    type: Boolean,
    default: true
  },

  // Estadísticas
  stats: {
    totalSubscribers: { type: Number, default: 0 },
    activeSubscribers: { type: Number, default: 0 },
    completedSubscribers: { type: Number, default: 0 },
    unsubscribeRate: { type: Number, default: 0 }
  }

}, {
  timestamps: true
})

export default mongoose.models.EmailCourse || mongoose.model('EmailCourse', EmailCourseSchema)
