"use client";

import { useSavedDeals } from "./SavedDealsProvider";

export default function HeartButton({ dealId }: { dealId: string }) {
    const { isSaved, toggleSave } = useSavedDeals();
    const saved = isSaved(dealId);

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSave(dealId);
            }}
            className={`group/heart flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${saved
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                    : "bg-white/50 text-zinc-900 border border-white/20 hover:bg-white hover:scale-110"
                }`}
            aria-label={saved ? "Remove from saved" : "Save listing"}
        >
            <svg
                className={`h-5 w-5 transition-all duration-300 ${saved ? "fill-current scale-110" : "fill-none group-hover/heart:scale-110"}`}
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
        </button>
    );
}
