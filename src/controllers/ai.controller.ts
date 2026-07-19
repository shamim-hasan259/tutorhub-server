import { Response } from 'express';
import { AuthRequest } from '../types';
import * as aiService from '../services/ai.service';
import { sendResponse, sendError } from '../utils/response';

export const getTutorRecommendation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { studentClass, subject, weakTopics, budget, preferredTime, learningGoal } = req.body;

    const result = await aiService.getTutorRecommendation(req.user.id, {
      studentClass,
      subject,
      weakTopics,
      budget,
      preferredTime,
      learningGoal,
    });

    sendResponse(res, 200, result, 'AI recommendations generated successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to generate AI recommendations');
    }
  }
};

export const getStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { subject, examDate, dailyStudyTime, weakChapters, targetGrade } = req.body;

    const result = await aiService.getStudyPlan(req.user.id, {
      subject,
      examDate,
      dailyStudyTime,
      weakChapters,
      targetGrade,
    });

    sendResponse(res, 200, result, 'Study plan generated successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to generate study plan');
    }
  }
};

export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { type } = req.query;
    const history = await aiService.getAIHistory(
      req.user.id,
      type as 'tutor_recommendation' | 'study_plan' | undefined
    );

    sendResponse(res, 200, history, 'AI history retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch AI history');
  }
};

export const deleteAIHistoryEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { id } = req.params;
    await aiService.deleteAIHistoryEntry(req.user.id, id as string);
    sendResponse(res, 200, null, 'History entry deleted successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to delete history entry');
    }
  }
};
