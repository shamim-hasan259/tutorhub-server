import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as paymentService from '../services/payment.service';
import { sendResponse, sendError } from '../utils/response';

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const { bookingId, amount, paymentMethod } = req.body;
    const payment = await paymentService.createPayment(req.user.id, {
      bookingId,
      amount,
      paymentMethod,
    });
    sendResponse(res, 201, payment, 'Payment created successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to create payment');
    }
  }
};

export const getStudentPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const payments = await paymentService.getStudentPayments(req.user.id);
    sendResponse(res, 200, payments, 'Payments retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch payments');
  }
};

export const getTutorPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const payments = await paymentService.getTutorPayments(req.user.id);
    sendResponse(res, 200, payments, 'Payments retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch payments');
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, stripePaymentId } = req.body;
    const payment = await paymentService.updatePaymentStatus(id, status, stripePaymentId);
    sendResponse(res, 200, payment, 'Payment status updated');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to update payment');
    }
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const payment = await paymentService.getPaymentById(id);
    sendResponse(res, 200, payment, 'Payment retrieved successfully');
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      sendError(res, (error as any).statusCode, error.message);
    } else {
      sendError(res, 500, 'Failed to fetch payment');
    }
  }
};
