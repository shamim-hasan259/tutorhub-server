import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as bookmarkService from '../services/bookmark.service';
import { sendResponse, sendError } from '../utils/response';

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const bookmarks = await bookmarkService.getBookmarksByUser(req.user.id);
    sendResponse(res, 200, bookmarks, 'Bookmarks retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch bookmarks');
  }
};

export const addBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { tutorId } = req.params;
    const bookmark = await bookmarkService.addBookmark(req.user.id, tutorId as string);
    sendResponse(res, 201, bookmark, 'Tutor saved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to save tutor');
    }
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { tutorId } = req.params;
    await bookmarkService.removeBookmark(req.user.id, tutorId as string);
    sendResponse(res, 200, null, 'Tutor removed from saved list');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to remove tutor');
    }
  }
};

export const checkBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { tutorId } = req.params;
    const isSaved = await bookmarkService.checkBookmark(req.user.id, tutorId as string);
    sendResponse(res, 200, { isSaved }, 'Bookmark status retrieved');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to check bookmark');
    }
  }
};
