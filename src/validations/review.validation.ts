import { body, param } from 'express-validator';

export const createReviewValidation = [
  body('tutorId')
    .isMongoId()
    .withMessage('Invalid tutor ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
];

export const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
];

export const getReviewsValidation = [
  param('tutorId')
    .isMongoId()
    .withMessage('Invalid tutor ID'),
];

export const getReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
];
