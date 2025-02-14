import mongoose, { Schema } from 'mongoose';
import { IBaseDocument } from '../types';

interface ISubscription extends IBaseDocument {
  user_id: mongoose.Types.ObjectId;
  plan: 'free' | 'pro' | 'premium';
  price: number;
  payment_status: 'active' | 'canceled' | 'expired';
  started_at: Date;
  expires_at: Date;
  payment_method?: string;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['free', 'pro', 'premium'],
      required: true,
    },
    price: { type: Number, required: true },
    payment_status: {
      type: String,
      enum: ['active', 'canceled', 'expired'],
      required: true,
    },
    started_at: { type: Date, required: true },
    expires_at: { type: Date, required: true },
    payment_method: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes
SubscriptionSchema.index({ user_id: 1 });
SubscriptionSchema.index({ payment_status: 1 });
SubscriptionSchema.index({ expires_at: 1 });

export const Subscription = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
