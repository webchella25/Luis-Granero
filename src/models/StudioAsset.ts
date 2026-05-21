import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioAsset extends Document {
  tipo: 'logo_local' | 'logo_dj' | 'foto_dj';
  nombre: string;
  dj_id: string | null;
  archivo_path: string;
  creado_en: Date;
}

const StudioAssetSchema = new Schema<IStudioAsset>({
  tipo: { type: String, enum: ['logo_local', 'logo_dj', 'foto_dj'], required: true },
  nombre: { type: String, required: true, trim: true },
  dj_id: { type: String, default: null },
  archivo_path: { type: String, required: true },
  creado_en: { type: Date, default: Date.now },
});

const StudioAsset: Model<IStudioAsset> =
  mongoose.models.StudioAsset || mongoose.model<IStudioAsset>('StudioAsset', StudioAssetSchema);

export default StudioAsset;
