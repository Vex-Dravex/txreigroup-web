import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import VideoPlayerClient from "../../../videos/VideoPlayerClient";
import CommentForm from "../../../videos/CommentForm";
import CommentList from "../../../videos/CommentList";
import { addEducationComment } from "../../../videos/actions";
import { sampleVideoMap, sampleVideos } from "../../../educationData";
import { getWatchLaterVideos, toggleWatchLater } from "../../../watchLaterActions";
import YouTubeWatchLaterButton from "../../../YouTubeWatchLaterButton";
import RelatedCarousel from "../../../videos/RelatedCarousel";
import EducationDetailTutorial from "../../../videos/[id]/EducationDetailTutorial";

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
    parent_comment_id: string | null;
    profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type VideoCommentRow = {
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    parent_comment_id: string | null;
    profiles: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] | null;
};

export default async function EducationVideoDemoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

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
            // Fallback to sample if not found in DB
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
        href: `/app/courses/demo/videos/${id}`,
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
    ).map(v => ({ ...v, href: `/app/courses/demo/videos/${v.id}` }));

    let commentsData: VideoComment[] = [];
    let isSaved = false;

    if (!isSample && videoData) {
        const { data: comments } = await supabase
            .from("education_video_comments")
            .select(
                "id, body, created_at, author_id, parent_comment_id, profiles:author_id (display_name, avatar_url)"
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

        // Mock comments for samples
        commentsData = [
            {
                id: "mock-1",
                body: "This Wholesale Foundations video is a game changer! The part about sourcing leads was exactly what I needed.",
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                author_id: "user-1",
                parent_comment_id: null,
                profiles: { display_name: "Sarah Jenkins", avatar_url: null }
            },
            {
                id: "mock-2",
                body: "Solid advice on the contracts. I've been struggling with the assignment fee clause, but this cleared it up.",
                created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
                author_id: "user-2",
                parent_comment_id: null,
                profiles: { display_name: "Marcus REI", avatar_url: null }
            },
            {
                id: "mock-3",
                body: "How often do you guys update these courses? Would love to see more on creative finance.",
                created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                author_id: "user-3",
                parent_comment_id: null,
                profiles: { display_name: "Creative Closer", avatar_url: null }
            }
        ];
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
                            href="/app/courses/demo"
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
                                    poster={isSample ? activeSample.thumbnailUrl : videoData?.thumbnail_url}
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
                                                    href={`/app/courses/demo?topic=${encodeURIComponent(topic)}`}
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
                                    isDemo={true}
                                />
                            </div>

                            {/* Comments Section */}
                            <div className="rounded-2xl border border-white/40 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-zinc-900/40" id="education-comments-section">
                                <h2 className="text-xl font-black text-zinc-950 dark:text-zinc-50 font-display mb-6">
                                    Comments
                                </h2>

                                <div className="mb-8">
                                    <CommentForm
                                        videoId={id}
                                        userAvatarUrl={profileData?.avatar_url || null}
                                        userDisplayName={profileData?.display_name || null}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <CommentList
                                        comments={commentsData}
                                        videoId={id}
                                        userAvatarUrl={profileData?.avatar_url || null}
                                        userDisplayName={profileData?.display_name || null}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar for Normal Desktop View */}
                        <aside className="education-sidebar show-sidebar-on-normal-video">
                            <div className="sticky top-24" id="education-recommended-videos">
                                <RelatedCarousel
                                    relatedVideos={relatedVideos}
                                    relatedSamples={relatedSamples}
                                    isDemo={true}
                                />
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
            <EducationDetailTutorial />
        </div>
    );
}
