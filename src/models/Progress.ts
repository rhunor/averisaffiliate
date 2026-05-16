import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completed: boolean;
  watchedSeconds: number;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    completed: { type: Boolean, default: false },
    watchedSeconds: { type: Number, default: 0 },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, courseId: 1 });
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>("Progress", ProgressSchema);
export default Progress;
