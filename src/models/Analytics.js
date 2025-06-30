// src/models/Analytics.js - Estadísticas del sitio
import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  traffic: {
    totalVisits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    avgSessionDuration: { type: Number, default: 0 } // en segundos
  },
  devices: {
    mobile: { type: Number, default: 0 },
    desktop: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  sources: {
    direct: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    email: { type: Number, default: 0 }
  },
  pages: [{
    path: String,
    views: Number,
    uniqueViews: Number,
    avgTime: Number
  }],
  conversions: {
    contactForms: { type: Number, default: 0 },
    projectInquiries: { type: Number, default: 0 },
    downloadResume: { type: Number, default: 0 },
    socialClicks: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

analyticsSchema.index({ date: -1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);