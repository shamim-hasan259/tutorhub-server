import mongoose, { Schema, Document, Types } from 'mongoose';

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

export interface ITutor {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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

export interface ITutorDocument extends ITutor, Document {}

const educationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
});

const experienceSchema = new Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  description: { type: String, required: true },
});

const availabilitySchema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const tutorSchema = new Schema<ITutorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: 2000,
    },
    education: [educationSchema],
    experience: [experienceSchema],
    subjects: [{
      type: String,
      required: true,
    }],
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: 0,
    },
    teachingMode: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    availability: [availabilitySchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tutorSchema.index({ userId: 1 });
tutorSchema.index({ subjects: 1 });
tutorSchema.index({ location: 1 });
tutorSchema.index({ hourlyRate: 1 });
tutorSchema.index({ rating: -1 });
tutorSchema.index({ teachingMode: 1 });
tutorSchema.index({ subjects: 1, location: 1, hourlyRate: 1 });

export const Tutor = mongoose.model<ITutorDocument>('Tutor', tutorSchema);
