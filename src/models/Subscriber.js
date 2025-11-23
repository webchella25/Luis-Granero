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
    default: 'react-5-dias'
  },

  // Tracking de emails enviados por día
  emailsSent: {
    day1: { sent: { type: Boolean, default: false }, sentAt: Date },
    day2: { sent: { type: Boolean, default: false }, sentAt: Date },
    day3: { sent: { type: Boolean, default: false }, sentAt: Date },
    day4: { sent: { type: Boolean, default: false }, sentAt: Date },
    day5: { sent: { type: Boolean, default: false }, sentAt: Date }
  },

  currentDay: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['active', 'completed', 'unsubscribed'],
    default: 'active'
  },

  subscribedAt: {
    type: Date,
    default: Date.now
  },

  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true
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
SubscriberSchema.index({ status: 1, currentDay: 1 })
SubscriberSchema.index({ subscribedAt: -1 })

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema)
