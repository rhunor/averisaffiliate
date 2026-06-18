import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";

function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { lessonId } = await params;
    const body = await req.json();
    const { title, description, youtubeUrl, cloudinaryVideoUrl, cloudinaryPublicId, group, duration } = body;

    await dbConnect();
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (group !== undefined) lesson.group = group || null;
    if (duration !== undefined) lesson.duration = Number(duration) || lesson.duration;

    if (youtubeUrl !== undefined) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json({ error: "Could not extract a valid YouTube video ID." }, { status: 400 });
      }
      lesson.youtubeVideoId = videoId;
      lesson.cloudinaryVideoUrl = "";
      lesson.cloudinaryPublicId = "";
    }

    if (cloudinaryVideoUrl !== undefined) {
      lesson.cloudinaryVideoUrl = cloudinaryVideoUrl;
      lesson.cloudinaryPublicId = cloudinaryPublicId || "";
      lesson.youtubeVideoId = "";
    }

    await lesson.save();

    // Keep Course.totalDuration in sync if duration changed
    if (duration !== undefined) {
      await Course.findByIdAndUpdate(lesson.courseId, {
        $inc: { totalDuration: (Number(duration) || 0) - (lesson.duration || 0) },
      });
    }

    return NextResponse.json({ success: true, lesson });
  } catch (err) {
    console.error("[admin/lessons/id PATCH]", err);
    return NextResponse.json({ error: "Failed to update lesson." }, { status: 500 });
  }
}
