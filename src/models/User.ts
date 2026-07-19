import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: 'student' | 'tutor';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'tutor'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
