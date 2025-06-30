// src/models/FAQ.js - Preguntas frecuentes
import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['General', 'Técnico', 'Proceso', 'Pricing', 'Soporte']
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  tags: [String],
  orderIndex: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  helpfulness: {
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);