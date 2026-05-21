import mongoose, { Schema, Document, Model } from 'mongoose';

export type MusicCategory = 'hook' | 'intro' | 'desarrollo' | 'profundizacion' | 'perspectiva' | 'reflexion';

export interface IStudioMusicTrack extends Document {
  canal_id: string;
  nombre: string;
  categoria: MusicCategory;
  archivo_path: string;
  duracion_segundos: number;
  uses: number;
  ultimo_uso: Date | null;
  creado_en: Date;
}

const StudioMusicTrackSchema = new Schema<IStudioMusicTrack>({
  canal_id: { type: String, required: true, index: true },
  nombre: { type: String, required: true, trim: true },
  categoria: {
    type: String,
    required: true,
    enum: ['hook', 'intro', 'desarrollo', 'profundizacion', 'perspectiva', 'reflexion'],
  },
  archivo_path: { type: String, required: true },
  duracion_segundos: { type: Number, required: true, default: 0 },
  uses: { type: Number, default: 0 },
  ultimo_uso: { type: Date, default: null },
  creado_en: { type: Date, default: Date.now },
});

const StudioMusicTrack: Model<IStudioMusicTrack> =
  mongoose.models.StudioMusicTrack ||
  mongoose.model<IStudioMusicTrack>('StudioMusicTrack', StudioMusicTrackSchema);

export default StudioMusicTrack;
