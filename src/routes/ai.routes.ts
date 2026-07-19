import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  tutorRecommendationValidation,
  studyPlanValidation,
  getHistoryValidation,
  deleteHistoryValidation,
} from '../validations/ai.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/recommend-tutor',
  tutorRecommendationValidation,
  validate,
  aiController.getTutorRecommendation
);

router.post(
  '/study-plan',
  studyPlanValidation,
  validate,
  aiController.getStudyPlan
);

router.get(
  '/history',
  getHistoryValidation,
  validate,
  aiController.getAIHistory
);

router.delete(
  '/history/:id',
  deleteHistoryValidation,
  validate,
  aiController.deleteAIHistoryEntry
);

export default router;
