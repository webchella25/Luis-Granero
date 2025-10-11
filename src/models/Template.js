// src/models/Template.js
import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp', 'sms'], required: true },
  subject: String, // Solo para emails
  body: { type: String, required: true },
  variables: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Template || mongoose.model('Template', TemplateSchema);