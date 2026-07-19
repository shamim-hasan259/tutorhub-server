import { Router, Request, Response } from 'express';
import { sendResponse } from '../utils/response';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  sendResponse(res, 200, { status: 'ok', timestamp: new Date().toISOString() }, 'Server is healthy');
});

export default router;
