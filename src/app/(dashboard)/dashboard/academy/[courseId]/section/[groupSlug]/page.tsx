"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Play } from "lucide-react";
import { buildSections, dedupeResources, formatTotal, type CurriculumLesson } from "@/lib/academy";
import { Curriculum } from "@/components/features/academy/curriculum";
import { ProgressBar, Reveal, ResourceList } from "@/components/features/academy/primitives";

interface SectionData {
  course: { _id: string; title: string; moduleNumber: number };
  lessons: CurriculumLesson[];
}

export default function SectionPage() {
  const { courseId, groupSlug } = useParams<{ courseId: string; groupSlug: string }>();
  const router = useRouter();
  const [data, setData] = useState<SectionData | null>(null);

  useEffect(() => {
    fetch(`/api/academy/${courseId}/section/${groupSlug}`)
      .then((r) => r.json())
      .then((d) => { if (d.course && d.lessons?.length) setData(d); else router.replace(`/dashboard/academy/${courseId}`); })
      .catch(() => router.replace(`/dashboard/academy/${courseId}`));
  }, [courseId, groupSlug, router]);

  const sections = useMemo(() => (data ? buildSections(data.lessons) : []), [data]);

  if (!data) {
    return (
      <div className="max-w-3xl space-y-3">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton mt-6 h-64 rounded-lg" />
      </div>
    );
  }

  const lessons = data.lessons;
  const done = lessons.filter((l) => l.completed).length;
  const pct = Math.round((done / lessons.length) * 100);
  const duration = lessons.reduce((s, l) => s + (l.duration || 0), 0);
  const resources = dedupeResources(lessons.flatMap((l) => l.resources));
  const resume = lessons.find((l) => !l.completed) ?? lessons[0];

  return (
    <div className="max-w-3xl">
      <Reveal>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-faint">
          <Link href="/dashboard/academy" className="hover:text-ink">My learning</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/dashboard/academy/${courseId}`} className="hover:text-ink">{data.course.title}</Link>
        </nav>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[30px]">{lessons[0].group}</h1>
        <p className="mt-2 text-[14px] text-ink-soft">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}{duration ? ` · ${formatTotal(duration)}` : ""} · {done} done
        </p>
        <div className="mt-4 max-w-sm"><ProgressBar value={pct} /></div>
        <Link
          href={`/dashboard/academy/${courseId}/${resume._id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-light"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {done === 0 ? "Start section" : done === lessons.length ? "Watch again" : "Continue section"}
        </Link>
      </Reveal>

      <Reveal delay={0.08} className="mt-10">
        <Curriculum courseId={courseId} sections={sections} defaultOpen={sections.map((s) => s.key)} variant="page" />
      </Reveal>

      {resources.length > 0 && (
        <Reveal delay={0.12} className="mt-12">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Resources</h2>
          <ResourceList resources={resources} />
        </Reveal>
      )}
    </div>
  );
}
