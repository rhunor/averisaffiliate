"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, FileText, ExternalLink, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LessonResource {
  name: string;
  url: string;
}

interface LessonDetail {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  resources: LessonResource[];
  completed: boolean;
  watchedSeconds: number;
  courseTitle: string;
  prevLesson: { _id: string; title: string } | null;
  nextLesson: { _id: string; title: string } | null;
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const progressSaved = useRef(false);
  const watchTimer = useRef<NodeJS.Timeout | null>(null);
  const watchedRef = useRef(0);

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
      if (watchTimer.current) clearInterval(watchTimer.current);
    };
  }, [courseId, lessonId, router]);

  const saveProgress = useCallback(async (completed = false) => {
    if (progressSaved.current && !completed) return;
    try {
      await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId, watchedSeconds: watchedRef.current, completed }),
      });
      if (completed) progressSaved.current = true;
    } catch {}
  }, [lessonId, courseId]);

  function handleVideoPlay() {
    if (watchTimer.current) return;
    watchTimer.current = setInterval(() => {
      watchedRef.current += 5;
      saveProgress(false);
    }, 5000);
  }

  function handleVideoPause() {
    if (watchTimer.current) { clearInterval(watchTimer.current); watchTimer.current = null; }
    saveProgress(false);
  }

  async function markComplete() {
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
      <Link
        href={`/dashboard/academy/${courseId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {lesson.courseTitle}
      </Link>

      {/* Video player */}
      <div className="rounded-2xl overflow-hidden bg-black aspect-video w-full">
        {lesson.videoUrl ? (
          <video
            key={lesson.videoUrl}
            controls
            className="w-full h-full"
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={() => { handleVideoPause(); markComplete(); }}
          >
            <source src={lesson.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <Play className="h-16 w-16" />
          </div>
        )}
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
          onClick={markComplete}
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
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-border transition-colors"
              >
                <FileText className="h-4 w-4 text-secondary shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">{r.name}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prev / Next navigation */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {lesson.prevLesson ? (
          <Link
            href={`/dashboard/academy/${courseId}/${lesson.prevLesson._id}`}
            className="flex flex-col items-start gap-1 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-colors"
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Previous
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-2">{lesson.prevLesson.title}</span>
          </Link>
        ) : <div />}

        {lesson.nextLesson ? (
          <Link
            href={`/dashboard/academy/${courseId}/${lesson.nextLesson._id}`}
            className="flex flex-col items-end gap-1 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-colors text-right"
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Next <ArrowRight className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-foreground line-clamp-2">{lesson.nextLesson.title}</span>
          </Link>
        ) : (
          <button
            onClick={() => router.push(`/dashboard/academy/${courseId}`)}
            className="flex flex-col items-end gap-1 p-4 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-colors text-right"
          >
            <span className="text-xs text-success flex items-center gap-1">
              Course done <CheckCircle className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-success">Back to course</span>
          </button>
        )}
      </div>
    </div>
  );
}
