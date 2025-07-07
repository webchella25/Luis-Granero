// src/models/Package.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  name: String,
  description: String,
  price: String,
  duration: String,
  color: String,
  popular: { type: Boolean, default: false },
  features: [String],
  technologies: [String],
  ideal: String,
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Package || mongoose.model('Package', packageSchema);