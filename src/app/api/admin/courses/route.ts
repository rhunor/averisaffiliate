import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    await dbConnect();
    const courses = await Course.find().sort({ sortOrder: 1 }).lean();
    const coursesWithLessons = await Promise.all(
      courses.map(async (course) => {
        const lessonCount = await Lesson.countDocuments({ courseId: (course as Record<string, unknown>)._id });
        return { ...course, lessonCount };
      })
    );
    return NextResponse.json({ courses: coursesWithLessons });
  } catch (err) {
    console.error("[admin/courses GET]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, moduleNumber, sortOrder } = body;

    if (!title || !description || !moduleNumber) {
      return NextResponse.json({ error: "title, description, and moduleNumber required." }, { status: 400 });
    }

    await dbConnect();
    const course = await Course.create({
      title,
      description,
      moduleNumber,
      sortOrder: sortOrder || moduleNumber,
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (err) {
    console.error("[admin/courses POST]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
