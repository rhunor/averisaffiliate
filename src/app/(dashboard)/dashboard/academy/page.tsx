"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, CheckCircle2 } from "lucide-react";

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

const ACCENTS = ["#2ec97a", "#f5a623", "#6c9fff", "#d97bff"];
const ACCENT_MUTED = [
  "rgba(46,201,122,0.08)",
  "rgba(245,166,35,0.08)",
  "rgba(108,159,255,0.08)",
  "rgba(217,123,255,0.08)",
];

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }} className="shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
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
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">My Learning</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {courses.length} course{courses.length !== 1 ? "s" : ""} · pick up where you left off
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
          {courses.map((course, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            const accentBg = ACCENT_MUTED[idx % ACCENT_MUTED.length];
            const pct = course.progressPct;
            const hasStarted = course.completedLessons > 0;
            const isDone = pct === 100;

            return (
              <button
                key={course._id}
                onClick={() => router.push(`/dashboard/academy/${course._id}`)}
                className="w-full text-left rounded-2xl bg-white overflow-hidden active:scale-[0.985] transition-transform"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)" }}
              >
                {/* Top accent strip */}
                <div className="h-1 w-full" style={{ background: accent }} />

                <div className="p-4">
                  {/* Top row: module badge + progress ring */}
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ background: accentBg, color: accent }}
                    >
                      Module {course.moduleNumber}
                    </span>

                    {/* Progress ring + percentage */}
                    <div className="flex flex-col items-center gap-0.5">
                      <ProgressRing pct={pct} color={accent} />
                      <span className="text-[9px] font-bold" style={{ color: accent }}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Title + description */}
                  <h2 className="font-bold text-base text-gray-900 leading-snug mb-1 pr-2">
                    {course.title}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <BookOpen className="h-3 w-3" />
                      {course.totalLessons} videos
                    </div>
                    {hasStarted && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <CheckCircle2 className="h-3 w-3" style={{ color: accent }} />
                        <span style={{ color: accent }}>{course.completedLessons} completed</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar (only if started) */}
                  {hasStarted && (
                    <div className="mb-4">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: accent, transition: "width 0.5s ease" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: isDone ? accentBg : accent,
                      color: isDone ? accent : "#fff",
                    }}
                  >
                    {isDone ? "Review Course" : hasStarted ? "Continue Learning" : "Start Learning"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
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
