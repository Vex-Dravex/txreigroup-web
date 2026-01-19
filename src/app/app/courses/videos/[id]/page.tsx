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
import RelatedCarousel from "../RelatedCarousel";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-amber-500/30">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <AppHeader
          userRole={primaryRole}
          currentPage="courses"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />

        <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/app/courses"
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Education Center
            </Link>
          </div>

          <div className="education-video-layout grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8">
            <div className="education-main space-y-6">
              {/* Video Player Section */}
              <div className="space-y-6">
                <VideoPlayerClient
                  videoUrl={isSample ? null : videoData?.video_url}
                  poster={isSample ? null : videoData?.thumbnail_url}
                  title={currentTitle}
                />

                <div className="space-y-4">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 font-display leading-tight">
                    {currentTitle}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3">
                    <YouTubeWatchLaterButton
                      videoId={id}
                      videoType={isSample ? "sample" : "education"}
                      initialSaved={isSaved}
                      onToggle={toggleWatchLater}
                    />

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white dark:bg-zinc-800">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        {currentLevel}
                      </span>
                      {currentTopics.map((topic) => (
                        <Link
                          key={topic}
                          href={`/app/courses?topic=${encodeURIComponent(topic)}`}
                          className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 transition-all hover:bg-amber-100 hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30"
                        >
                          {topic}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-zinc-900/40">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                    About This Video
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {currentDescription}
                  </p>
                </div>
              </div>

              {/* Related Videos for Theater Mode and Mobile */}
              <div className="hide-on-normal-video">
                <RelatedCarousel
                  relatedVideos={relatedVideos}
                  relatedSamples={relatedSamples}
                />
              </div>

              {/* Comments Section */}
              <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-zinc-900/40">
                <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50 font-display mb-6">
                  Comments
                </h2>

                {!isSample ? (
                  <div className="mb-8">
                    <CommentForm
                      videoId={id}
                      userAvatarUrl={profileData?.avatar_url || null}
                      userDisplayName={profileData?.display_name || null}
                    />
                  </div>
                ) : (
                  <div className="mb-6 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      💬 Comments are available on published videos.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {commentsData.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Be the first to share your thoughts
                      </p>
                    </div>
                  ) : (
                    commentsData.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group">
                        <Link
                          href={`/app/profile/${comment.author_id}`}
                          className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 ring-2 ring-white dark:ring-zinc-900 transition-transform hover:scale-105"
                        >
                          {comment.profiles?.avatar_url ? (
                            <img
                              src={comment.profiles.avatar_url}
                              alt={comment.profiles.display_name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black text-zinc-600 dark:text-zinc-300">
                              {comment.profiles?.display_name
                                ? comment.profiles.display_name[0].toUpperCase()
                                : "U"}
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/app/profile/${comment.author_id}`}
                              className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                            >
                              {comment.profiles?.display_name || "Member"}
                            </Link>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar for Normal Desktop View */}
            <aside className="education-sidebar show-sidebar-on-normal-video">
              <div className="sticky top-24">
                <RelatedCarousel
                  relatedVideos={relatedVideos}
                  relatedSamples={relatedSamples}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
