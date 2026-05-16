import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Progress from "@/models/Progress";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const { lessonId, watchedSeconds, completed } = await req.json();

    if (!lessonId) return NextResponse.json({ error: "lessonId required." }, { status: 400 });

    await dbConnect();

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    const userId = new mongoose.Types.ObjectId(sessionUser.id as string);

    const progress = await Progress.findOneAndUpdate(
      { userId, lessonId: lesson._id },
      {
        $set: {
          courseId: lesson.courseId,
          lastWatchedAt: new Date(),
          ...(watchedSeconds !== undefined && { watchedSeconds }),
          ...(completed !== undefined && { completed }),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, progress });
  } catch (err) {
    console.error("[academy/progress]", err);
    return NextResponse.json({ error: "Failed to update progress." }, { status: 500 });
  }
}
