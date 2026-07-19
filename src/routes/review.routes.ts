import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createReviewValidation,
  updateReviewValidation,
  getReviewsValidation,
  getReviewValidation,
} from '../validations/review.validation';

const router = Router();

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
