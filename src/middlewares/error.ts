import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    sendError(res, 400, message);
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 400, 'Duplicate field value');
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 400, 'Invalid ID format');
    return;
  }

  sendError(res, 500, 'Internal server error');
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
};
