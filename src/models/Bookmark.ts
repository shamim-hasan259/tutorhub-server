import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tutorId: Types.ObjectId;
  createdAt: Date;
}

export interface IBookmarkDocument extends IBookmark, Document {}

const bookmarkSchema = new Schema<IBookmarkDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ userId: 1, tutorId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1 });

export const Bookmark = mongoose.model<IBookmarkDocument>('Bookmark', bookmarkSchema);
