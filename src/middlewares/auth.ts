import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    const baseUrl = process.env.BETTER_AUTH_BASE_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${baseUrl}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        sendError(res, 401, 'Invalid or expired token');
        return;
      }

      const session: BetterAuthSession = await response.json() as BetterAuthSession;

      if (!session || !session.user) {
        sendError(res, 401, 'Invalid session');
        return;
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: (session.user.role as 'student' | 'tutor') || 'student',
      };

      next();
    } catch {
      sendError(res, 401, 'Failed to verify token');
      return;
    }
  } catch (error) {
    sendError(res, 500, 'Authentication error');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'Not authorized');
      return;
    }

    next();
  };
};
