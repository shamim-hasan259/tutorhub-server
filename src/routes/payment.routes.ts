import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', paymentController.createPayment);

router.get('/student', paymentController.getStudentPayments);

router.get('/tutor', authorize('tutor'), paymentController.getTutorPayments);

router.get('/:id', paymentController.getPaymentById);

router.patch('/:id/status', paymentController.updatePaymentStatus);

export default router;
