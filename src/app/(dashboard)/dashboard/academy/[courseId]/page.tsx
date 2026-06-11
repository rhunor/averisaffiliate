"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Resource { name: string; url: string; }

interface Lesson {
  _id: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  sortOrder: number;
  completed: boolean;
  resources: Resource[];
  group: string | null;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  moduleNumber: number;
  totalLessons: number;
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

const THEMES = [
  { accent: "#2ec97a", from: "#0a2018", to: "#1a4d35" },
  { accent: "#f5a623", from: "#2a1a00", to: "#4a3000" },
  { accent: "#6c9fff", from: "#0a1a30", to: "#1a3060" },
  { accent: "#d97bff", from: "#1a0a2a", to: "#3a1a50" },
];

const GROUP_ICON_GRADIENTS = [
  { from: "#0d2b20", to: "#1a4d35" },
  { from: "#0a3080", to: "#1877F2" },
  { from: "#2a1a00", to: "#4a3000" },
  { from: "#1a0a30", to: "#3a1a50" },
  { from: "#0a2a30", to: "#1a5060" },
];

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

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

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/academy/${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setCourse(d.course); else router.push("/dashboard/academy"); })
      .finally(() => setLoading(false));
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  const theme = THEMES[(course.moduleNumber - 1) % THEMES.length];
  const sections = buildSections(course.lessons);

  return (
    <div className="animate-fade-in pb-24">
      {/* Course hero header */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <div className="p-5">
          <button
            onClick={() => router.push("/dashboard/academy")}
            className="flex items-center gap-1.5 text-sm mb-5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            All Courses
          </button>

          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block"
            style={{ background: `${theme.accent}22`, color: theme.accent }}
          >
            Module {course.moduleNumber}
          </span>

          <h1 className="font-extrabold text-white text-xl leading-tight mb-1">{course.title}</h1>
          <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            {sections.length} sections · {course.totalLessons} lessons
          </p>

          <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span>{course.completedLessons} of {course.totalLessons} completed</span>
            <span>{course.progressPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${course.progressPct}%`, background: theme.accent }}
            />
          </div>
        </div>
      </div>

      {/* Section label */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-0.5">
        Course Content
      </p>

      {/* Sections list */}
      <div className="flex flex-col gap-2.5">
        {sections.map((section, idx) => {
          const isSolo = !section.isGroup;
          const lesson = section.lessons[0];
          const isSectionDone = section.completedCount === section.lessons.length && section.lessons.length > 0;
          const inProgress = section.completedCount > 0 && !isSectionDone;

          if (isSolo) {
            return (
              <button
                key={section.key}
                onClick={() => router.push(`/dashboard/academy/${courseId}/${lesson._id}`)}
                className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 text-left active:scale-[0.985] transition-transform"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                {/* YouTube thumbnail */}
                <div
                  className="shrink-0 relative rounded-xl overflow-hidden bg-gray-900"
                  style={{ width: 72, height: 52 }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${lesson.youtubeVideoId}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    {isSectionDone ? (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: theme.accent }}>
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-3 w-3 fill-gray-900 text-gray-900 ml-0.5" />
                      </div>
                    )}
                  </div>
                  {inProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div className="h-full" style={{ width: `${(section.completedCount / section.lessons.length) * 100}%`, background: theme.accent }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.accent }}>
                    {lesson.title.match(/^Lesson\s+(\d+):/i)?.[0]?.replace(/:$/, "") ?? `Lesson ${lesson.sortOrder + 1}`}
                  </div>
                  <p className={`text-sm font-semibold leading-snug line-clamp-2 ${isSectionDone ? "text-gray-400" : "text-gray-900"}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {lesson.duration > 0 && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatDuration(lesson.duration)}
                      </span>
                    )}
                    {isSectionDone && (
                      <span className="text-[10px] font-semibold" style={{ color: theme.accent }}>✓ Done</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            );
          }

          // Group header
          const iconGrad = GROUP_ICON_GRADIENTS[idx % GROUP_ICON_GRADIENTS.length];
          return (
            <button
              key={section.key}
              onClick={() => router.push(`/dashboard/academy/${courseId}/section/${toSlug(section.title)}`)}
              className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 text-left active:scale-[0.985] transition-transform"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Letter icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shrink-0"
                style={{ background: `linear-gradient(135deg, ${iconGrad.from}, ${iconGrad.to})` }}
              >
                {(section.title.match(/:\s*([A-Za-z])/)?.[1] ?? section.title.charAt(0)).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.accent }}>
                  {section.title.match(/^(Lesson\s+\d+)/i)?.[1] ?? (section.title.toLowerCase().startsWith("bonus") ? "Bonus" : section.title)}
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug">
                  {section.title.includes(":") ? section.title.split(":").slice(1).join(":").trim() : section.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {section.lessons.length} {section.lessons.length === 1 ? "part" : "parts"} · Tap to explore
                </p>
              </div>

              {/* Count badge + chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${theme.accent}15`, color: theme.accent }}
                >
                  {section.completedCount}/{section.lessons.length}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
