import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

const NEW_DRIVE_URL =
  "https://drive.google.com/drive/folders/1nXtPLU19u_zJ97A-yO0YD03j-IR-ldmB";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();
    const results: string[] = [];

    const course = await Course.findOne({ title: { $regex: /affiliate marketing/i } });
    if (!course) {
      return NextResponse.json({ error: "Affiliate Marketing course not found." }, { status: 404 });
    }
    const courseId = course._id;

    // ── 1. Update Lesson 12 AI Videos Google Drive resource link ────────────────
    const lesson12Lessons = await Lesson.find({
      courseId,
      group: { $regex: /lesson.?12|ai.?video/i },
    });

    let driveUpdated = false;
    for (const l of lesson12Lessons) {
      const idx = l.resources.findIndex(
        (r: { name: string; url: string }) => r.url.includes("drive.google.com")
      );
      if (idx !== -1) {
        const old = l.resources[idx].url;
        l.resources[idx].url = NEW_DRIVE_URL;
        l.markModified("resources");
        await l.save();
        results.push(`✓ Updated Google Drive link in "${l.title}": ${old.slice(-30)} → new URL`);
        driveUpdated = true;
      }
    }
    if (!driveUpdated) {
      results.push("⚠ No Google Drive resource found in Lesson 12 lessons");
    }

    // ── 2. Add Lesson 1 Part 2 (YouTube ZDG-wVkpfvI) ────────────────────────────
    // First: check if Part 2 already exists
    const existingPart2 = await Lesson.findOne({
      courseId,
      youtubeVideoId: "ZDG-wVkpfvI",
    });

    if (existingPart2) {
      results.push("– Lesson 1 Part 2 already exists — skipped");
    } else {
      // Update existing Lesson 1 (Cloudinary, sortOrder -1) to be Part 1 in a group
      const lesson1 = await Lesson.findOne({
        courseId,
        sortOrder: -1,
        cloudinaryVideoUrl: { $ne: "" },
      });

      if (lesson1) {
        lesson1.group = "Lesson 1: Mindset";
        if (!lesson1.title.toLowerCase().startsWith("part 1")) {
          lesson1.title = `Part 1 — ${lesson1.title.replace(/^Lesson 1:\s*/i, "")}`;
        }
        await lesson1.save();
        results.push(`✓ Converted existing Lesson 1 to Part 1 in group "Lesson 1: Mindset"`);
      } else {
        results.push("⚠ Existing Lesson 1 (sortOrder -1) not found — check if it was added");
      }

      // Add Part 2
      await Lesson.create({
        courseId,
        title: "Part 2 — Affiliate Marketing Introduction",
        description: "",
        youtubeVideoId: "ZDG-wVkpfvI",
        cloudinaryVideoUrl: "",
        cloudinaryPublicId: "",
        group: "Lesson 1: Mindset",
        sortOrder: -0.5,
        isPublished: true,
        duration: 0,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });
      results.push("✓ Added Lesson 1 Part 2 (YouTube ZDG-wVkpfvI) at sortOrder -0.5");
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[migrate/june19-updates]", err);
    return NextResponse.json({ error: "Migration failed." }, { status: 500 });
  }
}
