import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import mongoose from "mongoose";

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; groupSlug: string }> }
) {
  try {
    const { courseId, groupSlug } = await params;
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const [course, allLessons] = await Promise.all([
      Course.findOne({ _id: courseId, isPublished: true }).lean(),
      Lesson.find({ courseId, isPublished: true, group: { $ne: null } })
        .sort({ sortOrder: 1 })
        .select("-description -createdAt -updatedAt -__v")
        .lean(),
    ]);

    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const groupLessons = allLessons.filter(
      (l) => toSlug((l as Record<string, unknown>).group as string) === groupSlug
    );

    if (groupLessons.length === 0) {
      return NextResponse.json({ error: "Group not found." }, { status: 404 });
    }

    const lessonIds = groupLessons.map((l) => (l as Record<string, unknown>)._id);
    const progressRecords = await Progress.find({ userId, lessonId: { $in: lessonIds } }).lean();
    const progressMap = new Map(
      progressRecords.map((p) => [(p as Record<string, unknown>).lessonId?.toString(), p])
    );

    const lessonsWithProgress = groupLessons.map((l) => {
      const prog = progressMap.get((l as Record<string, unknown>)._id?.toString());
      return {
        ...l,
        completed: (prog as Record<string, unknown> | undefined)?.completed ?? false,
        watchedSeconds: (prog as Record<string, unknown> | undefined)?.watchedSeconds ?? 0,
      };
    });

    const courseRecord = course as Record<string, unknown>;

    return NextResponse.json({
      course: {
        _id: courseRecord._id,
        title: courseRecord.title,
        moduleNumber: courseRecord.moduleNumber,
      },
      lessons: lessonsWithProgress,
    });
  } catch (err) {
    console.error("[academy/section]", err);
    return NextResponse.json({ error: "Failed to load section." }, { status: 500 });
  }
}
