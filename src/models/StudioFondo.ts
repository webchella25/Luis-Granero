import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioFondo extends Document {
  path: string;       // /studio/carteles/fondos/{id}.jpg
  prompt: string;     // prompt FLUX completo usado para generarlo
  used_count: number; // veces reutilizado desde la galería
  created_at: Date;
  canal_id?: string | null;
}

const StudioFondoSchema = new Schema<IStudioFondo>({
  path: { type: String, required: true },
  prompt: { type: String, default: '' },
  used_count: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  canal_id: { type: String, index: true, default: null },
});

const StudioFondo: Model<IStudioFondo> =
  mongoose.models.StudioFondo || mongoose.model<IStudioFondo>('StudioFondo', StudioFondoSchema);

export default StudioFondo;
