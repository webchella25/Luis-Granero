// src/models/EmailTemplate.js - NUEVO ARCHIVO
import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['prospecting', 'follow-up', 'proposal', 'appointment', 'general'],
    default: 'general'
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);