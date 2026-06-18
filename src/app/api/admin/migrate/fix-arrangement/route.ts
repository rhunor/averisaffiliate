import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

/**
 * POST /api/admin/migrate/fix-arrangement
 *
 * Fixes three arrangement issues in Affiliate Marketing:
 * 1. DM Sales Closing → moves it into "Lesson 10: Sales Closing" group as Part 3
 * 2. Conclusion → moves it before Bonus Lessons (sortOrder 27.5)
 * 3. Bonus 4 → adds new Bonus 4 lesson with Cloudinary video at end of Bonus Lessons
 *    and removes the wrongly-placed Cloudinary URL from Bonus 1
 */
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

    // ── 1. Fix DM Sales Closing ──────────────────────────────────────────────────
    const dmLesson = await Lesson.findOne({ courseId, youtubeVideoId: "mRgAe6KSmiI" });
    if (dmLesson) {
      const changed: string[] = [];
      if (dmLesson.group !== "Lesson 10: Sales Closing") {
        dmLesson.group = "Lesson 10: Sales Closing";
        changed.push("group → Lesson 10: Sales Closing");
      }
      if (!dmLesson.title.startsWith("Part 3")) {
        dmLesson.title = "Part 3 — DM Sales Closing";
        changed.push("title → Part 3 — DM Sales Closing");
      }
      if (dmLesson.sortOrder !== 21.5) {
        dmLesson.sortOrder = 21.5;
        changed.push("sortOrder → 21.5 (after Part 2 Sales Closing)");
      }
      if (changed.length > 0) {
        await dmLesson.save();
        results.push(`✓ Fixed DM Sales Closing: ${changed.join(", ")}`);
      } else {
        results.push("– DM Sales Closing already in correct position — skipped");
      }
    } else {
      results.push("⚠ DM Sales Closing lesson not found (run affiliate-lessons migration first)");
    }

    // ── 2. Fix Conclusion position ───────────────────────────────────────────────
    const conclusionLesson = await Lesson.findOne({
      courseId,
      $or: [
        { youtubeVideoId: "I4JQii9PITY" },
        { title: { $regex: /conclusion/i } },
      ],
    });
    if (conclusionLesson) {
      if (conclusionLesson.sortOrder !== 27.5) {
        const old = conclusionLesson.sortOrder;
        conclusionLesson.sortOrder = 27.5;
        await conclusionLesson.save();
        results.push(`✓ Moved Conclusion from sortOrder ${old} → 27.5 (after AI Videos, before Bonus)`);
      } else {
        results.push("– Conclusion already at correct position — skipped");
      }
    } else {
      results.push("⚠ Conclusion lesson not found");
    }

    // ── 3. Fix Bonus: remove Cloudinary from Bonus 1, add as new Bonus 4 ────────
    const BONUS4_URL = "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781781821/VID_20260618_120713_717_jtdbxk.mp4";

    // Check if Bonus 4 already exists
    const bonus4Exists = await Lesson.findOne({
      courseId,
      cloudinaryVideoUrl: BONUS4_URL,
      title: { $regex: /bonus.?4|part.?4.*bonus/i },
    });

    if (bonus4Exists) {
      results.push("– Bonus 4 lesson already exists — skipped");
    } else {
      // Remove Cloudinary URL from Bonus 1 (it was placed there by mistake)
      const bonus1ForClear = await Lesson.findOne({
        courseId,
        title: { $regex: /bonus.?1/i },
        cloudinaryVideoUrl: BONUS4_URL,
      });
      if (bonus1ForClear) {
        bonus1ForClear.cloudinaryVideoUrl = "";
        bonus1ForClear.cloudinaryPublicId = "";
        await bonus1ForClear.save();
        results.push(`✓ Cleared wrongly-placed Cloudinary URL from "${bonus1ForClear.title}"`);
      }

      // Add Bonus 4 at end of Bonus Lessons group (sortOrder 30.5 — after Bonus 3 at 30)
      await Lesson.create({
        courseId,
        title: "Bonus 4 — Running Ads with Telegram & WhatsApp TVs",
        description: "",
        youtubeVideoId: "",
        cloudinaryVideoUrl: BONUS4_URL,
        cloudinaryPublicId: "VID_20260618_120713_717_jtdbxk",
        group: "Bonus Lessons",
        sortOrder: 30.5,
        isPublished: true,
        duration: 0,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });
      results.push("✓ Created Bonus 4 with Cloudinary video in Bonus Lessons group");
    }

    // ── 4. Restore Bonus 1 YouTube video ────────────────────────────────────────
    const bonus1 = await Lesson.findOne({
      courseId,
      title: { $regex: /bonus.?1|running ads with telegram/i },
    });
    if (bonus1) {
      if (bonus1.youtubeVideoId !== "3NHaW3kMsFo") {
        bonus1.youtubeVideoId = "3NHaW3kMsFo";
        bonus1.cloudinaryVideoUrl = "";
        bonus1.cloudinaryPublicId = "";
        await bonus1.save();
        results.push(`✓ Restored Bonus 1 "${bonus1.title}" YouTube video → 3NHaW3kMsFo`);
      } else {
        results.push("– Bonus 1 YouTube video already restored — skipped");
      }
    } else {
      results.push("⚠ Bonus 1 lesson not found");
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[migrate/fix-arrangement]", err);
    return NextResponse.json({ error: "Migration failed." }, { status: 500 });
  }
}
