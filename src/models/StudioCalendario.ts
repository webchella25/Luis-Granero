import mongoose, { Schema, Document, Model } from 'mongoose';

export type CategoriaVideo = string;
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
  aniversario?: { fecha: string; descripcion: string } | null;
  competencia_analysis?: {
    score_oportunidad: number;
    angulo_unico: string;
    titulos_sugeridos: string[];
    analizado_en: Date;
  } | null;
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
    },
    busquedas: { type: String, required: true, enum: ['alto', 'medio'] },
    epoca: { type: String, required: true },
    fecha_publicacion: { type: Date, default: null },
    completado: { type: Boolean, default: false },
    script_id: { type: String },
    orden: { type: Number, required: true },
    aniversario: { type: Schema.Types.Mixed, default: null },
    competencia_analysis: { type: Schema.Types.Mixed, default: null },
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
