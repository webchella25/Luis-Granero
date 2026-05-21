// src/models/Service.js - Servicios ofrecidos
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  description: {
    type: String,
    required: true
  },
  icon: String,
  color: String, // Gradiente CSS
  features: [String],
  technologies: [String],
  examples: [String],
  pricing: {
    startingPrice: String,
    priceRange: {
      min: Number,
      max: Number
    }
  },
  deliveryTime: String,
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// slug tiene unique:true, su índice se crea automáticamente
serviceSchema.index({ orderIndex: 1 });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);