"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
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

const TRACK_COLORS = [
  { card: "linear-gradient(135deg, #0d2b20 0%, #1a4d35 100%)", accent: "#2ec97a", shadow: "rgba(46,201,122,0.18)", numBg: "rgba(46,201,122,0.15)", numColor: "#2ec97a", thumb: "linear-gradient(135deg, #0d2b20, #1a4d35)" },
  { card: "linear-gradient(135deg, #2a1a00 0%, #4a3000 100%)", accent: "#f5a623", shadow: "rgba(245,166,35,0.18)", numBg: "rgba(245,166,35,0.15)", numColor: "#f5a623", thumb: "linear-gradient(135deg, #2a1a00, #4a3000)" },
  { card: "linear-gradient(135deg, #0d1a40 0%, #1a2d6e 100%)", accent: "#6c9fff", shadow: "rgba(108,159,255,0.18)", numBg: "rgba(108,159,255,0.15)", numColor: "#6c9fff", thumb: "linear-gradient(135deg, #0d1a40, #1a2d6e)" },
  { card: "linear-gradient(135deg, #2a0a30 0%, #4e1060 100%)", accent: "#d97bff", shadow: "rgba(217,123,255,0.18)", numBg: "rgba(217,123,255,0.15)", numColor: "#d97bff", thumb: "linear-gradient(135deg, #2a0a30, #4e1060)" },
];

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

  const colors = TRACK_COLORS[(course.moduleNumber - 1) % TRACK_COLORS.length];
  const hasStarted = course.completedLessons > 0;
  const isComplete = course.progressPct === 100;

  return (
    <div className="animate-fade-in -mx-4 lg:-mx-6">
      {/* Hero header */}
      <div className="relative overflow-hidden px-4 lg:px-6 pt-4 pb-6" style={{ background: colors.card }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: colors.accent, opacity: 0.08 }} />
        <div className="absolute -bottom-12 left-8 w-28 h-28 rounded-full" style={{ background: colors.accent, opacity: 0.05 }} />

        <div className="relative">
          <Link
            href="/dashboard/academy"
            className="inline-flex items-center gap-2 text-xs font-medium mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>

          <div
            className="inline-flex items-center text-[10px] font-bold tracking-widest uppercase mb-2 px-2.5 py-1 rounded-full block"
            style={{ background: "rgba(255,255,255,0.12)", color: colors.accent }}
          >
            Module {course.moduleNumber}
          </div>

          <h1 className="text-xl font-black text-white leading-tight mb-1.5">{course.title}</h1>
          <p className="text-white/55 text-xs mb-4">{course.totalLessons} lessons{course.totalDuration > 0 && ` · ${formatDuration(course.totalDuration)}`}</p>

          {/* Progress */}
          {hasStarted && (
            <div>
              <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span>{course.completedLessons} of {course.totalLessons} completed</span>
                <span>{course.progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${course.progressPct}%`, background: colors.accent }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons list */}
      <div className="px-4 lg:px-6 pt-4 pb-24">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          {isComplete ? "All Lessons — Completed" : hasStarted ? "Keep Going" : "All Lessons"}
        </p>

        <div className="flex flex-col gap-2.5">
          {course.lessons.map((lesson, index) => {
            const isLocked = false; // all lessons accessible once course is open

            return (
              <button
                key={lesson._id}
                onClick={() => !isLocked && router.push(`/dashboard/academy/${courseId}/${lesson._id}`)}
                disabled={isLocked}
                className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 text-left shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                {/* Thumbnail */}
                <div
                  className="w-[72px] h-[52px] rounded-xl flex-shrink-0 overflow-hidden relative flex items-center justify-center"
                  style={{ background: colors.thumb }}
                >
                  {lesson.youtubeVideoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/mqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  {/* Play/lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-white/70" />
                    ) : lesson.completed ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: colors.accent }}>
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <svg width="7" height="9" viewBox="0 0 8 10" fill="#0d1f1a">
                          <polygon points="0,0 8,5 0,10" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Progress bar on thumb bottom */}
                  {lesson.watchedSeconds > 0 && !lesson.completed && lesson.duration > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, (lesson.watchedSeconds / lesson.duration) * 100)}%`,
                          background: colors.accent,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
                    style={{ color: colors.numColor }}
                  >
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </div>
                  <p
                    className="text-sm font-semibold leading-snug line-clamp-2"
                    style={{ color: lesson.completed ? "#9ca3af" : "#111827" }}
                  >
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {lesson.duration > 0 && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "#f3f4f6", color: "#9ca3af" }}
                      >
                        {formatDuration(lesson.duration)}
                      </span>
                    )}
                    {lesson.completed && (
                      <span className="text-[10px] font-semibold" style={{ color: colors.accent }}>
                        ✓ Completed
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] text-gray-400">Locked</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" className="shrink-0">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
