import { Document } from 'mongoose';

export interface ITimestamps {
  created_at: Date;
  updated_at: Date;
}

export interface IBaseDocument extends Document, ITimestamps {}
