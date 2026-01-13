"use client";

import { toggleSavePost } from "../actions";
import { useState } from "react";

type SaveButtonProps = {
    postId: string;
    isSaved: boolean;
    className?: string;
    children?: React.ReactNode;
};

export function SaveButton({ postId, isSaved: initialIsSaved, className = "", children }: SaveButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (isLoading) return;
        setIsLoading(true);
        // Optimistic update
        setIsSaved(!isSaved);

        try {
            await toggleSavePost(postId);
        } catch (error) {
            console.error("Failed to toggle save", error);
            // Revert if failed
            setIsSaved(!isSaved);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={isLoading}
            className={`${isSaved ? "text-emerald-600 dark:text-emerald-500" : "text-zinc-500 dark:text-zinc-400"} ${className}`}
        >
            {isSaved ? (
                <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    <span className="hidden sm:inline">Saved</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    <span className="hidden sm:inline">Save</span>
                </div>
            )}
        </button>
    );
}
