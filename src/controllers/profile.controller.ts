import { Request, Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../types';
import * as profileService from '../services/profile.service';
import { sendResponse, sendError } from '../utils/response';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('avatar');

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const profile = await profileService.getProfile(req.user.id);
    sendResponse(res, 200, profile, 'Profile retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch profile');
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { name, phone, address } = req.body;
    const profile = await profileService.updateProfile(req.user.id, { name, phone, address });
    sendResponse(res, 200, profile, 'Profile updated successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to update profile');
    }
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    if (!req.file) {
      sendError(res, 400, 'No image file provided');
      return;
    }

    const profile = await profileService.uploadAvatar(req.user.id, req.file);
    sendResponse(res, 200, profile, 'Avatar uploaded successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to upload avatar');
    }
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const profile = await profileService.getUserProfile(userId as string);
    sendResponse(res, 200, profile, 'User profile retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch user profile');
    }
  }
};
