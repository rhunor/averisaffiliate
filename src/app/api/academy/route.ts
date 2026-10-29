import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import mongoose from "mongoose";

type Doc = Record<string, unknown>;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    await dbConnect();

    const courses = await Course.find({ isPublished: true }).sort({ sortOrder: 1 }).lean();
    const courseIds = courses.map((c) => (c as Doc)._id);

    const [lessons, progressRecords] = await Promise.all([
      Lesson.find({ courseId: { $in: courseIds }, isPublished: true })
        .sort({ sortOrder: 1 })
        .select("courseId sortOrder duration title group youtubeVideoId cloudinaryVideoUrl")
        .lean(),
      Progress.find({ userId }).lean(),
    ]);

    const progressMap = new Map(
      progressRecords.map((p) => [(p as Doc).lessonId?.toString(), p as Doc])
    );

    const coursesWithProgress = courses.map((course) => {
      const cId = (course as Doc)._id?.toString();
      const courseLessons = lessons.filter((l) => (l as Doc).courseId?.toString() === cId) as Doc[];
      const isDone = (l: Doc) => !!progressMap.get(l._id?.toString())?.completed;
      const completedCount = courseLessons.filter(isDone).length;

      // Most recently watched lesson in this course, for "Continue learning".
      let lastWatched: { lesson: Doc; at: Date } | null = null;
      for (const l of courseLessons) {
        const at = progressMap.get(l._id?.toString())?.lastWatchedAt as Date | undefined;
        if (at && (!lastWatched || at > lastWatched.at)) lastWatched = { lesson: l, at };
      }

      // Where "Resume"/"Start" should land: the first unfinished lesson after
      // the last-watched one, falling back to the first unfinished overall.
      const lastIdx = lastWatched ? courseLessons.indexOf(lastWatched.lesson) : -1;
      const resumeLesson =
        (lastWatched && !isDone(lastWatched.lesson) ? lastWatched.lesson : null) ??
        courseLessons.slice(lastIdx + 1).find((l) => !isDone(l)) ??
        courseLessons.find((l) => !isDone(l)) ??
        courseLessons[0] ??
        null;

      const pick = (l: Doc | null) =>
        l
          ? {
              _id: l._id,
              title: l.title,
              youtubeVideoId: l.youtubeVideoId,
              cloudinaryVideoUrl: l.cloudinaryVideoUrl,
            }
          : null;

      return {
        ...course,
        totalLessons: courseLessons.length,
        totalDuration: courseLessons.reduce((s, l) => s + ((l.duration as number) || 0), 0),
        sectionCount: new Set(courseLessons.map((l) => (l.group as string | null) ?? l._id?.toString())).size,
        completedLessons: completedCount,
        progressPct: courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0,
        coverLesson: pick(courseLessons[0] ?? null),
        resumeLesson: pick(resumeLesson),
        lastWatchedAt: lastWatched?.at ?? null,
      };
    });

    return NextResponse.json({ courses: coursesWithProgress });
  } catch (err) {
    console.error("[academy]", err);
    return NextResponse.json({ error: "Failed to load courses." }, { status: 500 });
  }
}
