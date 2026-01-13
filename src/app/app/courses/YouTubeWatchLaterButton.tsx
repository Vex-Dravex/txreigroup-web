"use client";

import { useState, useTransition } from "react";

type YouTubeWatchLaterButtonProps = {
    videoId: string;
    videoType: "course" | "education" | "sample";
    initialSaved: boolean;
    onToggle: (videoId: string, videoType: "course" | "education" | "sample") => Promise<{ success: boolean; saved?: boolean; error?: string }>;
};

export default function YouTubeWatchLaterButton({
    videoId,
    videoType,
    initialSaved,
    onToggle,
}: YouTubeWatchLaterButtonProps) {
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            const result = await onToggle(videoId, videoType);
            if (result.success) {
                setIsSaved(result.saved || false);
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`group inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${isSaved
                    ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-100 dark:hover:bg-amber-900/30"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                } ${isPending ? "opacity-60 cursor-wait" : "shadow-sm hover:shadow"}`}
            title={isSaved ? "Remove from Watch Later" : "Save to Watch Later"}
        >
            {/* Bookmark icon - same as sidebar */}
            <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 transition-all ${isPending ? "animate-pulse" : ""} ${isSaved ? "scale-110" : ""
                    }`}
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="font-medium">
                {isSaved ? "Saved to Watch Later" : "Save to Watch Later"}
            </span>
        </button>
    );
}
