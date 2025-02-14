import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

interface IRecent extends IBaseDocument {
  user_id: mongoose.Types.ObjectId;
  document_id: mongoose.Types.ObjectId;
  last_opened_at: Date;
}

const RecentSchema = new Schema<IRecent>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    document_id: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    last_opened_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
RecentSchema.index({ user_id: 1, last_opened_at: -1 });
RecentSchema.index({ document_id: 1 });

export const Recent = mongoose.model<IRecent>('Recent', RecentSchema);
