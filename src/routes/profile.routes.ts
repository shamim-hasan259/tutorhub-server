import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  updateProfileValidation,
  getUserProfileValidation,
} from '../validations/profile.validation';

const router = Router();

// Protected routes
router.get('/', authenticate, profileController.getProfile);

router.put(
  '/',
  authenticate,
  updateProfileValidation,
  validate,
  profileController.updateProfile
);

router.post(
  '/avatar',
  authenticate,
  profileController.uploadMiddleware,
  profileController.uploadAvatar
);

// Public route
router.get(
  '/:userId',
  getUserProfileValidation,
  validate,
  profileController.getUserProfile
);

export default router;
