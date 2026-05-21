import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioAmbientTrack extends Document {
  canal_id: string;
  workspace_id: string;
  nombre: string;
  archivo_path: string;
  duracion_segundos: number;
  uses: number;
  creado_en: Date;
}

const StudioAmbientTrackSchema = new Schema<IStudioAmbientTrack>({
  canal_id: { type: String, required: true, index: true },
  workspace_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  archivo_path: { type: String, required: true },
  duracion_segundos: { type: Number, default: 0 },
  uses: { type: Number, default: 0 },
  creado_en: { type: Date, default: Date.now },
});

const StudioAmbientTrack: Model<IStudioAmbientTrack> =
  mongoose.models.StudioAmbientTrack ||
  mongoose.model<IStudioAmbientTrack>('StudioAmbientTrack', StudioAmbientTrackSchema);

export default StudioAmbientTrack;
