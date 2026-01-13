"use client";

import { useState, useRef } from "react";
import { addEducationComment } from "./actions";
import Link from "next/link";

export default function CommentForm({
    videoId,
    userAvatarUrl,
    userDisplayName,
}: {
    videoId: string;
    userAvatarUrl: string | null;
    userDisplayName: string | null;
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [comment, setComment] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await addEducationComment(formData);
            setComment("");
            setIsFocused(false); // Optionally keep focused if they want to write another? Usually loses focus or resets state.
            formRef.current?.reset();
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsFocused(false);
        setComment("");
    };

    return (
        <div className="flex gap-4">
            {/* User Avatar */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                {userAvatarUrl ? (
                    <img
                        src={userAvatarUrl}
                        alt={userDisplayName || "User"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                        {userDisplayName ? userDisplayName[0].toUpperCase() : "U"}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <div className="flex-1">
                <form ref={formRef} action={handleSubmit} className="space-y-2">
                    <input type="hidden" name="videoId" value={videoId} />
                    <textarea
                        name="body"
                        rows={isFocused || comment.length > 0 ? 3 : 1}
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        className="w-full resize-none border-b border-zinc-200 bg-transparent py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-b-2 focus:border-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100"
                        style={{ minHeight: isFocused || comment.length > 0 ? "80px" : "40px" }}
                    />

                    {(isFocused || comment.length > 0) && (
                        <div className="flex items-center justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!comment.trim() || isSubmitting}
                                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                {isSubmitting ? "Commenting..." : "Comment"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
