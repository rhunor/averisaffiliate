"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { courseCover, formatTotal, type CourseSummary } from "@/lib/academy";
import { EASE_OUT, ProgressBar, Thumb } from "./primitives";

export function courseHref(c: CourseSummary) {
  return `/dashboard/academy/${c._id}`;
}

export function resumeHref(c: CourseSummary) {
  return c.resumeLesson ? `/dashboard/academy/${c._id}/${c.resumeLesson._id}` : courseHref(c);
}

export function CourseCard({ course, index = 0 }: { course: CourseSummary; index?: number }) {
  const started = course.completedLessons > 0;
  const done = course.progressPct === 100;
  const meta = [
    `${course.totalLessons} lesson${course.totalLessons === 1 ? "" : "s"}`,
    formatTotal(course.totalDuration),
  ].filter(Boolean);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: Math.min(index, 8) * 0.05 }}
      className="group"
    >
      <Link href={courseHref(course)} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas">
        <Thumb
          src={courseCover(course)}
          alt=""
          className="rounded-lg ring-1 ring-black/5"
          imgClassName="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        >
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/25" />
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-white text-ink opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
          {done && (
            <span className="absolute left-2.5 top-2.5 rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-ink shadow-sm">
              Completed
            </span>
          )}
        </Thumb>

        <div className="pt-3">
          <p className="text-[12px] font-medium text-ink-faint">Module {course.moduleNumber}</p>
          <h3 className="mt-1 line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-ink group-hover:underline group-hover:decoration-ink/30 group-hover:underline-offset-4">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">{course.description}</p>
          <p className="mt-2 text-[12.5px] text-ink-faint">{meta.join(" · ")}</p>

          <div className="mt-3">
            {started ? (
              <>
                <ProgressBar value={course.progressPct} />
                <p className="mt-1.5 text-[12px] text-ink-soft">
                  {done ? "You finished this course" : `${course.progressPct}% complete`}
                </p>
              </>
            ) : (
              <p className="text-[13px] font-semibold text-accent-ink">Start course</p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-video rounded-lg" />
      <div className="skeleton mt-3 h-3 w-16 rounded" />
      <div className="skeleton mt-2 h-4 w-11/12 rounded" />
      <div className="skeleton mt-1.5 h-4 w-2/3 rounded" />
      <div className="skeleton mt-3 h-1 w-full rounded-full" />
    </div>
  );
}
