"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function VideoPlayerClient({
  videoUrl,
  poster,
  title,
}: {
  videoUrl?: string | null;
  poster?: string | null;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Manage theater mode class on the document
  useEffect(() => {
    if (theaterMode) {
      document.documentElement.classList.add("player-theater");
    } else {
      document.documentElement.classList.remove("player-theater");
    }
    return () => {
      document.documentElement.classList.remove("player-theater");
    };
  }, [theaterMode]);

  // Handle fullscreen changes from the browser side (ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isScrubbing]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (videoRef.current) {
      const newTime = (newProgress / 100) * duration;
      setCurrentTime(newTime);
      videoRef.current.currentTime = newTime;
    }
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
  };

  const handleScrubEnd = () => {
    setIsScrubbing(false);
    if (videoRef.current && isPlaying) {
      resetControlsTimeout();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) {
        setVolume(1);
        videoRef.current.volume = 1;
      } else {
        setVolume(0);
        videoRef.current.volume = 0;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  if (!videoUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-sm dark:border-zinc-700 relative group">
        {poster ? (
          <>
            <img
              src={poster}
              alt={title}
              className="h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-40"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition transform hover:scale-110 hover:bg-red-700 group-hover:shadow-red-500/20">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <div className="space-y-1 px-4">
                <p className="text-sm font-bold text-white uppercase tracking-widest drop-shadow-md">Sample Lesson</p>
                <p className="text-xs text-white/70 drop-shadow-md italic">Upload a video to enable playback</p>
              </div>
            </div>
          </>
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
    );
  }

  return (
    <div
      ref={containerRef}
      id="education-video-player-section"
      className={`theater-video-container group relative aspect-video w-full overflow-hidden bg-black shadow-lg outline-none transition-all ${theaterMode
        ? ""
        : "rounded-2xl"
        }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k") {
          e.preventDefault();
          togglePlay();
        } else if (e.key === "f") {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === "t") {
          e.preventDefault();
          setTheaterMode((prev) => !prev);
        } else if (e.key === "m") {
          e.preventDefault();
          toggleMute();
        }
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster || undefined}
        className="h-full w-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <button className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition transform hover:scale-110 hover:bg-red-700">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
      >
        {/* Progress Bar */}
        <div className="group/scrubber relative mb-3 flex h-4 items-center cursor-pointer">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleScrubChange}
            onMouseDown={handleScrubStart}
            onMouseUp={handleScrubEnd}
            className="absolute z-20 h-full w-full cursor-pointer opacity-0"
          />
          {/* Track Background */}
          <div className="flex h-1 w-full items-center rounded bg-white/30 transition-all group-hover/scrubber:h-1.5">
            <div
              className="h-full rounded bg-red-600 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 scale-0 rounded-full bg-red-600 transition-transform group-hover/scrubber:scale-100" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-200 outline-none"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="group/volume flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-200 outline-none"
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 scale-x-0 cursor-pointer overflow-hidden transition-all duration-200 group-hover/volume:w-20 group-hover/volume:scale-x-100 accent-white h-1 bg-white/30 rounded-full"
              />
            </div>

            <div className="text-sm font-medium text-white shadow-black drop-shadow-md">
              <span className="text-white">{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/70">/</span>
              <span className="text-white/70">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Title overlay in controls if needed, but keeping it clean for now */}

            {/* Theater Mode */}
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="text-white hover:text-gray-200 outline-none hidden sm:block"
              title="Theater mode (t)"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                {theaterMode ? (
                  <path fill="currentColor" d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z" />
                ) : (
                  <path fill="currentColor" d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z" />
                )}
              </svg>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-200 outline-none"
              title="Full screen (f)"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
