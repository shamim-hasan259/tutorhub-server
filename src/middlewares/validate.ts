import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    sendError(res, 400, message);
    return;
  }

  next();
};
