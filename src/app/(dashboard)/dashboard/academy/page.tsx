"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  duration: number;
  sortOrder: number;
  completed: boolean;
  youtubeVideoId?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  moduleNumber: number;
  totalLessons: number;
  totalDuration: number;
  completedLessons: number;
  progressPct: number;
  lessons?: Lesson[];
}

const TRACK_COLORS = [
  {
    card: "linear-gradient(135deg, #0d2b20 0%, #1a4d35 100%)",
    accent: "#2ec97a",
    accentBg: "rgba(46,201,122,0.2)",
    shadow: "rgba(46,201,122,0.18)",
    numBg: "rgba(46,201,122,0.12)",
    numColor: "#2ec97a",
    thumb: "linear-gradient(135deg, #0d2b20, #1a4d35)",
  },
  {
    card: "linear-gradient(135deg, #2a1a00 0%, #4a3000 100%)",
    accent: "#f5a623",
    accentBg: "rgba(245,166,35,0.2)",
    shadow: "rgba(245,166,35,0.18)",
    numBg: "rgba(245,166,35,0.12)",
    numColor: "#f5a623",
    thumb: "linear-gradient(135deg, #2a1a00, #4a3000)",
  },
  {
    card: "linear-gradient(135deg, #0d1a40 0%, #1a2d6e 100%)",
    accent: "#6c9fff",
    accentBg: "rgba(108,159,255,0.2)",
    shadow: "rgba(108,159,255,0.18)",
    numBg: "rgba(108,159,255,0.12)",
    numColor: "#6c9fff",
    thumb: "linear-gradient(135deg, #0d1a40, #1a2d6e)",
  },
  {
    card: "linear-gradient(135deg, #2a0a30 0%, #4e1060 100%)",
    accent: "#d97bff",
    accentBg: "rgba(217,123,255,0.2)",
    shadow: "rgba(217,123,255,0.18)",
    numBg: "rgba(217,123,255,0.12)",
    numColor: "#d97bff",
    thumb: "linear-gradient(135deg, #2a0a30, #4e1060)",
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
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [sheetLessons, setSheetLessons] = useState<Record<string, Lesson[]>>({});
  const [loadingSheet, setLoadingSheet] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/academy")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .finally(() => setLoading(false));
  }, []);

  const openSheet = useCallback(async (courseId: string) => {
    setActiveSheet(courseId);
    document.body.style.overflow = "hidden";

    if (sheetLessons[courseId]) return;
    setLoadingSheet(courseId);
    try {
      const res = await fetch(`/api/academy/${courseId}`);
      const data = await res.json();
      if (data.course?.lessons) {
        setSheetLessons((prev) => ({ ...prev, [courseId]: data.course.lessons }));
      }
    } finally {
      setLoadingSheet(null);
    }
  }, [sheetLessons]);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    document.body.style.overflow = "";
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
      <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #0d1f1a 0%, #1a3d2f 100%)" }}>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full" style={{ background: "rgba(46,201,122,0.07)" }} />
        <div className="absolute -bottom-14 left-5 w-32 h-32 rounded-full" style={{ background: "rgba(46,201,122,0.04)" }} />
        <div className="relative px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5" style={{ color: "#2ec97a" }}>Learning</p>
          <h1 className="text-2xl font-black text-white leading-tight mb-1">Academy</h1>
          <p className="text-white/55 text-sm">Learn, grow, and earn with our video courses</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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
                  onClick={() => openSheet(course._id)}
                  className="w-full text-left rounded-2xl overflow-hidden relative"
                  style={{
                    background: colors.card,
                    boxShadow: `0 8px 32px ${colors.shadow}`,
                  }}
                >
                  {/* Decorative circle */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: colors.accent, opacity: 0.12 }} />

                  <div className="relative p-5">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-3 px-2.5 py-1 rounded-full" style={{ background: colors.accentBg, color: colors.accent }}>
                      Module {course.moduleNumber}
                    </div>

                    <h2 className="text-[1.15rem] font-black text-white leading-tight mb-2">{course.title}</h2>
                    <p className="text-white/50 text-xs leading-relaxed mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex gap-4 mb-4">
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
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${course.progressPct}%`, background: colors.accent }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm" style={{ background: colors.accent, color: "#0d1f1a" }}>
                      <span>{isComplete ? "Review Course" : hasStarted ? "Continue" : "Start Learning"}</span>
                      <span className="text-base">→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom sheets */}
      {courses.map((course, idx) => {
        const colors = TRACK_COLORS[idx % TRACK_COLORS.length];
        const lessons = sheetLessons[course._id] || [];
        const isOpen = activeSheet === course._id;

        return (
          <div key={course._id}>
            {/* Overlay */}
            <div
              onClick={closeSheet}
              className="fixed inset-0 z-40 transition-all duration-300"
              style={{
                background: "rgba(13,31,26,0.6)",
                backdropFilter: "blur(3px)",
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? "auto" : "none",
              }}
            />

            {/* Sheet */}
            <div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white transition-transform duration-300 ease-out"
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(100%)",
                maxHeight: "82vh",
                overflowY: "auto",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.accentBg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{course.title}</h3>
                  <p className="text-xs text-gray-400">{course.totalLessons} lessons</p>
                </div>
                <button
                  onClick={closeSheet}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 hover:bg-gray-200 transition-colors text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Lessons */}
              <div className="px-4 py-3 pb-8">
                {loadingSheet === course._id ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600" />
                  </div>
                ) : lessons.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">No lessons yet.</p>
                ) : (
                  lessons.map((lesson, lessonIdx) => (
                    <button
                      key={lesson._id}
                      onClick={() => {
                        closeSheet();
                        router.push(`/dashboard/academy/${course._id}/${lesson._id}`);
                      }}
                      className="w-full flex items-center gap-3.5 px-3 py-3.5 rounded-xl mb-1.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                    >
                      {/* Number badge */}
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: colors.numBg, color: colors.numColor }}>
                        {lesson.completed ? <CheckCircle className="h-3.5 w-3.5" /> : lessonIdx + 1}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-[60px] h-[42px] rounded-lg flex-shrink-0 overflow-hidden relative flex items-center justify-center" style={{ background: colors.thumb }}>
                        {lesson.youtubeVideoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                            <svg width="8" height="10" viewBox="0 0 8 10" fill="#0d1f1a">
                              <polygon points="0,0 8,5 0,10"/>
                            </svg>
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                            <svg width="6" height="8" viewBox="0 0 8 10" fill="#0d1f1a">
                              <polygon points="0,0 8,5 0,10"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${lesson.completed ? "text-gray-400" : "text-gray-900"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration > 0 && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                              {formatMins(lesson.duration)}
                            </span>
                            {lesson.completed && <span className="text-[10px] text-green-500 font-medium">Completed</span>}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
