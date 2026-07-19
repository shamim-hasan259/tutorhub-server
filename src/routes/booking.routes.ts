import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createBookingValidation,
  updateBookingStatusValidation,
} from '../validations/booking.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  createBookingValidation,
  validate,
  bookingController.createBooking
);

router.get('/student', bookingController.getStudentBookings);

router.get('/tutor', authorize('tutor'), bookingController.getTutorBookings);

router.get('/:id', bookingController.getBookingById);

router.patch(
  '/:id/status',
  updateBookingStatusValidation,
  validate,
  bookingController.updateBookingStatus
);

export default router;
