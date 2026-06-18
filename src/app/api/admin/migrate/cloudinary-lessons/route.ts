import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

/**
 * POST /api/admin/migrate/cloudinary-lessons
 *
 * 1. Finds Affiliate Marketing course → adds Lesson 1 as the first lesson (sortOrder -1)
 * 2. Finds Affiliate Marketing course → updates/adds Part 4 Bonus lesson with Cloudinary video
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();
    const results: string[] = [];

    // ── 1. Lesson 1: Mindset and getting into Result mode (goes in Affiliate Marketing) ──
    const affiliateCourseForLesson1 = await Course.findOne({
      title: { $regex: /affiliate marketing/i },
    });

    if (!affiliateCourseForLesson1) {
      const allCourses = await Course.find().select("title").lean();
      results.push(`⚠ Affiliate Marketing course not found. All courses: ${allCourses.map((c) => (c as Record<string, unknown>).title).join(", ")}`);
    } else {
      results.push(`✓ Found course: "${affiliateCourseForLesson1.title}"`);

      const alreadyExists = await Lesson.findOne({
        courseId: affiliateCourseForLesson1._id,
        cloudinaryVideoUrl: "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781445/Lesson_1v_0_20260618094004_wfmdsj.mp4",
      });

      if (alreadyExists) {
        results.push(`– Lesson 1 already added — skipped`);
      } else {
        await Lesson.create({
          courseId: affiliateCourseForLesson1._id,
          title: "Lesson 1: Mindset and getting into Result mode",
          description: "",
          youtubeVideoId: "",
          cloudinaryVideoUrl: "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781445/Lesson_1v_0_20260618094004_wfmdsj.mp4",
          cloudinaryPublicId: "Lesson_1v_0_20260618094004_wfmdsj",
          group: null,
          sortOrder: -1,
          isPublished: true,
          duration: 0,
        });
        await Course.findByIdAndUpdate(affiliateCourseForLesson1._id, { $inc: { totalLessons: 1 } });
        results.push(`✓ Added Lesson 1 "Mindset and getting into Result mode" as the first lesson`);
      }
    }

    // ── 2. Part 4 Bonus — Affiliate Marketing ────────────────────────────────────
    const affiliateCourse = await Course.findOne({
      title: { $regex: /affiliate marketing/i },
    });

    if (!affiliateCourse) {
      results.push(`⚠ Affiliate Marketing course not found`);
    } else {
      results.push(`✓ Found affiliate course: "${affiliateCourse.title}"`);

      // Look for existing Part 4 / Bonus lesson
      const existingBonus = await Lesson.findOne({
        courseId: affiliateCourse._id,
        $or: [
          { group: { $regex: /part.?4/i } },
          { group: { $regex: /bonus/i } },
          { title: { $regex: /bonus/i } },
          { cloudinaryVideoUrl: "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781821/VID_20260618_120713_717_jtdbxk.mp4" },
        ],
      });

      if (existingBonus) {
        existingBonus.cloudinaryVideoUrl = "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781821/VID_20260618_120713_717_jtdbxk.mp4";
        existingBonus.cloudinaryPublicId = "VID_20260618_120713_717_jtdbxk";
        existingBonus.youtubeVideoId = "";
        await existingBonus.save();
        results.push(`✓ Updated Part 4 Bonus lesson "${existingBonus.title}" with Cloudinary video`);
      } else {
        const totalLessons = await Lesson.countDocuments({ courseId: affiliateCourse._id });
        await Lesson.create({
          courseId: affiliateCourse._id,
          title: "Bonus Lesson",
          description: "",
          youtubeVideoId: "",
          cloudinaryVideoUrl: "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781821/VID_20260618_120713_717_jtdbxk.mp4",
          cloudinaryPublicId: "VID_20260618_120713_717_jtdbxk",
          group: "Part 4: Bonus",
          sortOrder: totalLessons,
          isPublished: true,
          duration: 0,
        });
        await Course.findByIdAndUpdate(affiliateCourse._id, { $inc: { totalLessons: 1 } });
        results.push(`✓ Created Part 4 Bonus lesson in "${affiliateCourse.title}"`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[migrate/cloudinary-lessons]", err);
    return NextResponse.json({ error: "Migration failed." }, { status: 500 });
  }
}
