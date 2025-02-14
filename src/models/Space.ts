import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

interface ISpaceDocument {
  document_id: mongoose.Types.ObjectId;
  file_name: string;
  previewPic: string;
  created_at: Date;
}

interface ISpace extends IBaseDocument {
  user_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  documents: ISpaceDocument[];
}

const SpaceSchema = new Schema<ISpace>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    documents: [
      {
        document_id: { type: Schema.Types.ObjectId, ref: 'Document' },
        file_name: String,
        previewPic: String,
        created_at: Date,
      },
    ],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
SpaceSchema.index({ user_id: 1 });
SpaceSchema.index({ 'documents.document_id': 1 });
SpaceSchema.index({ created_at: -1 });

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);
