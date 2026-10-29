// Shared types + helpers for the Academy (learner-facing) pages.

export interface Resource { name: string; url: string; }

export interface LessonSummary {
  _id: string;
  title: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
}

export interface CourseSummary {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  moduleNumber: number;
  totalLessons: number;
  totalDuration: number;
  sectionCount: number;
  completedLessons: number;
  progressPct: number;
  coverLesson: LessonSummary | null;
  resumeLesson: LessonSummary | null;
  lastWatchedAt: string | null;
}

export interface CurriculumLesson {
  _id: string;
  title: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
  duration: number;
  sortOrder: number;
  completed: boolean;
  watchedSeconds: number;
  resources: Resource[];
  group: string | null;
}

export interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  moduleNumber: number;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  lessons: CurriculumLesson[];
}

export interface Section {
  key: string;
  title: string;
  isGroup: boolean;
  lessons: CurriculumLesson[];
  resources: Resource[];
  completedCount: number;
  duration: number;
}

export function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function lessonThumb(
  l: { cloudinaryVideoUrl?: string; youtubeVideoId?: string } | null | undefined,
  size: "sm" | "lg" = "sm"
): string | null {
  if (!l) return null;
  if (l.cloudinaryVideoUrl) {
    const t = size === "lg" ? "so_2,w_960,h_540,c_fill,q_auto" : "so_2,w_480,h_270,c_fill,q_auto";
    return l.cloudinaryVideoUrl
      .replace("/video/upload/", `/video/upload/${t}/`)
      .replace(/\.(mp4|mov|avi|webm|mkv)(\?.*)?$/i, ".jpg");
  }
  if (l.youtubeVideoId) {
    // maxres/mq are 16:9; hq/sd have black letterbox bars baked in.
    return `https://img.youtube.com/vi/${l.youtubeVideoId}/${size === "lg" ? "maxresdefault" : "mqdefault"}.jpg`;
  }
  return null;
}

export function courseCover(c: Pick<CourseSummary, "thumbnailUrl" | "coverLesson">, size: "sm" | "lg" = "sm") {
  return c.thumbnailUrl || lessonThumb(c.coverLesson, size);
}

// Groups consecutive-by-key lessons into sections. Ungrouped lessons become
// their own single-lesson section, matching how the admin authors content.
export function buildSections(lessons: CurriculumLesson[]): Section[] {
  const map = new Map<string, CurriculumLesson[]>();
  const order: string[] = [];
  for (const l of lessons) {
    const key = l.group ?? l._id;
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key)!.push(l);
  }
  return order.map((key) => {
    const ls = map.get(key)!;
    return {
      key,
      title: ls[0].group ?? ls[0].title,
      isGroup: ls[0].group !== null,
      lessons: ls,
      resources: dedupeResources(ls.flatMap((l) => l.resources)),
      completedCount: ls.filter((l) => l.completed).length,
      duration: ls.reduce((s, l) => s + (l.duration || 0), 0),
    };
  });
}

export function dedupeResources(rs: Resource[]) {
  return rs.filter((r, i, arr) => arr.findIndex((x) => x.url === r.url) === i);
}

export type ResourceKind = "pdf" | "drive" | "link";

export function resourceKind(url: string): ResourceKind {
  const u = url.toLowerCase();
  if (u.includes(".pdf") || (u.startsWith("/") && !u.startsWith("//"))) return "pdf";
  if (u.includes("drive.google.com")) return "drive";
  return "link";
}

export const RESOURCE_LABEL: Record<ResourceKind, string> = {
  pdf: "PDF",
  drive: "Google Drive",
  link: "Link",
};

// "1h 24m" / "12m" / "45s" — human totals for course + section headers.
export function formatTotal(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return `${m}m`;
  return `${Math.round(seconds)}s`;
}
