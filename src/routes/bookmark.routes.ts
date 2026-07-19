import { Router } from 'express';
import * as bookmarkController from '../controllers/bookmark.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('student'));

router.get('/', bookmarkController.getBookmarks);

router.get('/check/:tutorId', bookmarkController.checkBookmark);

router.post('/:tutorId', bookmarkController.addBookmark);

router.delete('/:tutorId', bookmarkController.removeBookmark);

export default router;
