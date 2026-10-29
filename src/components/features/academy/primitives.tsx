"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { FileText, HardDrive, Link as LinkIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RESOURCE_LABEL, resourceKind, type Resource } from "@/lib/academy";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** 16:9 media with a quiet branded fallback (no gradients) when there's no image. */
export function Thumb({
  src,
  alt = "",
  className,
  imgClassName,
  children,
}: {
  src: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const show = src && !failed;
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-[#dfe4e1]", className)}>
      {show ? (
        <img
          src={fallback ?? src}
          alt={alt}
          loading="lazy"
          onError={() => {
            // Not every YouTube video has a maxres thumbnail.
            if (!fallback && src.includes("/maxresdefault.jpg")) setFallback(src.replace("/maxresdefault.jpg", "/mqdefault.jpg"));
            else setFailed(true);
          }}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#e7ebe8]">
          <svg width="40" height="32" viewBox="0 0 65 51" fill="none" aria-hidden className="opacity-25">
            <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#122F38"/>
          </svg>
        </div>
      )}
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "light",
}: {
  value: number;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full", tone === "dark" ? "bg-white/15" : "bg-[#e3e7e4]", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full bg-secondary"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 }}
      />
    </div>
  );
}

/** Small circular progress, used in the player header like Udemy's progress ring. */
export function ProgressRing({ value, size = 36 }: { value: number; size?: number }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeOpacity={0.15} strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#40D457"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (value / 100) * c }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      />
    </svg>
  );
}

const RESOURCE_ICON = { pdf: FileText, drive: HardDrive, link: LinkIcon };

export function ResourceList({ resources, className }: { resources: Resource[]; className?: string }) {
  if (resources.length === 0) {
    return <p className="py-6 text-[14px] text-ink-faint">No downloadable resources for this lesson.</p>;
  }
  return (
    <ul className={cn("divide-y divide-line overflow-hidden rounded-lg border border-line bg-white", className)}>
      {resources.map((r) => {
        const kind = resourceKind(r.url);
        const Icon = RESOURCE_ICON[kind];
        return (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-canvas"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-ink-soft">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">{r.name}</span>
                <span className="block text-[12px] text-ink-faint">{RESOURCE_LABEL[kind]}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/** Fade-up wrapper for staggered page entrances. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
