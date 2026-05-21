import mongoose, { Schema, Document, Model } from 'mongoose';

export interface YoutubeTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number; // timestamp ms
  scope: string;
}

export interface IStudioConfig extends Document {
  key: string;
  data: YoutubeTokens | Record<string, unknown>;
  updated_at: Date;
}

const StudioConfigSchema = new Schema<IStudioConfig>({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  updated_at: { type: Date, default: Date.now },
});

const StudioConfig: Model<IStudioConfig> =
  mongoose.models.StudioConfig ||
  mongoose.model<IStudioConfig>('StudioConfig', StudioConfigSchema);

export default StudioConfig;
