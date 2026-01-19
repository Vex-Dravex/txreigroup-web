"use client";

import { useEffect } from "react";
import { useSavedDeals } from "./SavedDealsProvider";

export default function SaveButton() {
    const { savedIds, showSavedOnly, setShowSavedOnly } = useSavedDeals();

    // Debug: Log when state changes
    useEffect(() => {
        console.log('[SaveButton] State updated:', { showSavedOnly, savedCount: savedIds.length });
    }, [showSavedOnly, savedIds.length]);

    const handleToggle = () => {
        console.log('[SaveButton] Toggle clicked. Current state:', showSavedOnly, '-> New state:', !showSavedOnly);
        setShowSavedOnly(!showSavedOnly);
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap ${showSavedOnly
                ? "border-pink-500 bg-pink-600 text-white shadow-pink-500/20"
                : "border-zinc-100 bg-white text-zinc-900 shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:shadow-none"
                }`}
        >
            <svg
                className={`h-5 w-5 transition-transform duration-300 ${showSavedOnly ? "scale-110" : ""}`}
                fill={showSavedOnly ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
            <span>{showSavedOnly ? "View All" : "Saved Listings"}</span>
            {savedIds.length > 0 && (
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black ${showSavedOnly ? "bg-white text-pink-600" : "bg-pink-600 text-white"
                    }`}>
                    {savedIds.length}
                </span>
            )}
        </button>
    );
}
