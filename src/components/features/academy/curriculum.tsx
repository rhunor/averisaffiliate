"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, PlayCircle, Paperclip, CirclePlay } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { formatTotal, type CurriculumLesson, type Section } from "@/lib/academy";
import { EASE_OUT } from "./primitives";

interface CurriculumProps {
  courseId: string;
  sections: Section[];
  currentLessonId?: string;
  /** When set, lesson rows show a checkbox that toggles completion (player sidebar). */
  onToggleComplete?: (lesson: CurriculumLesson) => void;
  /** Section keys to open on first render. Defaults to the current lesson's section. */
  defaultOpen?: string[];
  variant?: "page" | "sidebar";
}

function sectionLabel(s: Section) {
  // Authors title groups like "Lesson 5: Facebook Ads" — split for hierarchy.
  const m = s.title.match(/^([^:]{1,24}):\s*(.+)$/);
  return m ? { eyebrow: m[1], title: m[2] } : { eyebrow: null, title: s.title };
}

function StatusBox({
  lesson,
  onToggle,
}: {
  lesson: CurriculumLesson;
  onToggle?: (l: CurriculumLesson) => void;
}) {
  const box = (
    <motion.span
      initial={false}
      animate={{ backgroundColor: lesson.completed ? "#122F38" : "rgba(255,255,255,1)", borderColor: lesson.completed ? "#122F38" : "#c5ccc8" }}
      transition={{ duration: 0.15 }}
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border"
    >
      <AnimatePresence initial={false}>
        {lesson.completed && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 30 }}>
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );

  if (!onToggle) return <span className="mt-0.5 shrink-0">{box}</span>;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(lesson); }}
      className="-m-1.5 mt-[-4px] shrink-0 rounded p-1.5 hover:bg-black/5"
      aria-label={lesson.completed ? `Mark "${lesson.title}" as not done` : `Mark "${lesson.title}" as done`}
    >
      {box}
    </button>
  );
}

function LessonRow({
  courseId,
  lesson,
  number,
  current,
  onToggle,
}: {
  courseId: string;
  lesson: CurriculumLesson;
  number: string;
  current: boolean;
  onToggle?: (l: CurriculumLesson) => void;
}) {
  return (
    <Link
      href={`/dashboard/academy/${courseId}/${lesson._id}`}
      aria-current={current ? "true" : undefined}
      className={cn(
        "group relative flex items-start gap-3 py-3 pl-4 pr-4 transition-colors sm:pl-5",
        current ? "bg-[#eef1ef]" : "hover:bg-canvas"
      )}
    >
      {current && <span className="absolute inset-y-0 left-0 w-[3px] bg-ink" />}
      <StatusBox lesson={lesson} onToggle={onToggle} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[14px] leading-snug", current ? "font-semibold text-ink" : "text-ink", lesson.completed && !current && "text-ink-soft")}>
          {/^lesson\s+\d+\s*:/i.test(lesson.title) && !number.includes(".") ? (
            <>
              <span className="text-ink-faint">{lesson.title.split(":")[0]}: </span>
              {lesson.title.split(":").slice(1).join(":").trim()}
            </>
          ) : (
            <>
              <span className="tabular-nums text-ink-faint">{number}. </span>
              {lesson.title}
            </>
          )}
        </p>
        <div className="mt-1 flex items-center gap-3 text-[12px] text-ink-faint">
          <span className="flex items-center gap-1">
            {current ? <CirclePlay className="h-3.5 w-3.5 text-accent-ink" /> : <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />}
            {current ? <span className="font-medium text-accent-ink">Now playing</span> : lesson.duration > 0 ? formatDuration(lesson.duration) : "Video"}
          </span>
          {lesson.resources.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              {lesson.resources.length}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function Curriculum({
  courseId,
  sections,
  currentLessonId,
  onToggleComplete,
  defaultOpen,
  variant = "page",
}: CurriculumProps) {
  const currentKey = sections.find((s) => s.lessons.some((l) => l._id === currentLessonId))?.key;
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(defaultOpen ?? (currentKey ? [currentKey] : []))
  );

  // Moving to a lesson in another section (next/prev) should reveal it.
  const [prevKey, setPrevKey] = useState(currentKey);
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (currentKey && !open.has(currentKey)) setOpen(new Set(open).add(currentKey));
  }

  const groups = sections.filter((s) => s.isGroup);
  const allOpen = groups.length > 0 && groups.every((s) => open.has(s.key));

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  return (
    <div>
      {variant === "page" && groups.length > 0 && (
        <div className="mb-3 flex items-center justify-end">
          <button
            onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.key)))}
            className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline"
          >
            {allOpen ? "Collapse all sections" : "Expand all sections"}
          </button>
        </div>
      )}

      <div className={cn("overflow-hidden bg-white", variant === "page" ? "rounded-lg border border-line" : "")}>
        {sections.map((section, idx) => {
          const n = idx + 1;
          if (!section.isGroup) {
            const lesson = section.lessons[0];
            return (
              <div key={section.key} className={cn(idx > 0 && "border-t border-line")}>
                <LessonRow
                  courseId={courseId}
                  lesson={lesson}
                  number={String(n)}
                  current={lesson._id === currentLessonId}
                  onToggle={onToggleComplete}
                />
              </div>
            );
          }

          const isOpen = open.has(section.key);
          const { eyebrow, title } = sectionLabel(section);
          return (
            <div key={section.key} className={cn(idx > 0 && "border-t border-line")}>
              <button
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 bg-[#f7f8f7] px-4 py-3.5 text-left transition-colors hover:bg-[#f0f2f0] sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold leading-snug text-ink">
                    {eyebrow ? <span className="text-ink-soft">{eyebrow}: </span> : <span className="tabular-nums text-ink-soft">{n}. </span>}
                    {title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    {section.completedCount} / {section.lessons.length} done
                    {section.duration > 0 && ` · ${formatTotal(section.duration)}`}
                  </p>
                </div>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE_OUT }} className="mt-0.5">
                  <ChevronDown className="h-4 w-4 text-ink-soft" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-line/70 border-t border-line">
                      {section.lessons.map((lesson, i) => (
                        <LessonRow
                          key={lesson._id}
                          courseId={courseId}
                          lesson={lesson}
                          number={`${n}.${i + 1}`}
                          current={lesson._id === currentLessonId}
                          onToggle={onToggleComplete}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
