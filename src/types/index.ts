import { Request } from 'express';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITutor {
  _id: string;
  userId: string;
  user?: IUser;
  title: string;
  bio: string;
  education: IEducation[];
  experience: IExperience[];
  subjects: string[];
  hourlyRate: number;
  teachingMode: 'online' | 'offline' | 'both';
  location: string;
  availability: IAvailability[];
  rating: number;
  totalReviews: number;
  totalStudents: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface IExperience {
  title: string;
  institution: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface IAvailability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IReview {
  _id: string;
  tutorId: string;
  studentId: string;
  student?: IUser;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIHistory {
  _id: string;
  userId: string;
  type: 'tutor_recommendation' | 'study_plan';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  createdAt: Date;
}

export interface IBookmark {
  _id: string;
  userId: string;
  tutorId: string;
  tutor?: ITutor;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'tutor';
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
