import { body, query, param } from 'express-validator';

export const tutorRecommendationValidation = [
  body('studentClass')
    .trim()
    .notEmpty()
    .withMessage('Student class is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('weakTopics')
    .isArray({ min: 1 })
    .withMessage('At least one weak topic is required'),
  body('weakTopics.*')
    .trim()
    .notEmpty()
    .withMessage('Weak topic cannot be empty'),
  body('budget')
    .isNumeric()
    .withMessage('Budget must be a number')
    .isFloat({ min: 0 })
    .withMessage('Budget must be positive'),
  body('preferredTime')
    .trim()
    .notEmpty()
    .withMessage('Preferred time is required'),
  body('learningGoal')
    .trim()
    .notEmpty()
    .withMessage('Learning goal is required'),
];

export const studyPlanValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('examDate')
    .isISO8601()
    .withMessage('Exam date must be a valid date'),
  body('dailyStudyTime')
    .isNumeric()
    .withMessage('Daily study time must be a number')
    .isFloat({ min: 0.5, max: 12 })
    .withMessage('Daily study time must be between 0.5 and 12 hours'),
  body('weakChapters')
    .isArray({ min: 1 })
    .withMessage('At least one weak chapter is required'),
  body('weakChapters.*')
    .trim()
    .notEmpty()
    .withMessage('Weak chapter cannot be empty'),
  body('targetGrade')
    .trim()
    .notEmpty()
    .withMessage('Target grade is required'),
];

export const getHistoryValidation = [
  query('type')
    .optional()
    .isIn(['tutor_recommendation', 'study_plan'])
    .withMessage('Invalid history type'),
];

export const deleteHistoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid history ID'),
];
