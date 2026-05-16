"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Play, Clock, CheckCircle, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

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
}

export default function AcademyPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/academy")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Academy</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Learn, grow, and earn with our video courses</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => {
            const isComplete = course.progressPct === 100;
            const hasStarted = course.completedLessons > 0;

            return (
              <Link key={course._id} href={`/dashboard/academy/${course._id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  {/* Thumbnail / gradient header */}
                  <div className="relative h-40 bg-gradient-to-br from-primary to-primary-light overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        Module {course.moduleNumber}
                      </Badge>
                    </div>
                    {isComplete && (
                      <div className="absolute top-3 right-3">
                        <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-base leading-tight line-clamp-2">{course.title}</p>
                    </div>
                  </div>

                  <CardContent className="pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""}
                      </span>
                      {course.totalDuration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(course.totalDuration)}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {course.completedLessons} / {course.totalLessons} lessons
                        </span>
                        <span className={isComplete ? "text-success font-semibold" : "text-secondary font-semibold"}>
                          {course.progressPct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isComplete ? "bg-success" : "bg-secondary"}`}
                          style={{ width: `${course.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${
                        isComplete
                          ? "bg-success/10 text-success"
                          : hasStarted
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {isComplete ? (
                          <><CheckCircle className="h-3 w-3" /> Completed</>
                        ) : hasStarted ? (
                          <><Play className="h-3 w-3" /> Continue</>
                        ) : (
                          <><Play className="h-3 w-3" /> Start course</>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
