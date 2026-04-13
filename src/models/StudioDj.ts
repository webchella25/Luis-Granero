import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioDj extends Document {
  nombre: string;
  logo_path: string | null;
  fotos: string[];
  creado_en: Date;
  workspace_id?: string | null;
}

const StudioDjSchema = new Schema<IStudioDj>({
  nombre: { type: String, required: true, trim: true },
  logo_path: { type: String, default: null },
  fotos: { type: [String], default: [] },
  creado_en: { type: Date, default: Date.now },
  workspace_id: { type: String, index: true, default: null },
});

const StudioDj: Model<IStudioDj> =
  mongoose.models.StudioDj || mongoose.model<IStudioDj>('StudioDj', StudioDjSchema);

export default StudioDj;
