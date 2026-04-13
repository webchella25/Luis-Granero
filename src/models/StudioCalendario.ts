import mongoose, { Schema, Document, Model } from 'mongoose';

export type CategoriaVideo = 'asesino_serie' | 'dictador' | 'secta' | 'criminal_historico' | 'psicopata' | 'misterio';
export type NivelBusquedas = 'alto' | 'medio';

export interface ICalendarioEntry {
  _id?: string;
  semana: number;
  personaje: string;
  titulo: string;
  categoria: CategoriaVideo;
  busquedas: NivelBusquedas;
  epoca: string;
  fecha_publicacion?: Date | null;
  completado?: boolean;
  script_id?: string;
  orden: number;
}

export interface IStudioCalendario extends Document {
  entries: ICalendarioEntry[];
  generado_en: Date;
  actualizado_en: Date;
  canal_id?: string | null;
}

const CalendarioEntrySchema = new Schema<ICalendarioEntry>(
  {
    semana: { type: Number, required: true },
    personaje: { type: String, required: true },
    titulo: { type: String, required: true },
    categoria: {
      type: String,
      required: true,
      enum: ['asesino_serie', 'dictador', 'secta', 'criminal_historico', 'psicopata', 'misterio'],
    },
    busquedas: { type: String, required: true, enum: ['alto', 'medio'] },
    epoca: { type: String, required: true },
    fecha_publicacion: { type: Date, default: null },
    completado: { type: Boolean, default: false },
    script_id: { type: String },
    orden: { type: Number, required: true },
  },
  { _id: true }
);

const StudioCalendarioSchema = new Schema<IStudioCalendario>({
  entries: { type: [CalendarioEntrySchema], default: [] },
  generado_en: { type: Date, default: Date.now },
  actualizado_en: { type: Date, default: Date.now },
  canal_id: { type: String, index: true, default: null },
});

const StudioCalendario: Model<IStudioCalendario> =
  mongoose.models.StudioCalendario ||
  mongoose.model<IStudioCalendario>('StudioCalendario', StudioCalendarioSchema);

export default StudioCalendario;
