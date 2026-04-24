import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TextoOverlay {
  activo: boolean;
  linea1: string;
  linea2: string;
  color: string;
  posicion: 'top' | 'center' | 'bottom';
}

export interface IStudioMusicaAmbiental extends Document {
  canal_id: string;
  workspace_id: string;
  mood: string;
  prompt_flux: string;
  imagen_path: string;
  musica_path: string;
  musica_nombre: string;
  duracion_horas: number;
  efectos: string[];
  titulo: string;
  descripcion: string;
  texto_overlay: TextoOverlay | null;
  video_path: string | null;
  youtube_id: string | null;
  youtube_url: string | null;
  estado: 'pendiente' | 'generando_video' | 'listo' | 'error';
  error_msg: string | null;
  scheduled_at: Date | null;
  creado_en: Date;
}

const TextoOverlaySchema = new Schema<TextoOverlay>({
  activo: { type: Boolean, default: false },
  linea1: { type: String, default: '' },
  linea2: { type: String, default: '' },
  color: { type: String, default: '#ffffff' },
  posicion: { type: String, enum: ['top', 'center', 'bottom'], default: 'bottom' },
}, { _id: false });

const StudioMusicaAmbientalSchema = new Schema<IStudioMusicaAmbiental>({
  canal_id: { type: String, required: true, index: true },
  workspace_id: { type: String, required: true, index: true },
  mood: { type: String, required: true },
  prompt_flux: { type: String, default: '' },
  imagen_path: { type: String, default: '' },
  musica_path: { type: String, default: '' },
  musica_nombre: { type: String, default: '' },
  duracion_horas: { type: Number, default: 1 },
  efectos: { type: [String], default: [] },
  titulo: { type: String, default: '' },
  descripcion: { type: String, default: '' },
  texto_overlay: { type: TextoOverlaySchema, default: null },
  video_path: { type: String, default: null },
  youtube_id: { type: String, default: null },
  youtube_url: { type: String, default: null },
  estado: {
    type: String,
    enum: ['pendiente', 'generando_video', 'listo', 'error'],
    default: 'pendiente',
  },
  error_msg: { type: String, default: null },
  scheduled_at: { type: Date, default: null },
  creado_en: { type: Date, default: Date.now },
});

const StudioMusicaAmbiental: Model<IStudioMusicaAmbiental> =
  mongoose.models.StudioMusicaAmbiental ||
  mongoose.model<IStudioMusicaAmbiental>('StudioMusicaAmbiental', StudioMusicaAmbientalSchema);

export default StudioMusicaAmbiental;
