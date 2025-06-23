// src/models/ContactPage.js
import mongoose from 'mongoose'

const contactPageSchema = new mongoose.Schema({
  hero: {
    title: String,
    subtitle: String,
    description: String
  },
  contactMethods: [{
    icon: String,
    title: String,
    description: String,
    action: String,
    link: String,
    highlight: Boolean
  }],
  calculator: {
    enabled: Boolean,
    title: String,
    description: String,
    services: [{
      name: String,
      basePrice: Number,
      priceRange: {
        min: Number,
        max: Number
      },
      options: [{
        name: String,
        price: Number,
        description: String
      }]
    }],
    addons: [{
      name: String,
      price: Number,
      description: String,
      category: String
    }],
    multipliers: [{
      name: String,
      factor: Number,
      description: String
    }]
  },
  contactInfo: {
    email: String,
    phone: String,
    location: String,
    availability: String,
    responseTime: String,
    languages: [String]
  },
  socialLinks: [{
    platform: String,
    url: String,
    icon: String
  }],
  faq: [{
    question: String,
    answer: String,
    category: String
  }],
  leadMagnet: {
    enabled: Boolean,
    title: String,
    description: String,
    downloadUrl: String,
    ctaText: String
  }
}, {
  timestamps: true
})

export default mongoose.models.ContactPage || mongoose.model('ContactPage', contactPageSchema)