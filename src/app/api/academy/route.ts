import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const courses = await Course.find({ isPublished: true }).sort({ sortOrder: 1 }).lean();
    const courseIds = courses.map((c) => (c as Record<string, unknown>)._id);

    const [lessons, progressRecords] = await Promise.all([
      Lesson.find({ courseId: { $in: courseIds }, isPublished: true })
        .select("courseId sortOrder duration title")
        .lean(),
      Progress.find({ userId }).lean(),
    ]);

    const progressMap = new Map(
      progressRecords.map((p) => [(p as Record<string, unknown>).lessonId?.toString(), p])
    );

    const coursesWithProgress = courses.map((course) => {
      const cId = (course as Record<string, unknown>)._id?.toString();
      const courseLessons = lessons.filter((l) => (l as Record<string, unknown>).courseId?.toString() === cId);
      const completedCount = courseLessons.filter((l) => {
        const prog = progressMap.get((l as Record<string, unknown>)._id?.toString());
        return (prog as Record<string, unknown> | undefined)?.completed;
      }).length;
      return {
        ...course,
        totalLessons: courseLessons.length,
        completedLessons: completedCount,
        progressPct: courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0,
      };
    });

    return NextResponse.json({ courses: coursesWithProgress });
  } catch (err) {
    console.error("[academy]", err);
    return NextResponse.json({ error: "Failed to load courses." }, { status: 500 });
  }
}
