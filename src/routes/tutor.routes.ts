import { Router } from 'express';
import * as tutorController from '../controllers/tutor.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createTutorValidation,
  updateTutorValidation,
  getTutorsValidation,
  getTutorValidation,
} from '../validations/tutor.validation';

const router = Router();

// Public routes
router.get(
  '/',
  getTutorsValidation,
  validate,
  tutorController.getAllTutors
);

router.get(
  '/subject/:subject',
  tutorController.getTutorsBySubject
);

router.get(
  '/:id',
  getTutorValidation,
  validate,
  tutorController.getTutorById
);

// Protected routes - Tutor only
router.post(
  '/',
  authenticate,
  authorize('tutor'),
  createTutorValidation,
  validate,
  tutorController.createTutor
);

router.put(
  '/:id',
  authenticate,
  authorize('tutor'),
  updateTutorValidation,
  validate,
  tutorController.updateTutor
);

router.delete(
  '/:id',
  authenticate,
  authorize('tutor'),
  getTutorValidation,
  validate,
  tutorController.deleteTutor
);

export default router;
