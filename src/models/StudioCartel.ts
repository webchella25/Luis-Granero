import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITextoCampo {
  texto: string;
  visible: boolean;
  color: string;
}

export interface ITextoCampoConSize extends ITextoCampo {
  size: number;
}

export interface ITextos {
  nombre_evento: ITextoCampoConSize;
  subtitulo: ITextoCampo;
  nombre_dj: ITextoCampoConSize;
  sesion: ITextoCampo;
  dress_code: ITextoCampo;
  info_extra: ITextoCampo;
  dia_semana: { texto: string; visible: boolean };
  dia_numero: string;
  mes: ITextoCampo;
  horario: { texto: string; visible: boolean };
  direccion: { texto: string; visible: boolean };
}

export interface IStudioCartel extends Document {
  // Campos originales
  dj_id: string;
  nombre_evento: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string | null;
  lugar: string;
  tematica: string;
  info_extra: string | null;
  generos: string;
  prompt_usuario: string;
  prompt_flux: string;
  color_principal: string;
  usar_foto_dj: boolean;
  url_qr: string | null;
  fondo_path: string | null;
  cartel_path: string | null;
  cartel_h_path: string | null;
  dj_foto_path: string | null;
  creado_en: Date;

  // Campos V2: estilo
  preset: string;
  fuente: string;
  color_acento: string;
  efecto_texto: string;
  overlay_intensidad: number;
  grano_intensidad: number;
  layout: string;

  // Campos V2: textos completos
  textos: ITextos | null;

  // Campos V2: posiciones y tamaños
  foto_dj_size: number;
  foto_dj_position_y: number;
  titulo_position_y: number;
  fecha_position_y: number;

  // Campos V2: assets
  logo_local_path: string | null;
  logo_dj_path: string | null;
  usar_logo_local: boolean;
  usar_logo_dj: boolean;
  canal_id?: string | null;
}

const TextoCampoSchema = {
  texto: { type: String, default: '' },
  visible: { type: Boolean, default: true },
  color: { type: String, default: '#FFFFFF' },
};

const TextoCampoConSizeSchema = {
  ...TextoCampoSchema,
  size: { type: Number, default: 160 },
};

const StudioCartelSchema = new Schema<IStudioCartel>({
  // Campos originales
  dj_id: { type: String, required: true },
  nombre_evento: { type: String, required: true, trim: true },
  fecha: { type: String, required: true },
  hora_inicio: { type: String, required: true },
  hora_fin: { type: String, default: null },
  lugar: { type: String, default: 'Cero Ocho Pub, C/ Obispo Pastor Pérez 8, Valencia' },
  tematica: { type: String, default: '' },
  info_extra: { type: String, default: null },
  generos: { type: String, default: '' },
  prompt_usuario: { type: String, default: '' },
  prompt_flux: { type: String, default: '' },
  color_principal: { type: String, default: '' },
  usar_foto_dj: { type: Boolean, default: true },
  url_qr: { type: String, default: null },
  fondo_path: { type: String, default: null },
  cartel_path: { type: String, default: null },
  cartel_h_path: { type: String, default: null },
  dj_foto_path: { type: String, default: null },
  creado_en: { type: Date, default: Date.now },

  // V2: estilo
  preset: { type: String, default: 'OSCURO_ELEGANTE' },
  fuente: { type: String, default: 'Bebas Neue' },
  color_acento: { type: String, default: '#FFD700' },
  efecto_texto: { type: String, default: 'Normal' },
  overlay_intensidad: { type: Number, default: 75 },
  grano_intensidad: { type: Number, default: 10 },
  layout: { type: String, default: 'CLASICO' },

  // V2: textos completos (null = usa campos legacy)
  textos: {
    type: new Schema({
      nombre_evento: { type: TextoCampoConSizeSchema, default: () => ({ texto: '', visible: true, color: '#FFD700', size: 160 }) },
      subtitulo:     { type: TextoCampoSchema, default: () => ({ texto: '', visible: false, color: '#FFFFFF' }) },
      nombre_dj:     { type: TextoCampoConSizeSchema, default: () => ({ texto: '', visible: true, color: '#FFFFFF', size: 130 }) },
      sesion:        { type: TextoCampoSchema, default: () => ({ texto: '', visible: true, color: '#DDDDDD' }) },
      dress_code:    { type: TextoCampoSchema, default: () => ({ texto: '', visible: true, color: '#FFD700' }) },
      info_extra:    { type: TextoCampoSchema, default: () => ({ texto: '', visible: false, color: '#FFFFFF' }) },
      dia_semana:    { type: { texto: String, visible: Boolean }, default: () => ({ texto: '', visible: true }) },
      dia_numero:    { type: String, default: '' },
      mes:           { type: TextoCampoSchema, default: () => ({ texto: '', visible: true, color: '#FFD700' }) },
      horario:       { type: { texto: String, visible: Boolean }, default: () => ({ texto: '', visible: true }) },
      direccion:     { type: { texto: String, visible: Boolean }, default: () => ({ texto: '', visible: true }) },
    }, { _id: false }),
    default: null,
  },

  // V2: posiciones
  foto_dj_size: { type: Number, default: 300 },
  foto_dj_position_y: { type: Number, default: 0 },
  titulo_position_y: { type: Number, default: 0 },
  fecha_position_y: { type: Number, default: 0 },

  // V2: assets flags
  logo_local_path: { type: String, default: null },
  logo_dj_path: { type: String, default: null },
  usar_logo_local: { type: Boolean, default: true },
  usar_logo_dj: { type: Boolean, default: true },
  canal_id: { type: String, index: true, default: null },
});

const StudioCartel: Model<IStudioCartel> =
  mongoose.models.StudioCartel || mongoose.model<IStudioCartel>('StudioCartel', StudioCartelSchema);

export default StudioCartel;
