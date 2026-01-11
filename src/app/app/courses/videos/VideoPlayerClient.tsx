"use client";

import { useEffect, useRef, useState } from "react";

type PlayerSize = "default" | "theater";

export default function VideoPlayerClient({
  videoUrl,
  poster,
  title,
}: {
  videoUrl?: string | null;
  poster?: string | null;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [size, setSize] = useState<PlayerSize>("default");

  useEffect(() => {
    if (size === "theater") {
      document.documentElement.classList.add("player-theater");
    } else {
      document.documentElement.classList.remove("player-theater");
    }

    return () => {
      document.documentElement.classList.remove("player-theater");
    };
  }, [size]);

  const handleFullscreen = async () => {
    if (!videoRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await videoRef.current.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen errors.
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Player
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSize("default")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              size === "default"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            Default
          </button>
          <button
            type="button"
            onClick={() => setSize("theater")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              size === "theater"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            Theater
          </button>
          <button
            type="button"
            onClick={handleFullscreen}
            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Full Screen
          </button>
        </div>
      </div>

      <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-zinc-900">
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            poster={poster || undefined}
            className="h-full w-full"
          >
            <source src={videoUrl} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-white">
            <div className="h-12 w-12 rounded-full bg-white/10 p-2">
              <svg viewBox="0 0 24 24" className="h-full w-full">
                <path
                  fill="currentColor"
                  d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
                />
              </svg>
            </div>
            <p className="text-sm text-white/80">
              Sample video placeholder. Upload videos to play here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
