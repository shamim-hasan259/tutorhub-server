import { Response } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Tutor } from '../models/Tutor';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { sendResponse, sendError } from '../utils/response';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 }).lean();
    sendResponse(res, 200, users, 'Users retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch users');
  }
};

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('studentId', 'name email')
      .populate({
        path: 'tutorId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .lean();
    sendResponse(res, 200, bookings, 'Bookings retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch bookings');
  }
};

export const verifyTutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    ).lean();

    if (!tutor) {
      sendError(res, 404, 'Tutor not found');
      return;
    }

    sendResponse(res, 200, tutor, 'Tutor verification updated');
  } catch (error) {
    sendError(res, 500, 'Failed to update tutor verification');
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalPayments,
      recentBookings,
      recentReviews,
    ] = await Promise.all([
      User.countDocuments(),
      Tutor.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Booking.find()
        .populate('studentId', 'name')
        .populate({ path: 'tutorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Review.find()
        .populate('studentId', 'name')
        .populate({ path: 'tutorId', populate: { path: 'userId', select: 'name' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const totalRevenue = totalPayments.length > 0 ? totalPayments[0].total : 0;

    const bookingsByStatus = [
      { name: 'Completed', value: completedBookings, color: '#22C55E' },
      { name: 'Confirmed', value: activeBookings, color: '#FFB5A8' },
      { name: 'Pending', value: pendingBookings, color: '#FBBF24' },
      { name: 'Cancelled', value: cancelledBookings, color: '#EF4444' },
    ];

    const topSubjects = await Booking.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    sendResponse(res, 200, {
      totalUsers,
      totalTutors,
      totalStudents,
      totalBookings,
      totalRevenue: Math.round(totalRevenue),
      activeBookings: pendingBookings + activeBookings,
      pendingApprovals: await Tutor.countDocuments({ isVerified: false }),
      bookingsByStatus,
      topSubjects: topSubjects.map((s) => ({ subject: s._id, bookings: s.count })),
      recentBookings,
      recentReviews,
    }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    sendError(res, 500, 'Failed to fetch dashboard stats');
  }
};
