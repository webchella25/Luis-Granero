// src/models/Testimonial.js - Testimonios de clientes
import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  client: {
    name: {
      type: String,
      required: true
    },
    company: String,
    role: String,
    avatar: String,
    linkedin: String
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  project: {
    name: String,
    category: String,
    url: String
  },
  metrics: [{
    key: String, // 'performance', 'sales', 'conversions'
    value: String, // '+40%', '98/100', '1.1s'
    label: String // 'Performance', 'Ventas', 'Tiempo de carga'
  }],
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);