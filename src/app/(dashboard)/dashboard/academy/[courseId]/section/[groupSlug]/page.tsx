"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle2, ChevronRight, Clock, FileText, ExternalLink, Link2 } from "lucide-react";
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

interface SectionData {
  course: { _id: string; title: string; moduleNumber: number };
  lessons: Lesson[];
}

const THEMES = [
  { accent: "#2ec97a", from: "#0a2018", to: "#1a4d35" },
  { accent: "#f5a623", from: "#2a1a00", to: "#4a3000" },
  { accent: "#6c9fff", from: "#0a1a30", to: "#1a3060" },
  { accent: "#d97bff", from: "#1a0a2a", to: "#3a1a50" },
];

function getResourceMeta(url: string): { label: string; iconBg: string } {
  const u = url.toLowerCase();
  if (u.includes(".pdf") || (u.startsWith("/") && !u.startsWith("//"))) {
    return { label: "PDF Guide", iconBg: "linear-gradient(135deg,#c0392b,#e74c3c)" };
  }
  if (u.includes("drive.google.com")) {
    return { label: "Google Drive", iconBg: "linear-gradient(135deg,#1a6b3a,#2ec97a)" };
  }
  return { label: "External Link", iconBg: "linear-gradient(135deg,#0a3080,#1877F2)" };
}

function ResourceIcon({ url }: { url: string }) {
  const u = url.toLowerCase();
  if (u.includes(".pdf") || (u.startsWith("/") && !u.startsWith("//"))) {
    return <FileText className="h-5 w-5 text-white" />;
  }
  if (u.includes("drive.google.com")) {
    return <Link2 className="h-5 w-5 text-white" />;
  }
  return <ExternalLink className="h-5 w-5 text-white" />;
}

export default function GroupPage() {
  const { courseId, groupSlug } = useParams<{ courseId: string; groupSlug: string }>();
  const router = useRouter();
  const [data, setData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "resources">("videos");

  useEffect(() => {
    fetch(`/api/academy/${courseId}/section/${groupSlug}`)
      .then((r) => r.json())
      .then((d) => { if (d.course) setData(d); else router.push("/dashboard/academy"); })
      .finally(() => setLoading(false));
  }, [courseId, groupSlug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const theme = THEMES[(data.course.moduleNumber - 1) % THEMES.length];

  // lessons are pre-filtered server-side by groupSlug
  const groupLessons = data.lessons;

  if (groupLessons.length === 0) {
    router.push(`/dashboard/academy/${courseId}`);
    return null;
  }

  const groupName = groupLessons[0].group!;
  const resources = groupLessons
    .flatMap((l) => l.resources)
    .filter((r, i, arr) => arr.findIndex((x) => x.url === r.url) === i);
  const completedCount = groupLessons.filter((l) => l.completed).length;
  const totalDuration = groupLessons.reduce((s, l) => s + l.duration, 0);
  const hasResources = resources.length > 0;

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <div className="p-5">
          <button
            onClick={() => router.push(`/dashboard/academy/${courseId}`)}
            className="flex items-center gap-1.5 text-sm mb-5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              {(groupName.match(/:\s*([A-Za-z])/)?.[1] ?? groupName.charAt(0)).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: theme.accent }}>
                Module
              </div>
              <h1 className="font-extrabold text-white text-xl leading-tight">{groupName}</h1>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Videos", value: String(groupLessons.length) },
              { label: "Duration", value: formatDuration(totalDuration) },
              { label: "Done", value: `${completedCount}/${groupLessons.length}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div className="text-white font-extrabold text-base">{value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs — only if there are resources */}
      {hasResources && (
        <div
          className="flex bg-white rounded-2xl mb-4 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          {(["videos", "resources"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-sm font-bold capitalize transition-colors relative"
              style={activeTab === tab ? { color: theme.accent } : { color: "#9ca3af" }}
            >
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ background: theme.accent }}
                />
              )}
              {tab === "resources" ? `Resources (${resources.length})` : "Videos"}
            </button>
          ))}
        </div>
      )}

      {/* Videos */}
      {activeTab === "videos" && (
        <div className="flex flex-col gap-2.5">
          {groupLessons.map((lesson, i) => (
            <button
              key={lesson._id}
              onClick={() => router.push(`/dashboard/academy/${courseId}/${lesson._id}`)}
              className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-3.5 text-left active:scale-[0.985] transition-transform"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Thumbnail */}
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
                  {lesson.completed ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: theme.accent }}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-3 w-3 fill-gray-900 text-gray-900 ml-0.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[9px] font-black uppercase tracking-wider mb-0.5"
                  style={{ color: theme.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className={`text-sm font-semibold leading-snug line-clamp-2 ${lesson.completed ? "text-gray-400" : "text-gray-900"}`}>
                  {lesson.title}
                </p>
                {lesson.duration > 0 && (
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDuration(lesson.duration)}
                  </p>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Resources */}
      {activeTab === "resources" && hasResources && (
        <div className="flex flex-col gap-2.5">
          {resources.map((resource, i) => {
            const meta = getResourceMeta(resource.url);
            return (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 bg-white rounded-2xl p-4 border border-gray-100 active:scale-[0.98] transition-transform"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: meta.iconBg }}
                >
                  <ResourceIcon url={resource.url} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {meta.label}
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{resource.name}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-300 shrink-0" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
