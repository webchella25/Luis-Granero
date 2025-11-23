// src/models/Settings.js
import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Luis Granero' },
  siteDescription: { type: String },
  siteUrl: { type: String },
  socialMedia: {
    twitter: String,
    linkedin: String,
    github: String
  },
  seo: {
    defaultTitle: String,
    defaultDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);