import { body, query, param } from 'express-validator';

export const createTutorValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required')
    .isLength({ max: 2000 })
    .withMessage('Bio must be less than 2000 characters'),
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  body('subjects.*')
    .trim()
    .notEmpty()
    .withMessage('Subject cannot be empty'),
  body('hourlyRate')
    .isNumeric()
    .withMessage('Hourly rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be positive'),
  body('teachingMode')
    .isIn(['online', 'offline', 'both'])
    .withMessage('Teaching mode must be online, offline, or both'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('education')
    .optional()
    .isArray(),
  body('education.*.degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required'),
  body('education.*.institution')
    .trim()
    .notEmpty()
    .withMessage('Institution is required'),
  body('education.*.year')
    .isNumeric()
    .withMessage('Year must be a number'),
  body('experience')
    .optional()
    .isArray(),
  body('experience.*.title')
    .trim()
    .notEmpty()
    .withMessage('Experience title is required'),
  body('experience.*.institution')
    .trim()
    .notEmpty()
    .withMessage('Institution is required'),
  body('experience.*.startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('experience.*.description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('availability')
    .optional()
    .isArray(),
  body('availability.*.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day'),
  body('availability.*.startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM format'),
  body('availability.*.endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM format'),
];

export const updateTutorValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid tutor ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Bio must be less than 2000 characters'),
  body('subjects')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  body('hourlyRate')
    .optional()
    .isNumeric()
    .withMessage('Hourly rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be positive'),
  body('teachingMode')
    .optional()
    .isIn(['online', 'offline', 'both'])
    .withMessage('Teaching mode must be online, offline, or both'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
];

export const getTutorsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be positive'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be positive'),
  query('teachingMode')
    .optional()
    .isIn(['online', 'offline', 'both'])
    .withMessage('Invalid teaching mode'),
];

export const getTutorValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid tutor ID'),
];
