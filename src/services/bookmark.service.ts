import { Types } from 'mongoose';
import { Bookmark, IBookmarkDocument } from '../models/Bookmark';
import { Tutor } from '../models/Tutor';
import { AppError } from '../utils/response';

export const getBookmarksByUser = async (userId: string) => {
  const bookmarks = await Bookmark.find({ userId })
    .populate({
      path: 'tutorId',
      populate: { path: 'userId', select: 'name email avatar' },
    })
    .sort({ createdAt: -1 })
    .lean();

  return bookmarks;
};

export const addBookmark = async (userId: string, tutorId: string): Promise<IBookmarkDocument> => {
  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  // Check if tutor exists
  const tutor = await Tutor.findById(tutorId);
  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  // Check if already bookmarked
  const existingBookmark = await Bookmark.findOne({ userId, tutorId });
  if (existingBookmark) {
    throw new AppError('Tutor already saved', 400);
  }

  const bookmark = await Bookmark.create({ userId, tutorId });
  return bookmark;
};

export const removeBookmark = async (userId: string, tutorId: string): Promise<void> => {
  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const bookmark = await Bookmark.findOneAndDelete({ userId, tutorId });

  if (!bookmark) {
    throw new AppError('Bookmark not found', 404);
  }
};

export const checkBookmark = async (userId: string, tutorId: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(tutorId)) {
    throw new AppError('Invalid tutor ID', 400);
  }

  const bookmark = await Bookmark.findOne({ userId, tutorId });
  return !!bookmark;
};
