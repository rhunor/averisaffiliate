import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();
    const results: string[] = [];

    const allCourses = await Course.find().select("title _id totalLessons").lean();
    results.push(`── All courses (${allCourses.length}) ──`);
    for (const c of allCourses) {
      const r = c as Record<string, unknown>;
      results.push(`  • ${r.title} (id: ${r._id}, totalLessons: ${r.totalLessons})`);
    }

    const mindset = allCourses.find((c) =>
      ((c as Record<string, unknown>).title as string)?.toLowerCase().includes("mindset")
    );
    const affiliate = allCourses.find((c) =>
      ((c as Record<string, unknown>).title as string)?.toLowerCase().includes("affiliate")
    );

    for (const course of [mindset, affiliate].filter(Boolean)) {
      const r = course as Record<string, unknown>;
      const lessons = await Lesson.find({ courseId: r._id })
        .sort({ sortOrder: 1 })
        .select("title youtubeVideoId cloudinaryVideoUrl isPublished group sortOrder")
        .lean();

      results.push(`── ${r.title} — ${lessons.length} lessons ──`);
      for (const l of lessons) {
        const lr = l as Record<string, unknown>;
        const video = lr.cloudinaryVideoUrl
          ? `Cloudinary: ${(lr.cloudinaryVideoUrl as string).slice(-40)}`
          : lr.youtubeVideoId
          ? `YouTube: ${lr.youtubeVideoId}`
          : "NO VIDEO";
        const pub = lr.isPublished ? "✓pub" : "✗unpub";
        results.push(
          `  [${lr.sortOrder}] ${pub} "${lr.title}" | group:${lr.group ?? "none"} | ${video}`
        );
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[migrate/diagnose]", err);
    return NextResponse.json({ error: "Diagnose failed." }, { status: 500 });
  }
}
