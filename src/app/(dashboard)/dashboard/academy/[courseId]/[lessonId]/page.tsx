"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, ExternalLink, Link2, ChevronRight, Play } from "lucide-react";

interface LessonResource { name: string; url: string; }

interface LessonDetail {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
  duration: number;
  resources: LessonResource[];
  completed: boolean;
  watchedSeconds: number;
  courseTitle: string;
  group: string | null;
  prevLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => { destroy(): void };
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function toSlug(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

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

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "next">("overview");
  const watchedRef = useRef(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<{ destroy(): void } | null>(null);
  const cloudVideoRef = useRef<HTMLVideoElement>(null);
  const playerDivId = "yt-player-" + lessonId;

  useEffect(() => {
    fetch(`/api/academy/${courseId}/${lessonId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.lesson) {
          setLesson(d.lesson);
          watchedRef.current = d.lesson.watchedSeconds || 0;
        } else {
          router.push(`/dashboard/academy/${courseId}`);
        }
      })
      .finally(() => setLoading(false));

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.destroy();
    };
  }, [courseId, lessonId, router]);

  const saveProgress = useCallback(async (completed = false) => {
    try {
      await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId, watchedSeconds: watchedRef.current, completed }),
      });
    } catch {}
  }, [lessonId, courseId]);

  const startTick = useCallback(() => {
    if (tickRef.current) return;
    tickRef.current = setInterval(() => {
      watchedRef.current += 5;
      saveProgress(false);
    }, 5000);
  }, [saveProgress]);

  // For Cloudinary video: tick only saves (watchedRef updated via onTimeUpdate)
  const startCloudTick = useCallback(() => {
    if (tickRef.current) return;
    tickRef.current = setInterval(() => {
      saveProgress(false);
    }, 5000);
  }, [saveProgress]);

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    saveProgress(false);
  }, [saveProgress]);

  // YouTube player setup
  useEffect(() => {
    if (!lesson?.youtubeVideoId || lesson.cloudinaryVideoUrl) return;

    const initPlayer = () => {
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
      playerRef.current = new window.YT.Player(playerDivId, {
        videoId: lesson.youtubeVideoId,
        playerVars: { rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1 },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              startTick();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              stopTick();
            } else if (e.data === window.YT.PlayerState.ENDED) {
              stopTick();
              handleMarkComplete();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-api-script")) {
        const s = document.createElement("script");
        s.id = "yt-api-script";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.youtubeVideoId, lesson?.cloudinaryVideoUrl, playerDivId]);

  async function handleMarkComplete() {
    if (markingComplete || lesson?.completed) return;
    setMarkingComplete(true);
    await saveProgress(true);
    setLesson((prev) => prev ? { ...prev, completed: true } : prev);
    setMarkingComplete(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!lesson) return null;

  const backHref = lesson.group
    ? `/dashboard/academy/${courseId}/section/${toSlug(lesson.group)}`
    : `/dashboard/academy/${courseId}`;

  const hasResources = lesson.resources.length > 0;
  const tabs = [
    { key: "overview", label: "Overview" },
    ...(hasResources ? [{ key: "resources", label: `Resources (${lesson.resources.length})` }] : []),
    { key: "next", label: "Up Next" },
  ] as { key: "overview" | "resources" | "next"; label: string }[];

  const isCloudinary = !!lesson.cloudinaryVideoUrl;

  return (
    <div className="animate-fade-in pb-24">
      {/* Back nav */}
      <button
        onClick={() => router.push(backHref)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {lesson.group ?? lesson.courseTitle}
      </button>

      {/* Video player */}
      <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full mb-4">
        {isCloudinary ? (
          <video
            ref={cloudVideoRef}
            src={lesson.cloudinaryVideoUrl}
            controls
            playsInline
            className="w-full h-full"
            onPlay={startCloudTick}
            onPause={stopTick}
            onEnded={() => { stopTick(); handleMarkComplete(); }}
            onTimeUpdate={() => {
              if (cloudVideoRef.current) {
                watchedRef.current = Math.floor(cloudVideoRef.current.currentTime);
              }
            }}
          />
        ) : (
          <div id={playerDivId} className="w-full h-full" />
        )}
      </div>

      {/* Lesson meta + complete button */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-foreground leading-snug">{lesson.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{lesson.courseTitle}</p>
        </div>
        <button
          onClick={handleMarkComplete}
          disabled={markingComplete || lesson.completed}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
            lesson.completed
              ? "bg-success/10 text-success cursor-default"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {lesson.completed ? "Done" : markingComplete ? "Saving…" : "Mark done"}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex bg-white rounded-2xl mb-4 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-3 text-xs font-bold transition-colors relative"
            style={activeTab === tab.key ? { color: "#2ec97a" } : { color: "#9ca3af" }}
          >
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-secondary" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">About This Lesson</p>
          {lesson.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
          ) : (
            <p className="text-sm text-gray-400">No description available.</p>
          )}
        </div>
      )}

      {/* Resources tab */}
      {activeTab === "resources" && hasResources && (
        <div className="flex flex-col gap-2.5">
          {lesson.resources.map((resource, i) => {
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

      {/* Up Next tab */}
      {activeTab === "next" && (
        <div className="flex flex-col gap-3">
          {lesson.nextLesson ? (
            <button
              onClick={() => router.push(`/dashboard/academy/${courseId}/${lesson.nextLesson!._id}`)}
              className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-4 text-left active:scale-[0.985] transition-transform"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Play className="h-5 w-5 text-secondary ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Up Next</p>
                <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                  {lesson.nextLesson.title}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-8 bg-white rounded-2xl text-center"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <p className="font-bold text-gray-900">All caught up!</p>
              <p className="text-sm text-gray-400 mt-1">You&apos;ve reached the end of this section.</p>
              <button
                onClick={() => router.push(`/dashboard/academy/${courseId}`)}
                className="mt-4 text-sm font-semibold text-secondary hover:underline"
              >
                Back to course
              </button>
            </div>
          )}

          {lesson.prevLesson && (
            <button
              onClick={() => router.push(`/dashboard/academy/${courseId}/${lesson.prevLesson!._id}`)}
              className="w-full flex items-center gap-3.5 bg-white rounded-2xl p-4 text-left active:scale-[0.985] transition-transform"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <ArrowLeft className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Previous</p>
                <p className="text-sm font-semibold text-gray-600 leading-snug line-clamp-1">
                  {lesson.prevLesson.title}
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
