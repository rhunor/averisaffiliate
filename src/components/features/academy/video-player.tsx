"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, RotateCcw, X } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { EASE_OUT } from "./primitives";

type YTPlayer = { destroy(): void; getCurrentTime(): number };

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
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface PlayableLesson {
  _id: string;
  youtubeVideoId: string;
  cloudinaryVideoUrl: string;
  watchedSeconds: number;
  completed: boolean;
  duration: number;
}

interface VideoPlayerProps {
  lesson: PlayableLesson;
  next: { _id: string; title: string } | null;
  /** Called every few seconds while playing, and on pause, with the playhead position. */
  onProgress: (seconds: number) => void;
  onEnded: () => void;
  onPlayNext: () => void;
  onFinishCourse: () => void;
}

const AUTOPLAY_SECONDS = 6;

/** Resume point: only if meaningfully into an unfinished video. */
function resumeAt(l: PlayableLesson) {
  const s = Math.floor(l.watchedSeconds || 0);
  if (l.completed || s < 10) return 0;
  if (l.duration && s > l.duration - 15) return 0;
  return s;
}

/**
 * Mount with `key={lesson._id}` — one instance per lesson keeps player
 * setup/teardown simple (YouTube replaces its host node with an iframe).
 */
export function VideoPlayer({ lesson, next, onProgress, onEnded, onPlayNext, onFinishCourse }: VideoPlayerProps) {
  const isCloudinary = !!lesson.cloudinaryVideoUrl;
  const start = resumeAt(lesson);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hostId = `yt-player-${lesson._id}`;
  const [ended, setEnded] = useState(false);
  const [countdown, setCountdown] = useState(AUTOPLAY_SECONDS);
  const [autoplay, setAutoplay] = useState(true);
  const [showResume, setShowResume] = useState(start > 0);

  const position = useCallback(() => {
    if (isCloudinary) return Math.floor(videoRef.current?.currentTime ?? 0);
    try { return Math.floor(ytRef.current?.getCurrentTime() ?? 0); } catch { return 0; }
  }, [isCloudinary]);

  const stopTick = useCallback(() => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  const startTick = useCallback(() => {
    if (tickRef.current) return;
    tickRef.current = setInterval(() => onProgress(position()), 5000);
  }, [onProgress, position]);

  const handlePlay = useCallback(() => { setEnded(false); startTick(); }, [startTick]);
  const handlePause = useCallback(() => { stopTick(); onProgress(position()); }, [stopTick, onProgress, position]);
  const handleEnded = useCallback(() => {
    stopTick();
    onProgress(position());
    setCountdown(AUTOPLAY_SECONDS);
    setAutoplay(true);
    setEnded(true);
    onEnded();
  }, [stopTick, onProgress, position, onEnded]);

  // Latest handlers for the YouTube callbacks, which are bound once at creation.
  const handlers = useRef({ handlePlay, handlePause, handleEnded });
  useEffect(() => { handlers.current = { handlePlay, handlePause, handleEnded }; });

  useEffect(() => {
    if (isCloudinary || !lesson.youtubeVideoId) return;

    const init = () => {
      ytRef.current = new window.YT.Player(hostId, {
        videoId: lesson.youtubeVideoId,
        playerVars: { rel: 0, modestbranding: 1, iv_load_policy: 3, playsinline: 1, ...(start ? { start } : {}) },
        events: {
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) handlers.current.handlePlay();
            else if (e.data === S.PAUSED) handlers.current.handlePause();
            else if (e.data === S.ENDED) handlers.current.handleEnded();
          },
        },
      });
    };

    if (window.YT?.Player) init();
    else {
      window.onYouTubeIframeAPIReady = init;
      if (!document.getElementById("yt-api-script")) {
        const s = document.createElement("script");
        s.id = "yt-api-script";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
      ytRef.current?.destroy();
      ytRef.current = null;
    };
  }, [isCloudinary, lesson.youtubeVideoId, hostId, start]);

  // Flush position on unmount (navigating to another lesson mid-video).
  useEffect(() => () => { stopTick(); }, [stopTick]);

  useEffect(() => {
    if (!showResume) return;
    const t = setTimeout(() => setShowResume(false), 3500);
    return () => clearTimeout(t);
  }, [showResume]);

  // Autoplay countdown once a video ends.
  useEffect(() => {
    if (!ended || !autoplay || !next) return;
    if (countdown <= 0) { onPlayNext(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [ended, autoplay, countdown, next, onPlayNext]);

  function replay() {
    setEnded(false);
    if (isCloudinary && videoRef.current) { videoRef.current.currentTime = 0; void videoRef.current.play(); }
  }

  const r = 22;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative aspect-video w-full bg-black">
      {isCloudinary ? (
        <video
          ref={videoRef}
          src={lesson.cloudinaryVideoUrl}
          controls
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
          className="h-full w-full"
          onLoadedMetadata={() => { if (start && videoRef.current) videoRef.current.currentTime = start; }}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
        />
      ) : (
        <div className="h-full w-full">
          <div id={hostId} className="h-full w-full" />
        </div>
      )}

      <AnimatePresence>
        {showResume && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/75 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur"
          >
            Resuming from {formatDuration(start)}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 px-6 text-center text-white backdrop-blur-sm"
          >
            {next ? (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }} className="flex max-w-md flex-col items-center">
                <p className="text-[13px] text-white/60">Up next</p>
                <p className="mt-1.5 line-clamp-2 text-[17px] font-semibold leading-snug sm:text-[20px]">{next.title}</p>
                <button onClick={onPlayNext} className="relative mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink transition-transform hover:scale-105" aria-label="Play next lesson">
                  {autoplay && (
                    <svg className="absolute -inset-1 h-16 w-16 -rotate-90" viewBox="0 0 48 48" aria-hidden>
                      <motion.circle
                        cx="24" cy="24" r={r} fill="none" stroke="#40D457" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={c}
                        initial={{ strokeDashoffset: c }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: AUTOPLAY_SECONDS, ease: "linear" }}
                      />
                    </svg>
                  )}
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </button>
                <div className="mt-5 flex items-center gap-4 text-[13px]">
                  {autoplay ? (
                    <button onClick={() => setAutoplay(false)} className="flex items-center gap-1.5 text-white/70 hover:text-white">
                      <X className="h-3.5 w-3.5" /> Cancel autoplay ({countdown}s)
                    </button>
                  ) : (
                    <button onClick={replay} className="flex items-center gap-1.5 text-white/70 hover:text-white">
                      <RotateCcw className="h-3.5 w-3.5" /> Replay
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: EASE_OUT }} className="flex flex-col items-center">
                <p className="text-[20px] font-semibold">You&apos;ve reached the end of this course</p>
                <p className="mt-1 text-[14px] text-white/60">Nice work. Review any lesson from the course content.</p>
                <div className="mt-5 flex gap-3">
                  <button onClick={onFinishCourse} className="rounded-md bg-secondary px-4 py-2 text-[14px] font-semibold text-ink hover:bg-secondary-light">
                    Back to course
                  </button>
                  {isCloudinary && (
                    <button onClick={replay} className="rounded-md border border-white/25 px-4 py-2 text-[14px] font-semibold text-white hover:bg-white/10">
                      Replay
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
