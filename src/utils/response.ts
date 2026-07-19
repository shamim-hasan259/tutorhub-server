import { Response } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendResponse = <T>(res: Response, statusCode: number, data: T, message: string = 'Success'): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: message,
  };
  return res.status(statusCode).json(response);
};
