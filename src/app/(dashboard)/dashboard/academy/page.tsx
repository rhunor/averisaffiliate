"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  description: string;
  moduleNumber: number;
  totalLessons: number;
  totalDuration: number;
  completedLessons: number;
  progressPct: number;
}

const THEMES = [
  { accent: "#2ec97a", from: "#0a2018", to: "#1a4d35" },
  { accent: "#f5a623", from: "#2a1a00", to: "#4a3000" },
  { accent: "#6c9fff", from: "#0a1a30", to: "#1a3060" },
  { accent: "#d97bff", from: "#1a0a2a", to: "#3a1a50" },
];

export default function AcademyPage() {
  const router = useRouter();
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
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Academy Trainings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No courses yet</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => {
            const theme = THEMES[(course.moduleNumber - 1) % THEMES.length];
            const pct = course.progressPct;
            const hasStarted = course.completedLessons > 0;
            const isDone = pct === 100;

            return (
              <button
                key={course._id}
                onClick={() => router.push(`/dashboard/academy/${course._id}`)}
                className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.985] transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                  boxShadow: `0 8px 32px ${theme.accent}28`,
                }}
              >
                <div className="p-5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 inline-block"
                    style={{ background: `${theme.accent}22`, color: theme.accent }}
                  >
                    Module {course.moduleNumber}
                  </span>

                  <h2 className="font-extrabold text-white text-[1.2rem] leading-tight mb-2">
                    {course.title}
                  </h2>
                  <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                      {course.totalLessons} lessons
                    </div>
                    {hasStarted && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: theme.accent }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                        {course.completedLessons}/{course.totalLessons} done
                      </div>
                    )}
                  </div>

                  {hasStarted && (
                    <div className="mb-4">
                      <div
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: theme.accent }}
                        />
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {pct}% complete
                      </div>
                    </div>
                  )}

                  <div
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold"
                    style={{
                      background: isDone ? `${theme.accent}22` : theme.accent,
                      color: isDone ? theme.accent : theme.from,
                    }}
                  >
                    <span>{isDone ? "Review Course" : hasStarted ? "Continue Learning" : "Start Learning"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
