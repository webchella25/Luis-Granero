// src/models/Proposal.js
import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  token: { type: String, required: true, unique: true },
  businessName: String,

  // Precio y condiciones configuradas al generar
  price: { type: String, default: '1.500€ – 3.000€' },
  deliveryDays: { type: Number, default: 21 },

  // Tracking
  visitCount: { type: Number, default: 0 },
  lastVisitedAt: Date,
  accepted: { type: Boolean, default: false },
  acceptedAt: Date,

  isActive: { type: Boolean, default: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días
  },
  createdAt: { type: Date, default: Date.now }
});

proposalSchema.index({ leadId: 1 });

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);
