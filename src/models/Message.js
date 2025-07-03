// src/models/Message.js - MODELO BÁSICO
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: String,
  message: {
    type: String,
    required: true
  },
  phone: String,
  company: String,
  budget: String,
  projectType: String,
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  response: String,
  respondedAt: Date
}, {
  timestamps: true
});

export default mongoose.models.Message || mongoose.model('Message', messageSchema);