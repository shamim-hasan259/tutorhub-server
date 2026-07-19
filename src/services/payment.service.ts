import { Types } from 'mongoose';
import { Payment, IPaymentDocument } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Tutor } from '../models/Tutor';
import { AppError } from '../utils/response';

interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  paymentMethod?: string;
}

export const createPayment = async (
  studentId: string,
  input: CreatePaymentInput
): Promise<IPaymentDocument> => {
  const { bookingId, amount, paymentMethod = 'card' } = input;

  if (!Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  // Check if booking exists
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check if student owns the booking
  if (booking.studentId.toString() !== studentId) {
    throw new AppError('Not authorized', 403);
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({
    bookingId,
    status: { $in: ['pending', 'completed'] },
  });

  if (existingPayment) {
    throw new AppError('Payment already exists for this booking', 400);
  }

  // Get tutor for tutor ID
  const tutor = await Tutor.findById(booking.tutorId);

  const payment = await Payment.create({
    bookingId,
    studentId,
    tutorId: tutor?._id || booking.tutorId,
    amount,
    paymentMethod,
  });

  return payment;
};

export const getStudentPayments = async (studentId: string) => {
  const payments = await Payment.find({ studentId })
    .populate({
      path: 'bookingId',
      populate: { path: 'tutorId', populate: { path: 'userId', select: 'name' } },
    })
    .sort({ createdAt: -1 })
    .lean();

  return payments;
};

export const getTutorPayments = async (tutorId: string) => {
  const payments = await Payment.find({ tutorId })
    .populate('studentId', 'name email')
    .populate('bookingId')
    .sort({ createdAt: -1 })
    .lean();

  return payments;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: 'completed' | 'failed' | 'refunded',
  stripePaymentId?: string
): Promise<IPaymentDocument> => {
  if (!Types.ObjectId.isValid(paymentId)) {
    throw new AppError('Invalid payment ID', 400);
  }

  const updateData: Record<string, unknown> = { status };
  if (stripePaymentId) {
    updateData.stripePaymentId = stripePaymentId;
  }

  const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // If payment completed, update booking status
  if (status === 'completed') {
    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: 'confirmed',
    });
  }

  return payment;
};

export const getPaymentById = async (paymentId: string): Promise<IPaymentDocument> => {
  if (!Types.ObjectId.isValid(paymentId)) {
    throw new AppError('Invalid payment ID', 400);
  }

  const payment = await Payment.findById(paymentId)
    .populate('bookingId')
    .populate('studentId', 'name email')
    .populate({
      path: 'tutorId',
      populate: { path: 'userId', select: 'name' },
    })
    .lean();

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment as unknown as IPaymentDocument;
};
