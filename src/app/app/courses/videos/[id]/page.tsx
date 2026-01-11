import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import VideoPlayerClient from "../VideoPlayerClient";
import {
  addEducationComment,
  addToWatchLater,
  removeFromWatchLater,
} from "../actions";
import { sampleVideoMap, sampleVideos } from "../../educationData";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type EducationVideo = {
  id: string;
  title: string;
  description: string | null;
  level: string;
  topics: string[];
  video_url: string;
  created_at: string;
};

type VideoComment = {
  id: string;
  body: string;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type VideoCommentRow = {
  id: string;
  body: string;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null }[] | null;
};

export default async function EducationVideoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(
    supabase,
    authData.user.id,
    profileData?.role || "investor"
  );
  const primaryRole = getPrimaryRole(roles, profileData?.role || "investor");

  const sampleVideo =
    sampleVideoMap[params.id] ||
    sampleVideos.find((video) => video.id === params.id);
  let isSample = Boolean(sampleVideo);
  let videoData: EducationVideo | null = null;

  if (!isSample) {
    const { data: video } = await supabase
      .from("education_videos")
      .select("id, title, description, level, topics, video_url, created_at")
      .eq("id", params.id)
      .eq("is_published", true)
      .single();

    if (!video) {
      isSample = true;
    } else {
      videoData = video as EducationVideo;
    }
  }

  const fallbackSample = {
    id: params.id,
    title: "Training Video",
    description: "This video will be available once it is published.",
    duration: "On-demand",
    level: "All Levels",
    topics: [],
    type: "video" as const,
    href: `/app/courses/videos/${params.id}`,
  };

  const activeSample = sampleVideo || fallbackSample;

  const currentTitle = isSample ? activeSample.title : videoData?.title || "";
  const currentDescription = isSample
    ? activeSample.description
    : videoData?.description || "";
  const currentTopics = isSample
    ? activeSample.topics
    : videoData?.topics || [];
  const currentLevel = isSample ? activeSample.level : videoData?.level || "";

  let relatedVideos: EducationVideo[] = [];
  if (!isSample && currentTopics.length > 0) {
    const { data: related } = await supabase
      .from("education_videos")
      .select("id, title, description, level, topics, video_url, created_at")
      .eq("is_published", true)
      .neq("id", params.id)
      .overlaps("topics", currentTopics)
      .limit(6);
    relatedVideos = (related as EducationVideo[]) || [];
  }

  const relatedSamples = sampleVideos.filter(
    (video) =>
      video.id !== activeSample.id &&
      video.topics.some((topic) => currentTopics.includes(topic))
  );

  let commentsData: VideoComment[] = [];
  let isSaved = false;

  if (!isSample && videoData) {
    const { data: comments } = await supabase
      .from("education_video_comments")
      .select(
        "id, body, created_at, profiles:author_id (display_name, avatar_url)"
      )
      .eq("video_id", params.id)
      .order("created_at", { ascending: false });

    const commentRows = (comments as VideoCommentRow[]) || [];
    commentsData = commentRows.map((comment) => ({
      ...comment,
      profiles: comment.profiles?.[0] ?? null,
    }));

    const { data: watchLater } = await supabase
      .from("education_watch_later")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("video_id", params.id)
      .maybeSingle();

    isSaved = Boolean(watchLater);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={primaryRole}
        currentPage="courses"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/app/courses"
            className="text-sm font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Back to Education Center
          </Link>
          {!isSample && (
            <form action={isSaved ? removeFromWatchLater : addToWatchLater}>
              <input type="hidden" name="videoId" value={params.id} />
              <button
                type="submit"
                className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide ${
                  isSaved
                    ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    : "bg-amber-600 text-white hover:bg-amber-500"
                }`}
              >
                {isSaved ? "Saved to Watch Later" : "Save to Watch Later"}
              </button>
            </form>
          )}
        </div>

        <div className="education-video-layout grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="education-main space-y-6">
            <div className="education-player-wrapper">
              <VideoPlayerClient
                videoUrl={isSample ? null : videoData?.video_url}
                title={currentTitle}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Description
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white dark:bg-zinc-800">
                  {currentLevel}
                </span>
                {currentTopics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/app/courses?topic=${encodeURIComponent(topic)}`}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {currentDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Comments
              </h3>
              {!isSample ? (
                <form action={addEducationComment} className="mt-4 space-y-3">
                  <input type="hidden" name="videoId" value={params.id} />
                  <textarea
                    name="body"
                    rows={3}
                    placeholder="Share your questions or takeaways"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Post comment
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Comments are available on published videos.
                </p>
              )}

              <div className="mt-6 space-y-4">
                {commentsData.length === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Be the first to comment on this lesson.
                  </p>
                ) : (
                  commentsData.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {comment.profiles?.display_name || "Member"}
                      </p>
                      <p className="mt-2">{comment.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
          <aside className="education-related space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Related videos
              </p>
              <div className="mt-4 space-y-3">
                {relatedVideos.length === 0 && relatedSamples.length === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No related videos yet.
                  </p>
                ) : (
                  <>
                    {relatedVideos.map((video) => (
                      <Link
                        key={video.id}
                        href={`/app/courses/videos/${video.id}`}
                        className="group flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-zinc-900 text-white">
                          <svg viewBox="0 0 24 24" className="h-8 w-8">
                            <path
                              fill="currentColor"
                              d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{video.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {video.topics.map((topic) => (
                              <Link
                                key={topic}
                                href={`/app/courses?topic=${encodeURIComponent(
                                  topic
                                )}`}
                                onClick={(event) => event.stopPropagation()}
                                className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                {topic}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {relatedSamples.map((video) => (
                      <Link
                        key={video.id}
                        href={video.href}
                        className="group flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-zinc-900 text-white">
                          <svg viewBox="0 0 24 24" className="h-8 w-8">
                            <path
                              fill="currentColor"
                              d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{video.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {video.topics.map((topic) => (
                              <Link
                                key={topic}
                                href={`/app/courses?topic=${encodeURIComponent(
                                  topic
                                )}`}
                                onClick={(event) => event.stopPropagation()}
                                className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                {topic}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
