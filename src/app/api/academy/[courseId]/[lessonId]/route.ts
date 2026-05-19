import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params;
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const [course, lesson] = await Promise.all([
      Course.findOne({ _id: courseId, isPublished: true }).lean(),
      Lesson.findOne({ _id: lessonId, courseId, isPublished: true }).lean(),
    ]);

    if (!course || !lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    const lessonRecord = lesson as Record<string, unknown>;

    const allLessons = await Lesson.find({ courseId, isPublished: true })
      .sort({ sortOrder: 1 })
      .select("_id title sortOrder")
      .lean();

    const idx = allLessons.findIndex((l) => (l as Record<string, unknown>)._id?.toString() === lessonId);
    const prevLesson = idx > 0 ? allLessons[idx - 1] : null;
    const nextLesson = idx < allLessons.length - 1 ? allLessons[idx + 1] : null;

    const progress = await Progress.findOne({ userId, lessonId }).lean();
    const prog = progress as Record<string, unknown> | null;

    return NextResponse.json({
      lesson: {
        ...lessonRecord,
        courseTitle: (course as Record<string, unknown>).title,
        completed: prog?.completed ?? false,
        watchedSeconds: prog?.watchedSeconds ?? 0,
        prevLesson: prevLesson ? { _id: (prevLesson as Record<string, unknown>)._id, title: (prevLesson as Record<string, unknown>).title } : null,
        nextLesson: nextLesson ? { _id: (nextLesson as Record<string, unknown>)._id, title: (nextLesson as Record<string, unknown>).title } : null,
      },
    });
  } catch (err) {
    console.error("[academy/lesson]", err);
    return NextResponse.json({ error: "Failed to load lesson." }, { status: 500 });
  }
}
