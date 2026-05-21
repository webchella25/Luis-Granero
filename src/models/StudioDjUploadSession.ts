import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DjSessionOutputFormat, DjSessionVisibility } from '@/models/StudioDjSession';

export type DjUploadStatus =
  | 'initiated'
  | 'uploading'
  | 'completed'
  | 'error'
  | 'cancelled'
  | 'failed'
  | 'expired';

export interface IStudioDjUploadSession extends Document {
  workspace_id: string;
  canal_id: string;
  upload_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  chunk_size: number;
  total_chunks: number;
  received_chunks: number[];
  received_bytes: number;
  status: DjUploadStatus;
  error: string | null;
  final_session_id: string | null;
  expires_at: Date;
  last_activity_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
  failed_at: Date | null;
  expired_at: Date | null;
  titulo: string;
  descripcion: string;
  genre: string;
  output_format: DjSessionOutputFormat;
  bpm: number | null;
  tags: string[];
  tracklist: string;
  visibility: DjSessionVisibility;
  scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const StudioDjUploadSessionSchema = new Schema<IStudioDjUploadSession>(
  {
    workspace_id: { type: String, required: true, index: true },
    canal_id: { type: String, required: true, index: true },
    upload_id: { type: String, required: true, unique: true, index: true },
    filename: { type: String, required: true },
    mime_type: { type: String, default: 'application/octet-stream' },
    file_size: { type: Number, required: true },
    chunk_size: { type: Number, required: true },
    total_chunks: { type: Number, required: true },
    received_chunks: { type: [Number], default: [] },
    received_bytes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['initiated', 'uploading', 'completed', 'error', 'cancelled', 'failed', 'expired'],
      default: 'initiated',
      index: true,
    },
    error: { type: String, default: null },
    final_session_id: { type: String, default: null },
    expires_at: { type: Date, required: true, index: true },
    last_activity_at: { type: Date, required: true, index: true },
    completed_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    failed_at: { type: Date, default: null },
    expired_at: { type: Date, default: null },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    genre: { type: String, default: '' },
    output_format: { type: String, enum: ['16:9', '9:16', '1:1'], default: '16:9' },
    bpm: { type: Number, default: null },
    tags: { type: [String], default: [] },
    tracklist: { type: String, default: '' },
    visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'unlisted' },
    scheduled_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

StudioDjUploadSessionSchema.index({ workspace_id: 1, canal_id: 1, created_at: -1 });
StudioDjUploadSessionSchema.index({ status: 1, expires_at: 1 });

const StudioDjUploadSession: Model<IStudioDjUploadSession> =
  mongoose.models.StudioDjUploadSession ||
  mongoose.model<IStudioDjUploadSession>('StudioDjUploadSession', StudioDjUploadSessionSchema);

export default StudioDjUploadSession;
