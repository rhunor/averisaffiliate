import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  cloudinaryPublicId: string;
  duration: number;
  sortOrder: number;
  isPublished: boolean;
  resources: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    duration: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    resources: {
      type: [{ name: String, url: String }],
      default: [],
    },
  },
  { timestamps: true }
);

LessonSchema.index({ courseId: 1, sortOrder: 1 });

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
