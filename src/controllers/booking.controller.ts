import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as bookingService from '../services/booking.service';
import { sendResponse, sendError } from '../utils/response';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { tutorId, date, time, subject, notes } = req.body;
    const booking = await bookingService.createBooking(req.user.id, {
      tutorId,
      date: new Date(date),
      time,
      subject,
      notes,
    });
    sendResponse(res, 201, booking, 'Booking created successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to create booking');
    }
  }
};

export const getStudentBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const bookings = await bookingService.getStudentBookings(req.user.id);
    sendResponse(res, 200, bookings, 'Bookings retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch bookings');
  }
};

export const getTutorBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const bookings = await bookingService.getTutorBookings(req.user.id);
    sendResponse(res, 200, bookings, 'Bookings retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch bookings');
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const id = req.params.id as string;
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(id, req.user.id, status);
    sendResponse(res, 200, booking, 'Booking status updated');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to update booking');
    }
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.getBookingById(id);
    sendResponse(res, 200, booking, 'Booking retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch booking');
    }
  }
};
