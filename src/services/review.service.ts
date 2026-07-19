import { Types } from 'mongoose';
import { Review, IReviewDocument } from '../models/Review';
import { Tutor } from '../models/Tutor';
import { AppError } from '../utils/response';

export const getReviewsByTutor = async (tutorId: string) => {
  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const reviews = await Review.find({ tutorId })
    .populate('studentId', 'name avatar')
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
};

export const getReviewById = async (id: string): Promise<IReviewDocument> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid review ID', 400);
  }

  const review = await Review.findById(id)
    .populate('studentId', 'name avatar')
    .populate('tutorId')
    .lean();

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  return review as unknown as IReviewDocument;
};

export const createReview = async (
  studentId: string,
  tutorId: string,
  rating: number,
  comment: string
): Promise<IReviewDocument> => {
  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  // Check if tutor exists
  const tutor = await Tutor.findById(tutorId);
  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  // Check if student already reviewed this tutor
  const existingReview = await Review.findOne({ tutorId, studentId });
  if (existingReview) {
    throw new AppError('You have already reviewed this tutor', 400);
  }

  // Create review
  const review = await Review.create({
    tutorId,
    studentId,
    rating,
    comment,
  });

  // Update tutor rating
  await updateTutorRating(new Types.ObjectId(tutorId));

  return review;
};

export const updateReview = async (
  id: string,
  studentId: string,
  updateData: { rating?: number; comment?: string }
): Promise<IReviewDocument> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid review ID', 400);
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check ownership
  if (review.studentId.toString() !== studentId) {
    throw new AppError('Not authorized to update this review', 403);
  }

  const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('studentId', 'name avatar')
    .lean();

  // Update tutor rating
  await updateTutorRating(review.tutorId);

  return updatedReview as unknown as IReviewDocument;
};

export const deleteReview = async (id: string, studentId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid review ID', 400);
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check ownership
  if (review.studentId.toString() !== studentId) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  const tutorId = review.tutorId;

  await Review.findByIdAndDelete(id);

  // Update tutor rating
  await updateTutorRating(tutorId);
};

const updateTutorRating = async (tutorId: Types.ObjectId): Promise<void> => {
  const result = await Review.aggregate([
    { $match: { tutorId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

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
