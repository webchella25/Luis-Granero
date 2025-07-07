// src/models/Addon.js
import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: String,
  price: String,
  description: String,
  category: {
    type: String,
    enum: ['seo', 'features', 'admin', 'integrations', 'mobile', 'support']
  },
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Addon || mongoose.model('Addon', addonSchema);