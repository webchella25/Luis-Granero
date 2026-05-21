// src/models/Purchase.js
import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true,
  },
  courseSlug: String,
  courseTitle: String,
  amount: Number, // en céntimos
  currency: { type: String, default: 'eur' },
  stripeSessionId: { type: String, unique: true },
  stripePaymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending',
  },
  paidAt: Date,
}, { timestamps: true });

PurchaseSchema.index({ email: 1, courseId: 1 });

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
