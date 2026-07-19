import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as tutorService from '../services/tutor.service';
import { sendResponse, sendError } from '../utils/response';

export const getAllTutors = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await tutorService.getAllTutors(req.query as any);
    sendResponse(res, 200, result, 'Tutors retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch tutors');
  }
};

export const getTutorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const tutor = await tutorService.getTutorById(id);
    sendResponse(res, 200, tutor, 'Tutor retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch tutor');
    }
  }
};

export const createTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const tutor = await tutorService.createTutor(req.user.id, req.body);
    sendResponse(res, 201, tutor, 'Tutor profile created successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to create tutor profile');
    }
  }
};

export const updateTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const id = req.params.id as string;
    const tutor = await tutorService.updateTutor(id, req.user.id, req.body);
    sendResponse(res, 200, tutor, 'Tutor profile updated successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to update tutor profile');
    }
  }
};

export const deleteTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const id = req.params.id as string;
    await tutorService.deleteTutor(id, req.user.id);
    sendResponse(res, 200, null, 'Tutor profile deleted successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to delete tutor profile');
    }
  }
};

export const getTutorsBySubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const subject = req.params.subject as string;
    const tutors = await tutorService.getTutorsBySubject(subject);
    sendResponse(res, 200, tutors, 'Tutors retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch tutors');
  }
};
