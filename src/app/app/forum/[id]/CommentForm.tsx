"use client";

import { useState, useRef } from "react";
import { createComment } from "../actions";

export default function CommentForm({
  postId,
  userAvatarUrl,
  userDisplayName,
  parentCommentId,
  onSuccess,
}: {
  postId: string;
  userAvatarUrl: string | null;
  userDisplayName: string | null;
  parentCommentId?: string;
  onSuccess?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      await createComment(postId, content, parentCommentId);
      setContent("");
      setIsFocused(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFocused(false);
    setContent("");
    onSuccess?.();
  };

  return (
    <div className={`flex gap-4 ${parentCommentId ? 'mb-4' : 'mb-10'}`}>
      {/* User Avatar */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hidden sm:block">
        {userAvatarUrl ? (
          <img
            src={userAvatarUrl}
            alt={userDisplayName || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {userDisplayName ? userDisplayName[0].toUpperCase() : "U"}
          </div>
        )}
      </div>

      <div className="flex-1">
        <form ref={formRef} onSubmit={handleSubmit} className={`relative rounded-2xl border transition-all duration-200 ${isFocused ? "bg-white dark:bg-black border-blue-500 ring-4 ring-blue-500/10 shadow-lg" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
          <textarea
            autoFocus={!!parentCommentId}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            rows={isFocused || content.length > 0 ? 4 : 2}
            placeholder={parentCommentId ? "Write a reply..." : "What are your thoughts?"}
            className="w-full resize-none bg-transparent p-4 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none dark:text-zinc-100"
          />

          {(isFocused || content.length > 0 || parentCommentId) && (
            <div className="flex items-center justify-between px-2 pb-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 px-2">
                {/* Formatting tools placeholders could go here */}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
