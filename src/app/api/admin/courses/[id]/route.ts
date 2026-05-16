import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const [course, lessons] = await Promise.all([
      Course.findById(id).lean(),
      Lesson.find({ courseId: id }).sort({ sortOrder: 1 }).lean(),
    ]);

    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    return NextResponse.json({ course, lessons });
  } catch (err) {
    console.error("[admin/courses/id GET]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    return NextResponse.json({ success: true, course });
  } catch (err) {
    console.error("[admin/courses/id PATCH]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

// Add lesson to course — upload video URL from Cloudinary (client-side upload flow)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, videoUrl, cloudinaryPublicId, duration, sortOrder, resources } = body;

    if (!title || !videoUrl || !cloudinaryPublicId) {
      return NextResponse.json({ error: "title, videoUrl, and cloudinaryPublicId required." }, { status: 400 });
    }

    await dbConnect();

    const course = await Course.findById(id);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    const existingCount = await Lesson.countDocuments({ courseId: id });

    const lesson = await Lesson.create({
      courseId: id,
      title,
      description: description || "",
      videoUrl,
      cloudinaryPublicId,
      duration: duration || 0,
      sortOrder: sortOrder ?? existingCount,
      resources: resources || [],
      isPublished: true,
    });

    await Course.findByIdAndUpdate(id, {
      $inc: { totalLessons: 1, totalDuration: duration || 0 },
    });

    return NextResponse.json({ success: true, lesson }, { status: 201 });
  } catch (err) {
    console.error("[admin/courses/id POST lesson]", err);
    return NextResponse.json({ error: "Failed to add lesson." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const { lessonId } = await req.json();

    await dbConnect();

    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (lesson) {
        await cloudinary.uploader.destroy(lesson.cloudinaryPublicId, { resource_type: "video" }).catch(() => {});
        await lesson.deleteOne();
        await Course.findByIdAndUpdate(id, {
          $inc: { totalLessons: -1, totalDuration: -(lesson.duration || 0) },
        });
      }
      return NextResponse.json({ success: true });
    }

    const lessons = await Lesson.find({ courseId: id });
    await Promise.all(
      lessons.map((l) =>
        cloudinary.uploader.destroy(l.cloudinaryPublicId, { resource_type: "video" }).catch(() => {})
      )
    );
    await Lesson.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/courses/id DELETE]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
