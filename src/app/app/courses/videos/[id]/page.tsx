import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import VideoPlayerClient from "../VideoPlayerClient";
import CommentForm from "../CommentForm";
import { addEducationComment } from "../actions";
import { sampleVideoMap, sampleVideos } from "../../educationData";
import { getWatchLaterVideos, toggleWatchLater } from "../../watchLaterActions";
import YouTubeWatchLaterButton from "../../YouTubeWatchLaterButton";

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
  thumbnail_url: string | null;
  created_at: string;
};

type VideoComment = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type VideoCommentRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] | null;
};

export default async function EducationVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    sampleVideoMap[id] ||
    sampleVideos.find((video) => video.id === id);
  let isSample = Boolean(sampleVideo);
  let videoData: EducationVideo | null = null;

  if (!isSample) {
    const { data: video } = await supabase
      .from("education_videos")
      .select("id, title, description, level, topics, video_url, thumbnail_url, created_at")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (!video) {
      isSample = true;
    } else {
      videoData = video as EducationVideo;
    }
  }

  const fallbackSample = {
    id: id,
    title: "Training Video",
    description: "This video will be available once it is published.",
    duration: "On-demand",
    level: "All Levels",
    topics: [],
    type: "video" as const,
    href: `/app/courses/videos/${id}`,
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
      .select("id, title, description, level, topics, video_url, thumbnail_url, created_at")
      .eq("is_published", true)
      .neq("id", id)
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
        "id, body, created_at, author_id, profiles:author_id (display_name, avatar_url)"
      )
      .eq("video_id", id)
      .order("created_at", { ascending: false });

    const commentRows = (comments as VideoCommentRow[]) || [];
    commentsData = commentRows.map((comment) => {
      const profilesData = comment.profiles;
      const profile = Array.isArray(profilesData)
        ? profilesData[0]
        : profilesData;
      return {
        ...comment,
        profiles: profile ?? null,
      };
    });

    // Check if video is saved to watch later using new table
    const watchLaterVideos = await getWatchLaterVideos();
    isSaved = watchLaterVideos.some(
      (wl) => wl.video_type === "education" && wl.video_id === id
    );
  } else if (isSample) {
    // Check if sample video is saved
    const watchLaterVideos = await getWatchLaterVideos();
    isSaved = watchLaterVideos.some(
      (wl) => wl.video_type === "sample" && wl.video_id === id
    );
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
            ← Back to Education Center
          </Link>
        </div>

        <div className="education-video-layout grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="education-main space-y-6">
            <div className="education-player-wrapper">
              <VideoPlayerClient
                videoUrl={isSample ? null : videoData?.video_url}
                poster={isSample ? null : videoData?.thumbnail_url}
                title={currentTitle}
              />
            </div>

            {/* YouTube-style Watch Later Button */}
            <div className="flex items-center gap-3">
              <YouTubeWatchLaterButton
                videoId={id}
                videoType={isSample ? "sample" : "education"}
                initialSaved={isSaved}
                onToggle={toggleWatchLater}
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
                <div className="mt-6 mb-8">
                  <CommentForm
                    videoId={id}
                    userAvatarUrl={profileData?.avatar_url || null}
                    userDisplayName={profileData?.display_name || null}
                  />
                </div>
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
                    <div key={comment.id} className="flex gap-4">
                      <Link
                        href={`/app/profile/${comment.author_id}`}
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                      >
                        {comment.profiles?.avatar_url ? (
                          <img
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.display_name || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                            {comment.profiles?.display_name
                              ? comment.profiles.display_name[0].toUpperCase()
                              : "U"}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/app/profile/${comment.author_id}`}
                            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {comment.profiles?.display_name || "Member"}
                          </Link>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {comment.body}
                        </p>

                        <div className="flex items-center gap-4 pt-1">
                          <button className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v8a2 2 0 0 0 2 2h6a3 3 0 0 0 2.96-2.46l1.1-6A2 2 0 0 0 17.1 10H14l.72-3.6a2 2 0 0 0-3.7-1.24L7 11Z" /><path d="M7 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg>
                            <span>Like</span>
                          </button>
                          <button className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 13V5a2 2 0 0 0-2-2H9A3 3 0 0 0 6.04 5.46l-1.1 6A2 2 0 0 0 6.9 14H10l-.72 3.6a2 2 0 0 0 3.7 1.24L17 13Z" /><path d="M17 13h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" /></svg>
                          </button>
                          <button className="rounded-full px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                            Reply
                          </button>
                        </div>
                      </div>
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
                      <div
                        key={video.id}
                        className="group flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <Link
                          href={`/app/courses/videos/${video.id}`}
                          className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-8 w-8">
                            <path
                              fill="currentColor"
                              d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
                            />
                          </svg>
                        </Link>
                        <div className="flex-1">
                          <Link
                            href={`/app/courses/videos/${video.id}`}
                            className="block text-sm font-semibold hover:underline"
                          >
                            {video.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {video.topics.map((topic) => (
                              <Link
                                key={topic}
                                href={`/app/courses?topic=${encodeURIComponent(
                                  topic
                                )}`}
                                className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                {topic}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {relatedSamples.map((video) => (
                      <div
                        key={video.id}
                        className="group flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <Link
                          href={video.href}
                          className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white"
                        >
                          <svg viewBox="0 0 24 24" className="h-8 w-8">
                            <path
                              fill="currentColor"
                              d="M8.25 6.75h6.5A2.5 2.5 0 0 1 17.25 9.25v5.5a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5v-5.5a2.5 2.5 0 0 1 2.5-2.5Zm8.1 1.65 2.35-1.46a.75.75 0 0 1 1.15.64v8.86a.75.75 0 0 1-1.15.64l-2.35-1.46V8.4Z"
                            />
                          </svg>
                        </Link>
                        <div className="flex-1">
                          <Link
                            href={video.href}
                            className="block text-sm font-semibold hover:underline"
                          >
                            {video.title}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {video.topics.map((topic) => (
                              <Link
                                key={topic}
                                href={`/app/courses?topic=${encodeURIComponent(
                                  topic
                                )}`}
                                className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                {topic}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
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
