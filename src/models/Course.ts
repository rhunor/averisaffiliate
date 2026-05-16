import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  moduleNumber: number;
  totalLessons: number;
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    isPublished: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    moduleNumber: { type: Number, required: true },
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
