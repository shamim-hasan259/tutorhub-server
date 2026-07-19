import { body, param } from 'express-validator';

export const createBookingValidation = [
  body('tutorId')
    .isMongoId()
    .withMessage('Invalid tutor ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM format'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

export const updateBookingStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('status')
    .isIn(['confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
];
