"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, CheckCircle, Clock, Lock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  duration: number;
  sortOrder: number;
  isPublished: boolean;
  completed: boolean;
  watchedSeconds: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  moduleNumber: number;
  totalLessons: number;
  totalDuration: number;
  completedLessons: number;
  progressPct: number;
  lessons: Lesson[];
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/academy/${courseId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.course) setCourse(d.course);
        else router.push("/dashboard/academy");
      })
      .finally(() => setLoading(false));
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  const isComplete = course.progressPct === 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back nav */}
      <Link href="/dashboard/academy" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Academy
      </Link>

      {/* Course header */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-primary to-primary-light">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <Badge className="bg-white/20 text-white border-white/30 mb-2">Module {course.moduleNumber}</Badge>
            <h1 className="text-white text-xl font-bold">{course.title}</h1>
          </div>
        </div>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{course.description}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              {course.totalLessons} lessons
            </span>
            {course.totalDuration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(course.totalDuration)} total
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-success" />
              {course.completedLessons} completed
            </span>
          </div>
          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-semibold ${isComplete ? "text-success" : "text-secondary"}`}>
                {course.progressPct}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isComplete ? "bg-success" : "bg-secondary"}`}
                style={{ width: `${course.progressPct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons list */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson._id}
                href={`/dashboard/academy/${courseId}/${lesson._id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
              >
                {/* Number / status icon */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  lesson.completed
                    ? "bg-success text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-secondary/10 group-hover:text-secondary"
                }`}>
                  {lesson.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${lesson.completed ? "text-muted-foreground" : "text-foreground"}`}>
                    {lesson.title}
                  </p>
                  {lesson.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.description}</p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {lesson.duration > 0 && (
                    <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</span>
                  )}
                  <Play className="h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
