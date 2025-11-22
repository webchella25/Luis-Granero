// src/models/Subscriber.js
import mongoose from 'mongoose'

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    enum: ['react-5-dias', 'newsletter', 'nextjs-avanzado']
  },
  source: {
    type: String,
    default: 'website'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  
  // Tracking de emails
  emailsSent: [{
    subject: String,
    sentAt: Date,
    opened: Boolean,
    openedAt: Date,
    clicked: Boolean,
    clickedAt: Date
  }],
  
  // Progreso (opcional para futuro)
  progress: {
    currentDay: {
      type: Number,
      default: 0
    },
    completedLessons: [{
      type: Number
    }],
    lastActivity: Date
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
  
}, {
  timestamps: true
})

// Índices
SubscriberSchema.index({ email: 1, course: 1 }, { unique: true })
SubscriberSchema.index({ status: 1 })
SubscriberSchema.index({ subscribedAt: -1 })

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema)