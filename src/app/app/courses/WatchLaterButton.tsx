"use client";

import { useState } from "react";
import { toggleWatchLater } from "./watchLaterActions";

type WatchLaterButtonProps = {
    videoId: string;
    videoType: "course" | "education" | "sample";
    isSaved: boolean;
};

export default function WatchLaterButton({ videoId, videoType, isSaved: initialSaved }: WatchLaterButtonProps) {
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking the button
        e.stopPropagation();

        setIsLoading(true);
        const result = await toggleWatchLater(videoId, videoType);

        if (result.success) {
            setIsSaved(result.saved || false);
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSaved
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/40"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isSaved ? "Remove from Watch Later" : "Save to Watch Later"}
        >
            <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="text-xs">{isSaved ? "Saved" : "Watch Later"}</span>
        </button>
    );
}
