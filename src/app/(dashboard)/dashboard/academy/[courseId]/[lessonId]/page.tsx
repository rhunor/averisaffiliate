"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LessonResource { name: string; url: string; }

interface LessonDetail {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  duration: number;
  resources: LessonResource[];
  completed: boolean;
  watchedSeconds: number;
  courseTitle: string;
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

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const watchedRef = useRef(0);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<{ destroy(): void } | null>(null);
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

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    saveProgress(false);
  }, [saveProgress]);

  // Mount YouTube IFrame API after lesson loads
  useEffect(() => {
    if (!lesson?.youtubeVideoId) return;

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
  }, [lesson?.youtubeVideoId, playerDivId]);

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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back nav */}
      <Link href={`/dashboard/academy/${courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {lesson.courseTitle}
      </Link>

      {/* YouTube player */}
      <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full">
        <div id={playerDivId} className="w-full h-full" />
      </div>

      {/* Lesson info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
          )}
        </div>
        <button
          onClick={handleMarkComplete}
          disabled={markingComplete || lesson.completed}
          className={`shrink-0 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
            lesson.completed
              ? "bg-success/10 text-success cursor-default"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          {lesson.completed ? "Completed" : markingComplete ? "Saving…" : "Mark complete"}
        </button>
      </div>

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Resources</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {lesson.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-border transition-colors">
                <FileText className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">{r.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prev / Next */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {lesson.prevLesson ? (
          <Link href={`/dashboard/academy/${courseId}/${lesson.prevLesson._id}`}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-colors">
            <span className="text-xs text-muted-foreground flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Previous</span>
            <span className="text-sm font-medium text-foreground line-clamp-2">{lesson.prevLesson.title}</span>
          </Link>
        ) : <div />}

        {lesson.nextLesson ? (
          <Link href={`/dashboard/academy/${courseId}/${lesson.nextLesson._id}`}
            className="flex flex-col items-end gap-1 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-colors text-right">
            <span className="text-xs text-muted-foreground flex items-center gap-1">Next <ArrowRight className="h-3 w-3" /></span>
            <span className="text-sm font-medium text-foreground line-clamp-2">{lesson.nextLesson.title}</span>
          </Link>
        ) : (
          <button onClick={() => router.push(`/dashboard/academy/${courseId}`)}
            className="flex flex-col items-end gap-1 p-4 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors text-right">
            <span className="text-xs text-success flex items-center gap-1">Course done <CheckCircle className="h-3 w-3" /></span>
            <span className="text-sm font-medium text-success">Back to course</span>
          </button>
        )}
      </div>
    </div>
  );
}
