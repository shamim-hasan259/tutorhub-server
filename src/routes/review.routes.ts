import { Router, Request, Response } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { sendResponse, sendError } from '../utils/response';
import { Review } from '../models/Review';
import {
  createReviewValidation,
  updateReviewValidation,
  getReviewsValidation,
  getReviewValidation,
} from '../validations/review.validation';

const router = Router();

// Protected routes - Get student's own reviews
router.get('/student', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const reviews = await Review.find({ studentId: authReq.user.id })
      .populate({
        path: 'tutorId',
        populate: { path: 'userId', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .lean();

    sendResponse(res, 200, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch reviews');
  }
});

// Protected routes - Get tutor's received reviews
router.get('/tutor/me', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    // Find tutor profile
    const { Tutor } = await import('../models/Tutor');
    const tutor = await Tutor.findOne({ userId: authReq.user.id });

    if (!tutor) {
      sendError(res, 404, 'Tutor profile not found');
      return;
    }

    const reviews = await Review.find({ tutorId: tutor._id })
      .populate('studentId', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    sendResponse(res, 200, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch reviews');
  }
});

// Public routes
router.get(
  '/tutor/:tutorId',
  getReviewsValidation,
  validate,
  reviewController.getReviewsByTutor
);

router.get(
  '/:id',
  getReviewValidation,
  validate,
  reviewController.getReviewById
);

// Protected routes
router.post(
  '/',
  authenticate,
  createReviewValidation,
  validate,
  reviewController.createReview
);

router.put(
  '/:id',
  authenticate,
  updateReviewValidation,
  validate,
  reviewController.updateReview
);

router.delete(
  '/:id',
  authenticate,
  getReviewValidation,
  validate,
  reviewController.deleteReview
);

export default router;
