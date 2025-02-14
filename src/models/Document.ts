import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

interface IAIProcessing {
  summary: {
    short: string;
    detailed: string;
  };
  flashcards: Array<{
    question: string;
    answer: string;
    explanation: string;
  }>;
  ai_chat: Array<{
    user_question: string;
    ai_response: string;
  }>;
  chapters: Array<{
    title: string;
    start_page: number;
    end_page: number;
  }>;
}

interface IDocument extends IBaseDocument {
  spaceID: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  file_name: string;
  file_type: string;
  storage_url: string;
  previewPic: string;
  ai_processing: IAIProcessing;
}

const DocumentSchema = new Schema<IDocument>(
  {
    spaceID: { type: Schema.Types.ObjectId, ref: 'Space', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    file_name: { type: String, required: true },
    file_type: { type: String, required: true },
    storage_url: { type: String, required: true },
    previewPic: { type: String, required: true },
    ai_processing: {
      summary: {
        short: String,
        detailed: String,
      },
      flashcards: [
        {
          question: String,
          answer: String,
          explanation: String,
        },
      ],
      ai_chat: [
        {
          user_question: String,
          ai_response: String,
        },
      ],
      chapters: [
        {
          title: String,
          start_page: Number,
          end_page: Number,
        },
      ],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
DocumentSchema.index({ user_id: 1 });
DocumentSchema.index({ spaceID: 1 });
DocumentSchema.index({ file_type: 1 });
DocumentSchema.index({ created_at: -1 });

export const Document = mongoose.model<IDocument>('Document', DocumentSchema);
