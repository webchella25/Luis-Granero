import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudioWorkspace extends Document {
  nombre: string;
  password_hash: string;
  creado_en: Date;
}

const StudioWorkspaceSchema = new Schema<IStudioWorkspace>({
  nombre: { type: String, required: true, trim: true },
  password_hash: { type: String, required: true },
  creado_en: { type: Date, default: Date.now },
});

const StudioWorkspace: Model<IStudioWorkspace> =
  mongoose.models.StudioWorkspace ||
  mongoose.model<IStudioWorkspace>('StudioWorkspace', StudioWorkspaceSchema);

export default StudioWorkspace;
