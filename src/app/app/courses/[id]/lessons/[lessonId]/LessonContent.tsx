"use client";

import { useState } from "react";
import { updateLessonProgress, markLessonComplete } from "./actions";
import { useRouter } from "next/navigation";

export default function LessonContent({
  lessonId,
  content,
  isCompleted,
  progressPercentage,
}: {
  lessonId: string;
  content: string | null;
  isCompleted: boolean;
  progressPercentage: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const [progress, setProgress] = useState(progressPercentage);

  async function handleProgressUpdate(newProgress: number) {
    setLoading(true);
    try {
      await updateLessonProgress(lessonId, newProgress);
      setProgress(newProgress);
      router.refresh();
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkComplete() {
    setLoading(true);
    try {
      await markLessonComplete(lessonId);
      setCompleted(true);
      setProgress(100);
      router.refresh();
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Content */}
      {content ? (
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">No content available for this lesson.</p>
      )}

      {/* Progress Controls */}
      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Progress: {progress}%
          </label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleProgressUpdate(25)}
              disabled={loading || completed}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              25%
            </button>
            <button
              onClick={() => handleProgressUpdate(50)}
              disabled={loading || completed}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              50%
            </button>
            <button
              onClick={() => handleProgressUpdate(75)}
              disabled={loading || completed}
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              75%
            </button>
          </div>
        </div>

        {completed ? (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Lesson completed!</span>
          </div>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {loading ? "Marking..." : "Mark as Complete"}
          </button>
        )}
      </div>
    </div>
  );
}

