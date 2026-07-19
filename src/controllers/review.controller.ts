import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as reviewService from '../services/review.service';
import { sendResponse, sendError } from '../utils/response';

export const getReviewsByTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const tutorId = req.params.tutorId as string;
    const reviews = await reviewService.getReviewsByTutor(tutorId);
    sendResponse(res, 200, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch reviews');
    }
  }
};

export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const review = await reviewService.getReviewById(id);
    sendResponse(res, 200, review, 'Review retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch review');
    }
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    if (req.user.role !== 'student') {
      sendError(res, 403, 'Only students can create reviews');
      return;
    }

    const { tutorId, rating, comment } = req.body;
    const review = await reviewService.createReview(req.user.id, tutorId, rating, comment);
    sendResponse(res, 201, review, 'Review created successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to create review');
    }
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const id = req.params.id as string;
    const review = await reviewService.updateReview(id, req.user.id, req.body);
    sendResponse(res, 200, review, 'Review updated successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to update review');
    }
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const id = req.params.id as string;
    await reviewService.deleteReview(id, req.user.id);
    sendResponse(res, 200, null, 'Review deleted successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to delete review');
    }
  }
};
