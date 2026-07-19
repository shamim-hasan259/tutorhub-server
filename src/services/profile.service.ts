import { Types } from 'mongoose';
import { User, IUserDocument } from '../models/User';
import { AppError } from '../utils/response';
import cloudinary from '../config/cloudinary';

export const getProfile = async (userId: string): Promise<IUserDocument> => {
  const user = await User.findById(userId).select('-__v').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as IUserDocument;
};

export const updateProfile = async (
  userId: string,
  updateData: { name?: string; phone?: string; address?: string }
): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-__v').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as IUserDocument;
};

export const uploadAvatar = async (
  userId: string,
  file: Express.Multer.File
): Promise<IUserDocument> => {
  // Upload to Cloudinary
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'edupro/avatars',
        public_id: `avatar-${userId}`,
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      }
    );

    uploadStream.end(file.buffer);
  });

  // Update user avatar
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: result.secure_url },
    { new: true }
  ).select('-__v').lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as IUserDocument;
};

export const getUserProfile = async (targetUserId: string): Promise<IUserDocument> => {
  if (!Types.ObjectId.isValid(targetUserId)) {
    throw new AppError('Invalid user ID', 400);
  }

  const user = await User.findById(targetUserId)
    .select('name avatar role createdAt')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user as unknown as IUserDocument;
};
