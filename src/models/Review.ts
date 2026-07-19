import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview {
  _id: Types.ObjectId;
  tutorId: Types.ObjectId;
  studentId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {
  updateTutorRating(tutorId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ tutorId: 1, studentId: 1 }, { unique: true });
reviewSchema.index({ tutorId: 1 });
reviewSchema.index({ studentId: 1 });

reviewSchema.statics.updateTutorRating = async function (tutorId: Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { tutorId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Tutor = mongoose.model('Tutor');
  if (result.length > 0) {
    await Tutor.findByIdAndUpdate(tutorId, {
      rating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Tutor.findByIdAndUpdate(tutorId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);
