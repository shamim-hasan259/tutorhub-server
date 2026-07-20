import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

router.get('/users', adminController.getUsers);
router.get('/bookings', adminController.getBookings);
router.get('/stats', adminController.getDashboardStats);
router.patch('/tutors/:id/verify', adminController.verifyTutor);

export default router;
