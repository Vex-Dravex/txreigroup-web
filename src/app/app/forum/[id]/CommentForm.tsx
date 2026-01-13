"use client";

import { useState, useRef } from "react";
import { createComment } from "../actions";

export default function CommentForm({
  postId,
  userAvatarUrl,
  userDisplayName,
}: {
  postId: string;
  userAvatarUrl: string | null;
  userDisplayName: string | null;
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
      await createComment(postId, content);
      setContent("");
      setIsFocused(false);
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFocused(false);
    setContent("");
  };

  return (
    <div className="flex gap-4 mb-8">
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

      <div className="flex-1">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            rows={isFocused || content.length > 0 ? 3 : 1}
            placeholder="Add a comment..."
            className="w-full resize-none border-b border-zinc-200 bg-transparent py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-b-2 focus:border-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-100"
            style={{ minHeight: isFocused || content.length > 0 ? "80px" : "40px" }}
          />

          {(isFocused || content.length > 0) && (
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
                disabled={!content.trim() || isSubmitting}
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
