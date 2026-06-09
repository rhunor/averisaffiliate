"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, FileText, ExternalLink, ChevronRight, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Resource { name: string; url: string; }

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
  resources: Resource[];
  group: string | null;
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
  lessons: Lesson[];
}

interface Section {
  key: string;
  title: string;
  isGroup: boolean;
  lessons: Lesson[];
  resources: Resource[];
  completedCount: number;
}

const ACCENTS: Record<number, string> = {
  1: "#2ec97a",
  2: "#f5a623",
  3: "#6c9fff",
  4: "#d97bff",
};

function buildSections(lessons: Lesson[]): Section[] {
  const map = new Map<string, Lesson[]>();
  const order: string[] = [];
  for (const l of lessons) {
    const key = l.group ?? l._id;
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key)!.push(l);
  }
  return order.map((key) => {
    const ls = map.get(key)!;
    const resources = ls.flatMap((l) => l.resources).filter(
      (r, i, arr) => arr.findIndex((x) => x.url === r.url) === i
    );
    return {
      key,
      title: ls[0].group ?? ls[0].title,
      isGroup: ls[0].group !== null,
      lessons: ls,
      resources,
      completedCount: ls.filter((l) => l.completed).length,
    };
  });
}

// ─── Section icon letter ──────────────────────────────────────────────────────
function SectionBadge({ title, accent, size = 40 }: { title: string; accent: string; size?: number }) {
  const letter = title.replace(/[^a-zA-Z0-9]/g, "").charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0 font-black text-white"
      style={{
        width: size, height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${accent}cc, ${accent})`,
      }}
    >
      {letter}
    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
function Thumb({ videoId, size = 64, className = "" }: { videoId: string; size?: number; className?: string }) {
  return (
    <div
      className={`relative bg-gray-900 shrink-0 overflow-hidden rounded-xl ${className}`}
      style={{ width: size, height: size * 0.5625 + 8 }}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="h-2.5 w-2.5 fill-gray-900 text-gray-900 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [activeTab, setActiveTab] = useState<"videos" | "resources">("videos");

  useEffect(() => {
    fetch(`/api/academy/${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setCourse(d.course); else router.push("/dashboard/academy"); })
      .finally(() => setLoading(false));
  }, [courseId, router]);

  const openSection = useCallback((section: Section) => {
    if (!section.isGroup && section.lessons.length === 1) {
      router.push(`/dashboard/academy/${courseId}/${section.lessons[0]._id}`);
      return;
    }
    setActiveSection(section);
    setActiveTab("videos");
    document.body.style.overflow = "hidden";
  }, [courseId, router]);

  const closeSection = useCallback(() => {
    setActiveSection(null);
    document.body.style.overflow = "";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  const accent = ACCENTS[course.moduleNumber] ?? "#2ec97a";
  const sections = buildSections(course.lessons);
  const totalSections = sections.length;
  const completedSections = sections.filter((s) => s.completedCount === s.lessons.length && s.lessons.length > 0).length;

  return (
    <>
      <div className="animate-fade-in pb-24">
        {/* Back */}
        <button
          onClick={() => router.push("/dashboard/academy")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          All Courses
        </button>

        {/* Course header card */}
        <div
          className="rounded-2xl bg-white mb-6 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)" }}
        >
          <div className="h-1" style={{ background: accent }} />
          <div className="p-5">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block"
              style={{ background: `${accent}15`, color: accent }}
            >
              Module {course.moduleNumber}
            </span>
            <h1 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h1>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{course.description}</p>

            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs text-gray-400">{totalSections} sections · {course.totalLessons} videos</span>
              {course.completedLessons > 0 && (
                <span className="text-xs font-semibold" style={{ color: accent }}>
                  {course.completedLessons}/{course.totalLessons} complete
                </span>
              )}
            </div>

            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${course.progressPct}%`, background: accent }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">{course.progressPct}% complete</span>
              {completedSections > 0 && (
                <span className="text-[10px] text-gray-400">{completedSections} of {totalSections} sections done</span>
              )}
            </div>
          </div>
        </div>

        {/* Section list */}
        <div className="mb-3 px-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Course Content
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {sections.map((section) => {
            const isSectionDone = section.completedCount === section.lessons.length && section.lessons.length > 0;
            const inProgress = section.completedCount > 0 && !isSectionDone;
            const firstLesson = section.lessons[0];
            const hasResources = section.resources.length > 0;

            return (
              <button
                key={section.key}
                onClick={() => openSection(section)}
                className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 text-left active:scale-[0.985] transition-transform"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)" }}
              >
                {/* Thumbnail (always show first video's thumbnail) */}
                <div className="shrink-0 relative rounded-xl overflow-hidden bg-gray-900"
                  style={{ width: 68, height: 52 }}>
                  <img
                    src={`https://img.youtube.com/vi/${firstLesson.youtubeVideoId}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    {isSectionDone ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: accent }}>
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-3 w-3 fill-gray-900 text-gray-900 ml-0.5" />
                      </div>
                    )}
                  </div>
                  {/* Progress strip at bottom of thumb */}
                  {inProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full"
                        style={{
                          width: `${(section.completedCount / section.lessons.length) * 100}%`,
                          background: accent,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${isSectionDone ? "text-gray-400" : "text-gray-900"}`}>
                    {section.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {section.isGroup ? (
                      <span className="text-[11px] text-gray-400">
                        {section.lessons.length} {section.lessons.length === 1 ? "video" : "videos"}
                        {section.completedCount > 0 && ` · ${section.completedCount}/${section.lessons.length} done`}
                      </span>
                    ) : (
                      firstLesson.duration > 0 && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          {formatDuration(firstLesson.duration)}
                        </span>
                      )
                    )}
                    {hasResources && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{ background: `${accent}15`, color: accent }}
                      >
                        Resources
                      </span>
                    )}
                    {isSectionDone && (
                      <span className="text-[10px] font-semibold" style={{ color: accent }}>✓ Done</span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section bottom sheet ──────────────────────────────────────────── */}
      {activeSection && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeSection}
            className="fixed inset-0 z-40 bg-black/40"
            style={{ backdropFilter: "blur(2px)" }}
          />

          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white flex flex-col"
            style={{ borderRadius: "20px 20px 0 0", maxHeight: "88vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="w-9 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Sheet header */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 shrink-0 border-b border-gray-100">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="font-bold text-gray-900 text-base leading-snug">
                  {activeSection.title}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeSection.lessons.length} {activeSection.lessons.length === 1 ? "video" : "videos"}
                  {activeSection.completedCount > 0 &&
                    ` · ${activeSection.completedCount} of ${activeSection.lessons.length} completed`}
                </p>
              </div>
              <button
                onClick={closeSection}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>

            {/* Tabs — only shown if the section has resources */}
            {activeSection.resources.length > 0 && (
              <div className="flex gap-1 px-5 pt-3 pb-0 shrink-0">
                {(["videos", "resources"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-2 text-sm font-semibold rounded-xl transition-colors"
                    style={
                      activeTab === tab
                        ? { background: `${accent}15`, color: accent }
                        : { color: "#9ca3af" }
                    }
                  >
                    {tab === "videos" ? "Videos" : "Resources"}
                  </button>
                ))}
              </div>
            )}

            {/* Tab content */}
            <div className="overflow-y-auto flex-1 px-4 py-3 pb-10">
              {(activeTab === "videos" || activeSection.resources.length === 0) && (
                <div className="flex flex-col gap-2">
                  {activeSection.lessons.map((lesson, i) => (
                    <button
                      key={lesson._id}
                      onClick={() => {
                        closeSection();
                        router.push(`/dashboard/academy/${courseId}/${lesson._id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      {/* Thumb */}
                      <Thumb videoId={lesson.youtubeVideoId} size={72} className="!rounded-lg" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[9px] font-black uppercase tracking-wider"
                            style={{ color: accent }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {lesson.completed && (
                            <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: accent }} />
                          )}
                        </div>
                        <p className={`text-sm font-semibold leading-snug line-clamp-2 ${lesson.completed ? "text-gray-400" : "text-gray-900"}`}>
                          {lesson.title}
                        </p>
                        {lesson.duration > 0 && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{formatDuration(lesson.duration)}</p>
                        )}
                      </div>

                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "resources" && activeSection.resources.length > 0 && (
                <div className="flex flex-col gap-2">
                  {activeSection.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${accent}15` }}
                      >
                        <FileText className="h-4 w-4" style={{ color: accent }} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-800 leading-snug">{r.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
