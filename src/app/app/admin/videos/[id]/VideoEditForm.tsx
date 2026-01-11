"use client";

import { useMemo, useState } from "react";
import { updateEducationVideo } from "../actions";
import { topicOptions } from "../../../courses/educationData";

const levelOptions = ["Beginner", "Intermediate", "Advanced"];

type EducationVideo = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topics: string[];
  video_url: string;
};

export default function VideoEditForm({ video }: { video: EducationVideo }) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || "");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(video.topics);
  const [level, setLevel] = useState(video.level);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const isReadyToSave = useMemo(() => {
    return title.trim().length > 0;
  }, [title]);

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
      action={updateEducationVideo}
      encType="multipart/form-data"
    >
      <input type="hidden" name="id" value={video.id} />
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
          Current video file
        </p>
        <a
          href={video.video_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300"
        >
          View uploaded video
          <span aria-hidden="true">-&gt;</span>
        </a>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Replace video file (optional)
          </label>
          <input
            key={inputKey}
            type="file"
            name="file"
            accept="video/*"
            onChange={handleFileInput}
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          />
          {selectedFile && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Ready to replace with {selectedFile.name}
            </p>
          )}
        </div>
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
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Topics
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Update topics for search and filters.
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
            Save updates
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Changes update the Education Center catalog after saving.
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
          Save changes
        </button>
      </div>
    </form>
  );
}
