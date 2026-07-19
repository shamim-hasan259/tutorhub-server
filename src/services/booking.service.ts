import { Types } from 'mongoose';
import { Booking, IBookingDocument } from '../models/Booking';
import { Tutor } from '../models/Tutor';
import { AppError } from '../utils/response';

interface CreateBookingInput {
  tutorId: string;
  date: Date;
  time: string;
  subject: string;
  notes?: string;
}

export const createBooking = async (
  studentId: string,
  input: CreateBookingInput
): Promise<IBookingDocument> => {
  const { tutorId, date, time, subject, notes } = input;

  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  // Check if tutor exists
  const tutor = await Tutor.findById(tutorId);
  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  // Check if tutor is available at this time
  const bookingDate = new Date(date);
  const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
  const availability = tutor.availability.find((a) => a.day === dayName);

  if (!availability) {
    throw new AppError('Tutor is not available on this day', 400);
  }

  const bookingHour = parseInt(time.split(':')[0]);
  const startHour = parseInt(availability.startTime.split(':')[0]);
  const endHour = parseInt(availability.endTime.split(':')[0]);

  if (bookingHour < startHour || bookingHour >= endHour) {
    throw new AppError('Tutor is not available at this time', 400);
  }

  // Check for existing booking at same time
  const existingBooking = await Booking.findOne({
    tutorId,
    date: bookingDate,
    time,
    status: { $in: ['pending', 'confirmed'] },
  });

  if (existingBooking) {
    throw new AppError('This time slot is already booked', 400);
  }

  const booking = await Booking.create({
    studentId,
    tutorId,
    date: bookingDate,
    time,
    subject,
    notes,
  });

  // Update tutor's total students count
  await Tutor.findByIdAndUpdate(tutorId, {
    $inc: { totalStudents: 1 },
  });

  return booking;
};

export const getStudentBookings = async (studentId: string) => {
  const bookings = await Booking.find({ studentId })
    .populate({
      path: 'tutorId',
      populate: { path: 'userId', select: 'name email avatar' },
    })
    .sort({ date: -1 })
    .lean();

  return bookings;
};

export const getTutorBookings = async (tutorId: string) => {
  const bookings = await Booking.find({ tutorId })
    .populate('studentId', 'name email avatar')
    .sort({ date: -1 })
    .lean();

  return bookings;
};

export const updateBookingStatus = async (
  bookingId: string,
  userId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<IBookingDocument> => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Check authorization
  const tutor = await Tutor.findById(booking.tutorId);
  if (tutor?.userId.toString() !== userId && booking.studentId.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true, runValidators: true }
  );

  return updatedBooking as IBookingDocument;
};

export const getBookingById = async (bookingId: string): Promise<IBookingDocument> => {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new AppError('Invalid booking ID', 400);
  }

  const booking = await Booking.findById(bookingId)
    .populate({
      path: 'tutorId',
      populate: { path: 'userId', select: 'name email avatar' },
    })
    .populate('studentId', 'name email avatar')
    .lean();

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return booking as unknown as IBookingDocument;
};
