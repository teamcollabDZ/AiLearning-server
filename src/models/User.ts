import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

interface IUser extends IBaseDocument {
  name: string;
  email: string;
  password: string;
  subscription_id: mongoose.Types.ObjectId;
  educational_level: string;
  preferences: {
    darkmode: boolean;
    language: string;
    fontSize: number;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription_id: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    educational_level: String,
    preferences: {
      darkmode: Boolean,
      language: String,
      fontSize: Number,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ subscription_id: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
