import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

/**
 * POST /api/admin/migrate/affiliate-lessons
 *
 * One-time migration that:
 *  1. Finds the Affiliate Marketing course
 *  2. Adds lesson at sort position 9 (lesson 10): "DM Sales Closing" — Part 3 — mRgAe6KSmiI
 *  3. Updates the Part 5 lesson (sort 11 / lesson 12) YouTube ID → ttfUeyRQAkw
 *  4. Adds "Conclusion" lesson at the end — I4JQii9PITY
 *
 * Safe to run multiple times — each step checks before creating/updating.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();

    const course = await Course.findOne({ title: { $regex: /affiliate marketing/i } });
    if (!course) {
      return NextResponse.json({ error: "Affiliate Marketing course not found." }, { status: 404 });
    }

    const courseId = course._id;
    const results: string[] = [];

    // ── Step 1: Add lesson at sortOrder 9 (Lesson 10) if not already there ─────
    const existingLesson10 = await Lesson.findOne({
      courseId,
      $or: [
        { sortOrder: 9 },
        { youtubeVideoId: "mRgAe6KSmiI" },
      ],
    });

    if (!existingLesson10) {
      await Lesson.create({
        courseId,
        title: "DM Sales Closing",
        description: "",
        youtubeVideoId: "mRgAe6KSmiI",
        group: "Part 3: DM Sales Closing",
        sortOrder: 9,
        isPublished: true,
        duration: 0,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });
      results.push("✓ Added lesson 10: DM Sales Closing (Part 3)");
    } else {
      results.push("– Lesson 10 (DM Sales Closing) already exists — skipped");
    }

    // ── Step 2: Update Part 5 lesson (sortOrder 11 / lesson 12) video link ──────
    const part5Lesson = await Lesson.findOne({
      courseId,
      $or: [
        { group: { $regex: /part.?5/i } },
        { sortOrder: 11 },
      ],
    });

    if (part5Lesson) {
      if (part5Lesson.youtubeVideoId !== "ttfUeyRQAkw") {
        const old = part5Lesson.youtubeVideoId;
        part5Lesson.youtubeVideoId = "ttfUeyRQAkw";
        await part5Lesson.save();
        results.push(`✓ Updated Part 5 lesson "${part5Lesson.title}" video: ${old} → ttfUeyRQAkw`);
      } else {
        results.push("– Part 5 lesson already has the new video ID — skipped");
      }
    } else {
      results.push("⚠ Part 5 lesson not found (check sort order or group name manually)");
    }

    // ── Step 3: Add Conclusion lesson if not already there ───────────────────────
    const existingConclusion = await Lesson.findOne({
      courseId,
      $or: [
        { youtubeVideoId: "I4JQii9PITY" },
        { group: { $regex: /conclusion/i } },
        { title: { $regex: /conclusion/i } },
      ],
    });

    if (!existingConclusion) {
      const totalLessons = await Lesson.countDocuments({ courseId });
      await Lesson.create({
        courseId,
        title: "Conclusion",
        description: "",
        youtubeVideoId: "I4JQii9PITY",
        group: "Conclusion",
        sortOrder: totalLessons,
        isPublished: true,
        duration: 0,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });
      results.push("✓ Added Conclusion lesson (Lesson 13)");
    } else {
      results.push("– Conclusion lesson already exists — skipped");
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[migrate/affiliate-lessons]", err);
    return NextResponse.json({ error: "Migration failed." }, { status: 500 });
  }
}
