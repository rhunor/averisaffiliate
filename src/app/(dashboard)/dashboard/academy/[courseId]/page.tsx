"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Play, PlayCircle, Clock, Paperclip, Layers, Smartphone } from "lucide-react";
import {
  buildSections,
  dedupeResources,
  formatTotal,
  lessonThumb,
  type CourseDetail,
  type CurriculumLesson,
} from "@/lib/academy";
import { Curriculum } from "@/components/features/academy/curriculum";
import { ProgressBar, Reveal, ResourceList, Thumb } from "@/components/features/academy/primitives";

function pickResume(lessons: CurriculumLesson[]) {
  return (
    lessons.find((l) => l.watchedSeconds > 0 && !l.completed) ??
    lessons.find((l) => !l.completed) ??
    lessons[0] ??
    null
  );
}

function CourseSkeleton() {
  return (
    <div>
      <div className="-mx-4 -mt-5 bg-primary px-4 pb-10 pt-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="max-w-2xl space-y-3">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="h-8 w-4/5 rounded bg-white/10" />
          <div className="h-4 w-3/5 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-8 max-w-3xl space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-md" />)}
      </div>
    </div>
  );
}

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);

  useEffect(() => {
    fetch(`/api/academy/${courseId}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setCourse(d.course); else router.push("/dashboard/academy"); })
      .catch(() => router.push("/dashboard/academy"));
  }, [courseId, router]);

  const sections = useMemo(() => (course ? buildSections(course.lessons) : []), [course]);

  if (!course) return <CourseSkeleton />;

  const resume = pickResume(course.lessons);
  const started = course.lessons.some((l) => l.completed || l.watchedSeconds > 0);
  const done = course.progressPct === 100;
  const totalDuration = course.lessons.reduce((s, l) => s + (l.duration || 0), 0);
  const resources = dedupeResources(course.lessons.flatMap((l) => l.resources));
  const cover = course.thumbnailUrl || lessonThumb(course.lessons[0], "lg");
  const resumeHref = resume ? `/dashboard/academy/${courseId}/${resume._id}` : null;
  const ctaLabel = done ? "Watch again" : started ? "Continue learning" : "Start course";
  const defaultOpen = resume
    ? [sections.find((s) => s.lessons.some((l) => l._id === resume._id))?.key].filter(Boolean) as string[]
    : [];

  const includes = [
    { icon: PlayCircle, text: `${course.totalLessons} video lesson${course.totalLessons === 1 ? "" : "s"}` },
    totalDuration > 0 && { icon: Clock, text: `${formatTotal(totalDuration)} of content` },
    resources.length > 0 && { icon: Paperclip, text: `${resources.length} downloadable resource${resources.length === 1 ? "" : "s"}` },
    { icon: Smartphone, text: "Watch on mobile and desktop" },
  ].filter(Boolean) as { icon: typeof Clock; text: string }[];

  const cta = (className: string) =>
    resumeHref ? (
      <Link
        href={resumeHref}
        className={`inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-secondary-light ${className}`}
      >
        <Play className="h-4 w-4 fill-current" />
        {ctaLabel}
      </Link>
    ) : null;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-10">
      {/* Hero band. The box-shadow + clip-path pair paints the band full-bleed
          across the viewport while the content stays on the page grid. */}
      <section className="-mx-4 -mt-5 bg-primary px-4 pb-8 pt-6 text-white sm:-mx-6 sm:px-6 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:-mt-8 lg:px-0 lg:pb-14 lg:pt-10 lg:[box-shadow:0_0_0_100vmax_#122F38] lg:[clip-path:inset(0_-100vmax)]">
        <Reveal className="min-w-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/60">
            <Link href="/dashboard/academy" className="hover:text-white">My learning</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/80">Module {course.moduleNumber}</span>
          </nav>

          {/* Mobile cover — desktop shows it in the side card */}
          <Thumb src={cover} className="mt-5 rounded-lg lg:hidden" />

          <h1 className="mt-5 max-w-3xl text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[36px]">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-[16px]">{course.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-white/70">
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" strokeWidth={1.75} />{sections.length} sections</span>
            <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4" strokeWidth={1.75} />{course.totalLessons} lessons</span>
            {totalDuration > 0 && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" strokeWidth={1.75} />{formatTotal(totalDuration)} total</span>}
          </div>

          {started && (
            <div className="mt-6 max-w-md">
              <ProgressBar value={course.progressPct} tone="dark" />
              <p className="mt-2 text-[13px] text-white/70">
                {course.completedLessons} of {course.totalLessons} lessons complete · {course.progressPct}%
              </p>
            </div>
          )}

          {cta("mt-6 w-full sm:w-auto lg:hidden")}
        </Reveal>
      </section>

      {/* Side card — spans the hero and body rows so it overlaps the band and stays sticky */}
      <aside className="relative z-10 hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:pt-2">
        <Reveal delay={0.05} className="sticky top-20">
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_48px_-24px_rgba(16,36,43,0.35)]">
            <Thumb src={cover}>
              {resumeHref && (
                <Link href={resumeHref} className="group absolute inset-0 flex items-center justify-center bg-ink/10 transition-colors hover:bg-ink/30" aria-label={ctaLabel}>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="ml-0.5 h-6 w-6 fill-current" />
                  </span>
                </Link>
              )}
            </Thumb>
            <div className="p-5">
              {resume && (
                <p className="mb-3 line-clamp-2 text-[13px] text-ink-soft">
                  <span className="text-ink-faint">{started && !done ? "Up next: " : "First lesson: "}</span>
                  {resume.title}
                </p>
              )}
              {cta("w-full")}
              <p className="mt-6 text-[14px] font-semibold text-ink">This course includes</p>
              <ul className="mt-3 space-y-2.5">
                {includes.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                    <Icon className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </aside>

      {/* Main column */}
      <div className="min-w-0 space-y-12 pt-8 lg:col-start-1 lg:row-start-2 lg:pt-10">
        <Reveal delay={0.08}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Course content</h2>
            <p className="text-[13px] text-ink-faint">
              {sections.length} sections · {course.totalLessons} lessons{totalDuration > 0 ? ` · ${formatTotal(totalDuration)}` : ""}
            </p>
          </div>
          <Curriculum courseId={courseId} sections={sections} defaultOpen={defaultOpen} />
        </Reveal>

        {resources.length > 0 && (
          <Reveal delay={0.12}>
            <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.02em] text-ink">Resources</h2>
            <ResourceList resources={resources} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
