import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  studentId: Types.ObjectId;
  tutorId: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  stripePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripePaymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ tutorId: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
