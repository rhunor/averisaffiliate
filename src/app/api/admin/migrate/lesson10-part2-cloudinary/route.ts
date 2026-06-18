import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

const CLOUDINARY_URL =
  "https://res.cloudinary.com/dlvac2rkb/video/upload/v1781804681/VID_20260618_174232_356_2_zjlyhd.mp4";
const CLOUDINARY_PUBLIC_ID = "VID_20260618_174232_356_2_zjlyhd";

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

    const lesson = await Lesson.findOne({
      courseId: course._id,
      group: { $regex: /lesson.?10.*sales.?closing/i },
      title: { $regex: /part.?2/i },
    });

    if (!lesson) {
      return NextResponse.json({
        success: false,
        results: ["⚠ Lesson 10 Part 2 (Practical Sales Closing) not found"],
      });
    }

    if (lesson.cloudinaryVideoUrl === CLOUDINARY_URL) {
      return NextResponse.json({
        success: true,
        results: [`– "${lesson.title}" already has this Cloudinary video — skipped`],
      });
    }

    const oldYt = lesson.youtubeVideoId;
    lesson.youtubeVideoId = "";
    lesson.cloudinaryVideoUrl = CLOUDINARY_URL;
    lesson.cloudinaryPublicId = CLOUDINARY_PUBLIC_ID;
    await lesson.save();

    return NextResponse.json({
      success: true,
      results: [
        `✓ Updated "${lesson.title}" (${lesson.group})`,
        `  YouTube ${oldYt || "(none)"} → removed`,
        `  Cloudinary video set`,
      ],
    });
  } catch (err) {
    console.error("[migrate/lesson10-part2-cloudinary]", err);
    return NextResponse.json({ error: "Migration failed." }, { status: 500 });
  }
}
