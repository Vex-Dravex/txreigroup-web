"use client";

import { useMemo, useState } from "react";
import { createEducationVideo } from "../actions";
import { topicOptions } from "../../../courses/educationData";

const levelOptions = ["Beginner", "Intermediate", "Advanced"];

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

export default function VideoUploadForm() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [level, setLevel] = useState("Beginner");

  const isReadyToSave = useMemo(() => {
    return Boolean(selectedFile && title.trim().length > 0);
  }, [selectedFile, title]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setInputKey((prev) => prev + 1);
      return;
    }
    if (!file.type.startsWith("video/")) {
      setSelectedFile(null);
      setInputKey((prev) => prev + 1);
      return;
    }
    setSelectedFile(file);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic]
    );
  };

  return (
    <form
      className="space-y-8"
      action={createEducationVideo}
      encType="multipart/form-data"
    >
      <div
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-950"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={() => setDragActive(false)}
      >
        <input
          key={inputKey}
          name="file"
          type="file"
          accept="video/*"
          onChange={handleFileInput}
          required
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-800">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 3.75a.75.75 0 0 1 .75.75v8.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V4.5A.75.75 0 0 1 12 3.75Z"
            />
            <path
              fill="currentColor"
              d="M4.5 15.75a.75.75 0 0 1 .75.75v1.25c0 .69.56 1.25 1.25 1.25h10.99c.69 0 1.25-.56 1.25-1.25V16.5a.75.75 0 1 1 1.5 0v1.25A2.75 2.75 0 0 1 17.49 20.5H6.51a2.75 2.75 0 0 1-2.75-2.75V16.5a.75.75 0 0 1 .75-.75Z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Drag and drop your video here
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          MP4, MOV, or WEBM formats are supported.
        </p>
        <div className="mt-6">
          <span className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-zinc-900">
            Browse files
          </span>
        </div>
        {selectedFile && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedFile.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
              onClick={() => {
                setSelectedFile(null);
                setInputKey((prev) => prev + 1);
              }}
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              Video title
            </label>
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give the video a clear title"
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              Description
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Add the key takeaways and learning outcomes"
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
              Lesson level
            </label>
            <input type="hidden" name="level" value={level} />
            <div className="mt-3 flex flex-wrap gap-2">
              {levelOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                    level === option
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Topics</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tag the lesson so it shows in filters.
              </p>
            </div>
            {selectedTopics.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTopics([])}
                className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-3">
            {topicOptions.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <label
                  key={topic}
                  className="flex cursor-pointer items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-amber-600 bg-amber-500"
                        : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </span>
                  <input
                    name="topics"
                    type="checkbox"
                    value={topic}
                    checked={isSelected}
                    onChange={() => toggleTopic(topic)}
                    className="sr-only"
                  />
                  {topic}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Ready to publish?
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Add a file, title, topics, and level before saving.
          </p>
        </div>
        <button
          type="submit"
          disabled={!isReadyToSave}
          className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide ${
            isReadyToSave
              ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          Save video
        </button>
      </div>
    </form>
  );
}
