import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

export interface User extends IBaseDocument {
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  subscription_id: mongoose.Types.ObjectId;
  educational_level: string;
  profile_picture: string;
  preferences: {
    darkmode: boolean;
    language: string;
    fontSize: number;
  };
  googleId?: string;
  email_verified: boolean;
}

const UserSchema = new Schema<User>(
  {
    last_name: { type: String },
    first_name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    subscription_id: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    educational_level: String,
    profile_picture: String,
    email_verified: { type: Boolean, default: false },
    preferences: {
      darkmode: Boolean,
      language: String,
      fontSize: Number,
    },
    googleId: { type: String, sparse: true, unique: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ subscription_id: 1 });

export const User = mongoose.model<User>('User', UserSchema);
