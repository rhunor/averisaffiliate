import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import mongoose from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const course = await Course.findOne({ _id: params.courseId, isPublished: true }).lean();
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const lessons = await Lesson.find({ courseId: params.courseId, isPublished: true })
      .sort({ sortOrder: 1 })
      .lean();

    const lessonIds = lessons.map((l) => (l as Record<string, unknown>)._id);
    const progressRecords = await Progress.find({ userId, lessonId: { $in: lessonIds } }).lean();
    const progressMap = new Map(
      progressRecords.map((p) => [(p as Record<string, unknown>).lessonId?.toString(), p])
    );

    const lessonsWithProgress = lessons.map((l) => {
      const prog = progressMap.get((l as Record<string, unknown>)._id?.toString());
      return {
        ...l,
        completed: (prog as Record<string, unknown> | undefined)?.completed ?? false,
        watchedSeconds: (prog as Record<string, unknown> | undefined)?.watchedSeconds ?? 0,
      };
    });

    const completedCount = lessonsWithProgress.filter((l) => l.completed).length;
    const totalLessons = lessons.length;

    return NextResponse.json({
      course: {
        ...course,
        totalLessons,
        completedLessons: completedCount,
        progressPct: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
        lessons: lessonsWithProgress,
      },
    });
  } catch (err) {
    console.error("[academy/courseId]", err);
    return NextResponse.json({ error: "Failed to load course." }, { status: 500 });
  }
}
