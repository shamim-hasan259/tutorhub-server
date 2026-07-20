import { Types } from 'mongoose';
import { Tutor, ITutorDocument } from '../models/Tutor';
import { User } from '../models/User';
import { AppError } from '../utils/response';

interface TutorQuery {
  search?: string;
  subject?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  teachingMode?: string;
  experience?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const getAllTutors = async (query: TutorQuery) => {
  const {
    search,
    subject,
    location,
    minPrice,
    maxPrice,
    teachingMode,
    experience,
    sort = '-rating',
    page = 1,
    limit = 12,
  } = query;

  const filter: Record<string, unknown> = {};

  // Search by title, bio, or subjects
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
      { subjects: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Filter by subject
  if (subject) {
    filter.subjects = { $in: [new RegExp(subject, 'i')] };
  }

  // Filter by location
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    filter.hourlyRate = {};
    if (minPrice) (filter.hourlyRate as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.hourlyRate as Record<string, number>).$lte = Number(maxPrice);
  }

  // Filter by teaching mode
  if (teachingMode) {
    filter.teachingMode = teachingMode;
  }

  // Sort options
  let sortOption: Record<string, 1 | -1> = {};
  let sortByName = false;
  switch (sort) {
    case 'price-low':
      sortOption = { hourlyRate: 1 };
      break;
    case 'price-high':
      sortOption = { hourlyRate: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'students':
      sortOption = { totalStudents: -1 };
      break;
    case 'name':
      sortByName = true;
      sortOption = { createdAt: -1 }; // default sort, re-sorted after populate
      break;
    default:
      sortOption = { rating: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tutors, total] = await Promise.all([
    Tutor.find(filter)
      .populate('userId', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Tutor.countDocuments(filter),
  ]);

  // Sort by name after populate (can't do this in the DB query)
  if (sortByName) {
    tutors.sort((a, b) => {
      const nameA = (a.userId as any)?.name || '';
      const nameB = (b.userId as any)?.name || '';
      return nameA.localeCompare(nameB);
    });
  }

  return {
    tutors,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getTutorById = async (id: string): Promise<ITutorDocument> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const tutor = await Tutor.findById(id)
    .populate('userId', 'name email avatar phone address')
    .lean();

  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  return tutor as unknown as ITutorDocument;
};

export const getTutorByUserId = async (userId: string): Promise<ITutorDocument | null> => {
  const tutor = await Tutor.findOne({ userId })
    .populate('userId', 'name email avatar phone address')
    .lean();

  return tutor as unknown as ITutorDocument | null;
};

export const createTutor = async (userId: string, tutorData: Partial<ITutorDocument>): Promise<ITutorDocument> => {
  // Check if user already has a tutor profile
  const existingTutor = await Tutor.findOne({ userId });
  if (existingTutor) {
    throw new AppError('Tutor profile already exists', 400);
  }

  // Check if user exists and is a tutor
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update user role to tutor
  user.role = 'tutor';
  await user.save();

  const tutor = await Tutor.create({
    userId,
    ...tutorData,
  });

  return tutor;
};

export const updateTutor = async (id: string, userId: string, updateData: Partial<ITutorDocument>): Promise<ITutorDocument> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const tutor = await Tutor.findById(id);

  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  // Check ownership
  if (tutor.userId.toString() !== userId) {
    throw new AppError('Not authorized to update this profile', 403);
  }

  const updatedTutor = await Tutor.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('userId', 'name email avatar')
    .lean();

  return updatedTutor as unknown as ITutorDocument;
};

export const deleteTutor = async (id: string, userId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const tutor = await Tutor.findById(id);

  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  // Check ownership
  if (tutor.userId.toString() !== userId) {
    throw new AppError('Not authorized to delete this profile', 403);
  }

  await Tutor.findByIdAndDelete(id);
};

export const getTutorsBySubject = async (subject: string): Promise<ITutorDocument[]> => {
  const tutors = await Tutor.find({ subjects: { $in: [new RegExp(subject, 'i')] } })
    .populate('userId', 'name email avatar')
    .sort({ rating: -1 })
    .limit(10)
    .lean();

  return tutors as unknown as ITutorDocument[];
};
