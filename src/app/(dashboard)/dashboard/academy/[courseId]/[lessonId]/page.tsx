"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildSections, type CourseDetail, type CurriculumLesson, type Resource } from "@/lib/academy";
import { Curriculum } from "@/components/features/academy/curriculum";
import { EASE_OUT, ProgressRing, ResourceList } from "@/components/features/academy/primitives";
import { VideoPlayer } from "@/components/features/academy/video-player";

interface LessonDetail {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
  duration: number;
  resources: Resource[];
  completed: boolean;
  watchedSeconds: number;
  courseTitle: string;
  group: string | null;
  prevLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
}

type Tab = "content" | "overview" | "resources";

function postProgress(body: { lessonId: string; courseId: string; watchedSeconds?: number; completed?: boolean }) {
  // `completed` is only sent when it's an explicit change — periodic position
  // saves must never flip a finished lesson back to unfinished.
  return fetch("/api/academy/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

function PlayerSkeleton() {
  return (
    <div className="-mx-4 -mt-5 sm:-mx-6 lg:-mx-8 lg:-mt-8">
      <div className="h-12 bg-primary" />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="aspect-video bg-black" />
          <div className="space-y-3 p-5 lg:p-8">
            <div className="skeleton h-6 w-2/3 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
          </div>
        </div>
        <div className="hidden space-y-px border-l border-line bg-white p-4 lg:block">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  // Mobile has no sidebar, so open on the curriculum tab there (like the Udemy app).
  // Safe to read the viewport here: the first paint is the skeleton either way.
  const [tab, setTab] = useState<Tab>(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches ? "content" : "overview"
  );

  // Curriculum (with per-lesson progress) — once per course.
  useEffect(() => {
    fetch(`/api/academy/${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setCourse(d.course); })
      .catch(() => {});
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/academy/${courseId}/${lessonId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.lesson) setLesson(d.lesson);
        else router.push(`/dashboard/academy/${courseId}`);
      })
      .catch(() => { if (!cancelled) router.push(`/dashboard/academy/${courseId}`); });
    return () => { cancelled = true; };
  }, [courseId, lessonId, router]);

  const setCompleted = useCallback((id: string, completed: boolean) => {
    setCourse((c) => {
      if (!c) return c;
      const lessons = c.lessons.map((l) => (l._id === id ? { ...l, completed } : l));
      const done = lessons.filter((l) => l.completed).length;
      return { ...c, lessons, completedLessons: done, progressPct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
    });
    setLesson((l) => (l && l._id === id ? { ...l, completed } : l));
  }, []);

  const toggleComplete = useCallback((target: Pick<CurriculumLesson, "_id" | "completed">) => {
    const completed = !target.completed;
    setCompleted(target._id, completed);
    postProgress({ lessonId: target._id, courseId, completed });
  }, [courseId, setCompleted]);

  const onProgress = useCallback((seconds: number) => {
    postProgress({ lessonId, courseId, watchedSeconds: seconds });
  }, [lessonId, courseId]);

  const onEnded = useCallback(() => {
    setCompleted(lessonId, true);
    postProgress({ lessonId, courseId, completed: true });
  }, [lessonId, courseId, setCompleted]);

  const sections = useMemo(() => (course ? buildSections(course.lessons) : []), [course]);

  // Prefer curriculum order (it's what the learner sees); fall back to the lesson API.
  const { prev, next, position } = useMemo(() => {
    const list = course?.lessons ?? [];
    const i = list.findIndex((l) => l._id === lessonId);
    if (i === -1) return { prev: lesson?.prevLesson ?? null, next: lesson?.nextLesson ?? null, position: null };
    return { prev: list[i - 1] ?? null, next: list[i + 1] ?? null, position: { index: i + 1, total: list.length } };
  }, [course, lessonId, lesson]);

  const goNext = useCallback(() => { if (next) router.push(`/dashboard/academy/${courseId}/${next._id}`); }, [next, router, courseId]);
  const goCourse = useCallback(() => router.push(`/dashboard/academy/${courseId}`), [router, courseId]);

  if (!lesson || lesson._id !== lessonId) return <PlayerSkeleton />;

  const tabs: { key: Tab; label: string; mobileOnly?: boolean }[] = [
    { key: "content", label: "Course content", mobileOnly: true },
    { key: "overview", label: "Overview" },
    { key: "resources", label: lesson.resources.length ? `Resources (${lesson.resources.length})` : "Resources" },
  ];

  const pct = course?.progressPct ?? 0;

  return (
    <div className="-mx-4 -mt-5 sm:-mx-6 lg:-mx-8 lg:-mt-8">
      {/* Player header */}
      <div className="flex h-12 items-center gap-3 bg-primary px-3 text-white sm:px-5">
        <Link href={`/dashboard/academy/${courseId}`} className="flex min-w-0 items-center gap-2 rounded-md py-1 pr-2 text-[14px] font-medium hover:text-white/80">
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{lesson.courseTitle}</span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-2.5 text-[13px] text-white/75">
          <ProgressRing value={pct} size={28} />
          <span className="hidden sm:inline">
            {course ? `${course.completedLessons} of ${course.totalLessons} complete` : "Your progress"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {/* Video sticks under the top bar on mobile so it stays in view while browsing tabs */}
          <div className="sticky top-14 z-20 lg:static">
            <VideoPlayer
              key={lesson._id}
              lesson={lesson}
              next={next}
              onProgress={onProgress}
              onEnded={onEnded}
              onPlayNext={goNext}
              onFinishCourse={goCourse}
            />
          </div>

          {/* Title + actions */}
          <div className="border-b border-line bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <motion.div key={lesson._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }}>
              {position && (
                <p className="text-[12.5px] text-ink-faint">
                  Lesson {position.index} of {position.total}
                  {lesson.group && <> · {lesson.group}</>}
                </p>
              )}
              <h1 className="mt-1 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink sm:text-[24px]">{lesson.title}</h1>
            </motion.div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleComplete(lesson)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-[13.5px] font-semibold transition-colors",
                  lesson.completed
                    ? "border-ink bg-ink text-white hover:bg-primary-light"
                    : "border-line bg-white text-ink hover:border-ink/40"
                )}
                aria-pressed={lesson.completed}
              >
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-[3px] border", lesson.completed ? "border-white bg-white text-ink" : "border-ink-faint")}>
                  {lesson.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                {lesson.completed ? "Completed" : "Mark as complete"}
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  disabled={!prev}
                  onClick={() => prev && router.push(`/dashboard/academy/${courseId}/${prev._id}`)}
                  className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  disabled={!next}
                  onClick={goNext}
                  className="inline-flex items-center gap-1 rounded-md bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next lesson <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-[calc(3.5rem+56.25vw)] z-10 border-b border-line bg-white px-4 sm:px-6 lg:static lg:px-8">
            <div className="no-scrollbar -mb-px flex gap-6 overflow-x-auto" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap py-3.5 text-[14px] transition-colors",
                    t.mobileOnly && "lg:hidden",
                    tab === t.key ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {t.label}
                  {tab === t.key && (
                    <motion.span layoutId="lesson-tab" className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[40vh] bg-white px-4 py-6 pb-16 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {tab === "content" && (
                  <div className="-mx-4 -mt-6 sm:-mx-6 lg:hidden">
                    {course ? (
                      <Curriculum courseId={courseId} sections={sections} currentLessonId={lessonId} onToggleComplete={toggleComplete} variant="sidebar" />
                    ) : (
                      <div className="space-y-px p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
                    )}
                  </div>
                )}
                {tab === "overview" && (
                  <div className="max-w-3xl">
                    <h2 className="text-[17px] font-semibold text-ink">About this lesson</h2>
                    {lesson.description ? (
                      <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{lesson.description}</p>
                    ) : (
                      <p className="mt-3 text-[15px] text-ink-faint">There&apos;s no written summary for this lesson — everything you need is in the video.</p>
                    )}
                    <div className="mt-8 border-t border-line pt-6">
                      <p className="text-[13px] text-ink-faint">Part of</p>
                      <Link href={`/dashboard/academy/${courseId}`} className="mt-1 inline-block text-[15px] font-semibold text-ink underline-offset-4 hover:underline">
                        {lesson.courseTitle}
                      </Link>
                    </div>
                  </div>
                )}
                {tab === "resources" && (
                  <div className="max-w-3xl">
                    <ResourceList resources={lesson.resources} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop curriculum sidebar */}
        <aside className="hidden border-l border-line bg-white lg:block">
          <div className="sticky top-14 flex max-h-[calc(100vh-3.5rem)] flex-col">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-[16px] font-semibold text-ink">Course content</h2>
              {course && <span className="text-[12.5px] tabular-nums text-ink-faint">{pct}%</span>}
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {course ? (
                <Curriculum courseId={courseId} sections={sections} currentLessonId={lessonId} onToggleComplete={toggleComplete} variant="sidebar" />
              ) : (
                <div className="space-y-px p-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
