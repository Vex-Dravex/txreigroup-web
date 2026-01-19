"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { sampleVideos, topicOptions } from "./educationData";
import FadeIn, { FadeInStagger } from "../../components/FadeIn";

type Video = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  topics: string[];
  type: "video" | "live" | "course";
  thumbnailUrl?: string | null;
  href?: string;
  badge?: string;
  createdAt?: string;
};

// ... types ...

type CourseVideo = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  topics: string[];
  thumbnailUrl: string | null;
  href: string;
  badge: string;
};

type EducationVideo = {
  id: string;
  title: string;
  description: string | null;
  topics: string[];
  level: string;
  video_url: string;
  thumbnail_url?: string | null;
  created_at: string;
};

const sampleVideoCards: Video[] = sampleVideos.map((video) => ({
  ...video,
  href: video.href,
  createdAt: "2023-01-01T00:00:00Z", // Treat samples as old
}));

// Animation Variants (Exact match from DealsGrid/DealLink)
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardItemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

const formatCourseVideos = (courseVideos: CourseVideo[]): Video[] =>
  courseVideos.map((course) => ({
    id: `course-${course.id}`,
    title: course.title,
    description: course.description ?? "Course overview coming soon.",
    duration: course.duration ?? "Self-paced",
    level: "Members",
    topics: course.topics,
    type: "course",
    thumbnailUrl: course.thumbnailUrl,
    href: course.href,
    badge: course.badge,
    createdAt: "2023-01-01T00:00:00Z", // Courses date logic could be improved if provided
  }));

const formatEducationVideos = (educationVideos: EducationVideo[]): Video[] =>
  educationVideos.map((video) => ({
    id: `edu-${video.id}`,
    title: video.title,
    description: video.description ?? "Video overview coming soon.",
    duration: "On-demand",
    level: video.level,
    topics: video.topics,
    type: "video",
    href: `/app/courses/videos/${video.id}`,
    thumbnailUrl: video.thumbnail_url,
    createdAt: video.created_at,
  }));

const getVideoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-10 w-10 text-white/90"
  >
    <path
      fill="currentColor"
      d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
    />
  </svg>
);

export default function EducationCenterClient({
  courseVideos,
  educationVideos,
  watchLaterVideos,
}: {
  courseVideos: CourseVideo[];
  educationVideos: EducationVideo[];
  watchLaterVideos: { video_id: string; video_type: string }[];
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [viewFilter, setViewFilter] = useState<"all" | "watch-later">("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    const viewParam = searchParams.get("view");

    if (topicParam && topicOptions.includes(topicParam)) {
      setSelectedTopics([topicParam]);
    }

    if (viewParam === "watch-later") {
      setViewFilter("watch-later");
    } else {
      setViewFilter("all");
    }
  }, [searchParams]);

  const combinedVideos = useMemo(() => {
    const mappedCourses = formatCourseVideos(courseVideos);
    const mappedEducation = formatEducationVideos(educationVideos);
    // Sort all videos by creation date desc
    return [...sampleVideoCards, ...mappedEducation, ...mappedCourses].sort((a, b) => {
      // Use helper to safely parse dates, defaulting to 0 for invalid dates
      const getTime = (dateStr?: string) => {
        if (!dateStr) return 0;
        const time = new Date(dateStr).getTime();
        return isNaN(time) ? 0 : time;
      };

      const dateA = getTime(a.createdAt);
      const dateB = getTime(b.createdAt);
      return dateB - dateA;
    });
  }, [courseVideos, educationVideos]);

  const filteredVideos = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    let videos = combinedVideos;

    // Filter by watch later if viewing watch later list
    if (viewFilter === "watch-later") {
      videos = videos.filter((video) => {
        // Determine video type and clean ID from video.id
        let videoType: string;
        let cleanVideoId: string;

        if (video.id.startsWith("course-")) {
          videoType = "course";
          cleanVideoId = video.id.replace("course-", "");
        } else if (video.id.startsWith("edu-")) {
          videoType = "education";
          cleanVideoId = video.id.replace("edu-", "");
        } else {
          videoType = "sample";
          cleanVideoId = video.id; // Sample IDs like "sample-1" stay as-is
        }

        // Check if this video is in the watch later list
        return watchLaterVideos.some(
          (wl) => wl.video_type === videoType && wl.video_id === cleanVideoId
        );
      });
    }

    return videos.filter((video) => {
      if (showLiveOnly && video.type !== "live") return false;
      if (
        selectedTopics.length > 0 &&
        !video.topics.some((topic) => selectedTopics.includes(topic))
      ) {
        return false;
      }
      if (!normalizedSearch) return true;
      return (
        video.title.toLowerCase().includes(normalizedSearch) ||
        video.description.toLowerCase().includes(normalizedSearch) ||
        video.topics.some((topic) =>
          topic.toLowerCase().includes(normalizedSearch)
        )
      );
    });
  }, [combinedVideos, searchValue, selectedTopics, showLiveOnly, viewFilter, watchLaterVideos]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic]
    );
  };

  const liveVideo = combinedVideos.find((video) => video.type === "live");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <FadeInStagger className="grid gap-12 lg:grid-cols-12 lg:items-start mb-16">
        <FadeIn className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200/50 backdrop-blur-sm dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/30">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Education Center
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-display leading-tight">
            Build <span className="text-amber-600 dark:text-amber-500">Mastery</span> with<br />
            Videos & Playbooks
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Curated for wholesalers, investors, and gators. Search, filter by
            topic, and join the live room each week.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="lg:col-span-5">
          <div className="rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-xl shadow-amber-500/5 backdrop-blur-md ring-1 ring-white/60 dark:border-white/5 dark:bg-zinc-900/30 dark:shadow-black/50 dark:ring-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Next Live Stream
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-xl">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-display">
                  Wednesdays
                </p>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  7:00 PM CST
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Weekly live coaching, Q&amp;A, and deal reviews.
            </p>
            <button
              type="button"
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 hover:scale-[1.02] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Remind me
            </button>
          </div>
        </FadeIn>
      </FadeInStagger>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            {/* Feeds */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                Feeds
              </h3>
              <nav className="space-y-1">
                <Link
                  href="/app/courses"
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${viewFilter === "all"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                    }`}
                >
                  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${viewFilter === "all" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  All Videos
                </Link>
                <Link
                  href="/app/courses?view=watch-later"
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${viewFilter === "watch-later"
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                    }`}
                >
                  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${viewFilter === "watch-later" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  Watch Later
                </Link>
              </nav>
            </div>

            {/* Topics */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  Topics
                </h3>
                {selectedTopics.length > 0 && (
                  <Link
                    href="/app/courses"
                    className="text-[10px] font-bold uppercase text-blue-600 hover:underline dark:text-blue-400"
                    onClick={() => setSelectedTopics([])}
                  >
                    Clear
                  </Link>
                )}
              </div>
              <nav className="space-y-1">
                {topicOptions.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <Link
                      key={topic}
                      href={`/app/courses?topic=${topic}`}
                      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSelected
                        ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                        }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedTopics([]);
                        } else {
                          setSelectedTopics([topic]);
                        }
                      }}
                    >
                      <span className="break-words">{topic}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Format Filter */}
            <div>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                Format
              </h3>
              <label className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <input
                  type="checkbox"
                  checked={showLiveOnly}
                  onChange={(event) => setShowLiveOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-900"
                />
                Live sessions only
              </label>
            </div>
          </div>
        </aside>

        <section>
          <FadeIn>
            <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-zinc-900/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                    Search videos
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-inner dark:border-zinc-700 dark:bg-zinc-950/60">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
                    >
                      <path
                        fill="currentColor"
                        d="M10.5 3.75a6.75 6.75 0 1 0 4.21 12.02l3.26 3.26a.75.75 0 1 0 1.06-1.06l-3.26-3.26A6.75 6.75 0 0 0 10.5 3.75Zm0 1.5a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5Z"
                      />
                    </svg>
                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      placeholder="Search by title, topic, or strategy"
                      className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm text-white dark:bg-zinc-950">
                  <p className="text-xs uppercase text-white/70">Results</p>
                  <p className="text-lg font-semibold">{filteredVideos.length}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {liveVideo && (
            <FadeIn>
              <div className="mt-6 grid gap-4 rounded-2xl border border-amber-200/50 bg-amber-50/50 p-6 shadow-sm backdrop-blur-sm md:grid-cols-[1.2fr_1fr] dark:border-amber-500/20 dark:bg-amber-900/10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                    Live weekly room
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {liveVideo.title}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {liveVideo.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {liveVideo.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-zinc-900/95 p-6 text-center text-white">
                  <div>
                    <p className="text-xs uppercase text-white/60">
                      Live player
                    </p>
                    <div className="mt-4 flex items-center justify-center">
                      {getVideoIcon()}
                    </div>
                    <p className="mt-4 text-sm text-white/80">
                      Streaming window opens 15 minutes before start time.
                    </p>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-full border border-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-zinc-900"
                    >
                      Enter live room
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewFilter}-${filteredVideos[0]?.id || "empty"}-${selectedTopics.join(",")}-${showLiveOnly ? "live" : "all"}`}
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredVideos.map((video) => {
                const isNew =
                  video.createdAt &&
                  Date.now() - new Date(video.createdAt).getTime() < 24 * 60 * 60 * 1000;

                // Determine video type and clean ID from the video.id
                let videoType: "course" | "education" | "sample";
                let cleanVideoId: string;

                if (video.id.startsWith("course-")) {
                  videoType = "course";
                  cleanVideoId = video.id.replace("course-", "");
                } else if (video.id.startsWith("edu-")) {
                  videoType = "education";
                  cleanVideoId = video.id.replace("edu-", "");
                } else {
                  videoType = "sample";
                  cleanVideoId = video.id;
                }

                return (
                  <motion.div key={video.id} variants={cardItemVariants} className="flex flex-col">
                    <Link
                      href={video.href || "#"}
                      className="block flex-1"
                      onClick={() => {
                        if (video.href) {
                          // Save scroll position before navigating
                          sessionStorage.setItem("courses-scroll-position", window.scrollY.toString());
                        }
                      }}
                    >
                      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/50 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 dark:border-white/5 dark:bg-zinc-900/40">
                        <div className="relative aspect-video overflow-hidden bg-zinc-900">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              {getVideoIcon()}
                            </div>
                          )}

                          {isNew ? (
                            <span className="absolute left-4 top-4 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              New
                            </span>
                          ) : video.badge ? (
                            <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              {video.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                              {video.title}
                            </h3>
                            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-zinc-800">
                              {video.level}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                            {video.description}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {video.topics.map((topic) => (
                              <span
                                key={topic}
                                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            <span>{video.duration}</span>
                            <span>{video.type === "live" ? "Live" : "On-demand"}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
