"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

const TRACK_COLORS = [
  {
    card: "linear-gradient(135deg, #0d2b20 0%, #1a4d35 100%)",
    accent: "#2ec97a",
    accentBg: "rgba(46,201,122,0.2)",
    shadow: "rgba(46,201,122,0.18)",
  },
  {
    card: "linear-gradient(135deg, #2a1a00 0%, #4a3000 100%)",
    accent: "#f5a623",
    accentBg: "rgba(245,166,35,0.2)",
    shadow: "rgba(245,166,35,0.18)",
  },
  {
    card: "linear-gradient(135deg, #0d1a40 0%, #1a2d6e 100%)",
    accent: "#6c9fff",
    accentBg: "rgba(108,159,255,0.2)",
    shadow: "rgba(108,159,255,0.18)",
  },
  {
    card: "linear-gradient(135deg, #2a0a30 0%, #4e1060 100%)",
    accent: "#d97bff",
    accentBg: "rgba(217,123,255,0.2)",
    shadow: "rgba(217,123,255,0.18)",
  },
];

function formatMins(seconds: number) {
  if (!seconds) return "";
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl mb-6"
        style={{ background: "linear-gradient(135deg, #0d1f1a 0%, #1a3d2f 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full" style={{ background: "rgba(46,201,122,0.07)" }} />
        <div className="absolute -bottom-14 left-5 w-32 h-32 rounded-full" style={{ background: "rgba(46,201,122,0.04)" }} />
        <div className="relative px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: "#2ec97a" }}>
            Learning
          </p>
          <h1 className="text-2xl font-black text-white leading-tight mb-1">Academy</h1>
          <p className="text-white/55 text-sm">Learn, grow, and earn with our video courses</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">No courses available yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-bold text-base text-foreground">Choose Your Path</p>
            <p className="text-muted-foreground text-xs mt-0.5">Select a track to start learning</p>
          </div>

          <div className="flex flex-col gap-4">
            {courses.map((course, idx) => {
              const colors = TRACK_COLORS[idx % TRACK_COLORS.length];
              const isComplete = course.progressPct === 100;
              const hasStarted = course.completedLessons > 0;

              return (
                <button
                  key={course._id}
                  onClick={() => router.push(`/dashboard/academy/${course._id}`)}
                  className="w-full text-left rounded-2xl overflow-hidden relative active:scale-[0.98] transition-transform"
                  style={{
                    background: colors.card,
                    boxShadow: `0 8px 32px ${colors.shadow}`,
                  }}
                >
                  {/* Decorative circle */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                    style={{ background: colors.accent, opacity: 0.12 }}
                  />

                  <div className="relative p-5">
                    <div
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-3 px-2.5 py-1 rounded-full"
                      style={{ background: colors.accentBg, color: colors.accent }}
                    >
                      Module {course.moduleNumber}
                    </div>

                    <h2 className="text-[1.15rem] font-black text-white leading-tight mb-2">
                      {course.title}
                    </h2>
                    <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
                        {course.totalLessons} lessons
                      </div>
                      {course.totalDuration > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
                          {formatMins(course.totalDuration)}
                        </div>
                      )}
                      {hasStarted && (
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
                          {course.completedLessons}/{course.totalLessons} done
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    {hasStarted && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-white/40 mb-1.5">
                          <span>{course.completedLessons} of {course.totalLessons} completed</span>
                          <span>{course.progressPct}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${course.progressPct}%`, background: colors.accent }}
                          />
                        </div>
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm"
                      style={{ background: colors.accent, color: "#0d1f1a" }}
                    >
                      <span>
                        {isComplete ? "Review Course" : hasStarted ? "Continue Learning" : "Start Learning"}
                      </span>
                      <span className="text-base">→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
