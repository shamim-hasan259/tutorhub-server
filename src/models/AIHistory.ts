import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIHistory {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'tutor_recommendation' | 'study_plan';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  createdAt: Date;
}

export interface IAIHistoryDocument extends IAIHistory, Document {}

const aiHistorySchema = new Schema<IAIHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['tutor_recommendation', 'study_plan'],
      required: true,
    },
    input: {
      type: Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

aiHistorySchema.index({ userId: 1, type: 1 });
aiHistorySchema.index({ userId: 1, createdAt: -1 });

export const AIHistory = mongoose.model<IAIHistoryDocument>('AIHistory', aiHistorySchema);
