"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Play, Search, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseCover, lessonThumb, type CourseSummary } from "@/lib/academy";
import { CourseCard, CourseCardSkeleton, resumeHref } from "@/components/features/academy/course-card";
import { EASE_OUT, ProgressBar, Reveal, Thumb } from "@/components/features/academy/primitives";

type Filter = "all" | "progress" | "new" | "done";

const FILTERS: { key: Filter; label: string; match: (c: CourseSummary) => boolean }[] = [
  { key: "all", label: "All courses", match: () => true },
  { key: "progress", label: "In progress", match: (c) => c.completedLessons > 0 && c.progressPct < 100 },
  { key: "new", label: "Not started", match: (c) => c.completedLessons === 0 && !c.lastWatchedAt },
  { key: "done", label: "Completed", match: (c) => c.progressPct === 100 },
];

function ContinueHero({ course }: { course: CourseSummary }) {
  const started = !!course.lastWatchedAt || course.completedLessons > 0;
  const lesson = course.resumeLesson;
  return (
    <Reveal>
      <Link
        href={resumeHref(course)}
        className="group grid overflow-hidden rounded-xl border border-line bg-white transition-shadow duration-300 hover:shadow-[0_18px_40px_-20px_rgba(16,36,43,0.35)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <Thumb
          src={course.thumbnailUrl || lessonThumb(lesson, "lg") || courseCover(course, "lg")}
          className="md:aspect-auto md:h-full md:min-h-[260px]"
          imgClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </Thumb>

        <div className="flex flex-col justify-center p-5 sm:p-7">
          <p className="text-[13px] font-medium text-accent-ink">
            {started ? "Continue where you left off" : "Start here"}
          </p>
          <h2 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
            {course.title}
          </h2>
          {lesson && (
            <p className="mt-2 line-clamp-2 text-[14px] text-ink-soft">
              <span className="text-ink-faint">{started ? "Next up: " : "First lesson: "}</span>
              {lesson.title}
            </p>
          )}
          <div className="mt-5 max-w-sm">
            <ProgressBar value={course.progressPct} />
            <p className="mt-1.5 text-[12.5px] text-ink-faint">
              {course.completedLessons} of {course.totalLessons} lessons complete
            </p>
          </div>
          <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-primary-light">
            <Play className="h-3.5 w-3.5 fill-current" />
            {started ? "Resume lesson" : "Start course"}
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function AcademyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState(q);
  // Follow ?q when it changes from outside (the top-bar search).
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) { setPrevQ(q); setSearch(q); }

  useEffect(() => {
    fetch("/api/academy")
      .then((r) => r.json())
      .then((d) => { if (d.courses) setCourses(d.courses); else setFailed(true); })
      .catch(() => setFailed(true));
  }, []);

  const hero = useMemo(() => {
    if (!courses?.length) return null;
    const inProgress = courses
      .filter((c) => c.lastWatchedAt && c.progressPct < 100)
      .sort((a, b) => +new Date(b.lastWatchedAt!) - +new Date(a.lastWatchedAt!));
    return inProgress[0] ?? courses.find((c) => c.progressPct < 100) ?? null;
  }, [courses]);

  const term = search.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!courses) return [];
    const f = FILTERS.find((x) => x.key === filter)!;
    return courses.filter(
      (c) => f.match(c) && (!term || `${c.title} ${c.description}`.toLowerCase().includes(term))
    );
  }, [courses, filter, term]);

  function updateSearch(value: string) {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value); else params.delete("q");
    setPrevQ(value.trim() ? value : "");
    router.replace(`/dashboard/academy${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[16px] font-semibold text-ink">We couldn&apos;t load your courses</p>
        <p className="mt-1 text-[14px] text-ink-soft">Check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="mt-5 rounded-md border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink hover:bg-canvas">
          Try again
        </button>
      </div>
    );
  }

  const totalDone = courses?.reduce((s, c) => s + c.completedLessons, 0) ?? 0;
  const totalLessons = courses?.reduce((s, c) => s + c.totalLessons, 0) ?? 0;

  return (
    <div className="space-y-8 lg:space-y-10">
      <header>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">My learning</h1>
        {courses ? (
          <p className="mt-1 text-[14px] text-ink-soft">
            {courses.length} course{courses.length === 1 ? "" : "s"} · {totalDone} of {totalLessons} lessons completed
          </p>
        ) : (
          <div className="skeleton mt-2 h-4 w-56 rounded" />
        )}
      </header>

      {!courses ? (
        <div className="skeleton h-[260px] rounded-xl" />
      ) : (
        hero && <ContinueHero course={hero} />
      )}

      <section aria-label="Courses">
        <div className="flex flex-col gap-4 border-b border-line sm:flex-row sm:items-end sm:justify-between">
          <div className="no-scrollbar -mb-px flex gap-6 overflow-x-auto" role="tablist">
            {FILTERS.map((f) => {
              const count = courses?.filter(f.match).length;
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap pb-3 text-[14px] transition-colors",
                    active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {f.label}
                  {count !== undefined && <span className="ml-1.5 tabular-nums text-ink-faint">{count}</span>}
                  {active && (
                    <motion.span layoutId="academy-tab" className="absolute inset-x-0 bottom-0 h-[2px] bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative mb-3 w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Filter courses"
              aria-label="Filter courses"
              className="h-9 w-full rounded-md border border-line bg-white pl-9 pr-8 text-[14px] text-ink placeholder:text-ink-faint focus:border-ink/30 focus:outline-none focus:ring-4 focus:ring-ink/5"
            />
            {search && (
              <button onClick={() => updateSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-6">
          {!courses ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="flex flex-col items-center py-16 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white">
                <BookOpen className="h-5 w-5 text-ink-faint" strokeWidth={1.75} />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">
                {term ? `No courses match “${search.trim()}”` : courses.length === 0 ? "No courses published yet" : "Nothing here yet"}
              </p>
              <p className="mt-1 max-w-xs text-[14px] text-ink-soft">
                {term
                  ? "Try a different word, or clear the search."
                  : courses.length === 0
                    ? "New trainings will show up here as soon as they're released."
                    : filter === "done"
                      ? "Finish every lesson in a course and it will show up here."
                      : "Courses you start will show up here."}
              </p>
              {(term || filter !== "all") && courses.length > 0 && (
                <button
                  onClick={() => { updateSearch(""); setFilter("all"); }}
                  className="mt-5 rounded-md border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink hover:bg-canvas"
                >
                  Show all courses
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {visible.map((c, i) => <CourseCard key={c._id} course={c} index={i} />)}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AcademyPage() {
  return (
    <Suspense>
      <AcademyContent />
    </Suspense>
  );
}
