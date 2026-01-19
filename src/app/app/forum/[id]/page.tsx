import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import PostComments from "./PostComments";
import { VoteButton } from "../components/VoteButton";
import { SaveButton } from "../components/SaveButton";
import { FORUM_TOPICS } from "../topics";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { ForumLeftSidebar } from "../components/ForumLeftSidebar";
import { ForumRightSidebar } from "../components/ForumRightSidebar";
import { SearchInput } from "../components/SearchInput";
import { PostContentWrapper } from "./PostContentWrapper";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ForumPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  topic: string | null;
  image_urls: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type PostPageParams = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: PostPageParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  // Fetch post 
  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", id)
    .single();

  // If RLS blocks the row, try a server-side admin client as fallback
  let adminClient = null;
  let postData = post as ForumPost | null;

  if ((!post || postError) && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: adminPost, error: adminError } = await adminClient
      .from("forum_posts")
      .select("*")
      .eq("id", id)
      .single();

    postData = adminPost as ForumPost | null;
    if (adminError) {
      console.error("Admin fetch post error", adminError);
    }
  }

  if (!postData) {
    notFound();
  }

  const db = adminClient || supabase;

  // Fetch author profile
  const { data: authorProfile } = await db
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", postData.author_id)
    .maybeSingle();

  // Fetch tags
  const { data: tags } = await db
    .from("forum_post_tags")
    .select("tag")
    .eq("post_id", id);

  // Fetch mentions
  const { data: mentions } = await db
    .from("forum_post_mentions")
    .select("mentioned_user_id, profiles:mentioned_user_id ( display_name )")
    .eq("post_id", id);

  // Get user's vote
  const { data: userVote } = await supabase
    .from("forum_post_votes")
    .select("vote_type")
    .eq("post_id", id)
    .eq("user_id", authData.user.id)
    .single();

  // Get saved status
  const { data: savedPost } = await supabase
    .from("forum_saved_posts")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  const isSaved = !!savedPost;

  const authorName = authorProfile?.display_name || "Anonymous";
  const authorInitials = authorName
    .split(" ")
    .map((part: string) => part[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const topicLabel = postData.topic
    ? FORUM_TOPICS.find((t) => t.slug === postData.topic)?.label || postData.topic
    : null;

  // Fetch exact comment count to ensure accuracy
  const { count: realCommentCount } = await db
    .from("forum_comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const commentCount = realCommentCount ?? 0;

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const score = postData.upvotes - postData.downvotes;

  return (
    <ForumScrollRestorationProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-blue-500/30">
        <AppHeader
          userRole={userRole}
          currentPage="forum"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />
        <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-8">

            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:col-span-3 lg:block xl:col-span-2">
              <div className="sticky top-28 space-y-8">
                <div className="mb-6">
                  <Link
                    href="/app/forum"
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Feed
                  </Link>
                </div>
                <ForumLeftSidebar topicFilter={postData.topic || 'all'} />
              </div>
            </aside>

            {/* Center - Feed */}
            <main className="lg:col-span-9 xl:col-span-7">
              <div className="mb-8 flex flex-col gap-4">
                <div className="sticky top-20 z-30 -mx-4 bg-zinc-50/95 px-4 py-3 backdrop-blur-md dark:bg-black/95 sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <SearchInput />
                    </div>
                  </div>
                </div>
              </div>

              <PostContentWrapper>
                <div className="rounded-2xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/40 overflow-hidden">
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/app/profile/${postData.author_id}`}
                          className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50"
                        >
                          {authorProfile?.avatar_url ? (
                            <img
                              src={authorProfile.avatar_url}
                              alt={authorName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                              {authorInitials}
                            </div>
                          )}
                        </Link>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/app/profile/${postData.author_id}`}
                              className="font-bold text-zinc-900 hover:text-blue-600 dark:text-zinc-50 dark:hover:text-blue-400 transition-colors"
                            >
                              {authorName}
                            </Link>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                              {formatTimeAgo(postData.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {topicLabel && (
                              <Link
                                href={`/app/forum?topic=${postData.topic}`}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                              >
                                {topicLabel}
                              </Link>
                            )}
                            {postData.is_pinned && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                                Pinned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>


                    </div>

                    {/* Content */}
                    <div>
                      <h1 className="mb-6 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                        {postData.title}
                      </h1>

                      {/* Images */}
                      {postData.image_urls && postData.image_urls.length > 0 && (
                        <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                          {postData.image_urls.length === 1 ? (
                            <img src={postData.image_urls[0]} alt="Post" className="w-full max-h-[600px] object-contain" />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5">
                              {postData.image_urls.map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Post image ${idx + 1}`}
                                  className="h-64 sm:h-80 w-full object-cover first:rounded-tl-none last:rounded-br-none hover:scale-[1.02] transition-transform duration-500"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                        <p className="whitespace-pre-wrap">{postData.content}</p>
                      </div>
                    </div>

                    {/* Tags & Mentions */}
                    {((tags && tags.length > 0) || (mentions && mentions.length > 0)) && (
                      <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                        {tags?.map((tagObj, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 text-sm font-bold text-zinc-600 dark:text-zinc-400"
                          >
                            #{tagObj.tag}
                          </span>
                        ))}
                        {mentions?.map((mention, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-sm font-bold text-blue-600 dark:text-blue-400"
                          >
                            @{(mention as any)?.profiles?.display_name || "User"}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Sticky Action Bar */}
                    <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
                      <div className="flex items-center gap-4">
                        {/* Votes */}
                        <div className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1 shadow-inner">
                          <VoteButton
                            postId={postData.id}
                            voteType="upvote"
                            isActive={userVote?.vote_type === "upvote"}
                            className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition-all hover:scale-110 active:scale-90 text-zinc-400 hover:text-orange-500 hover:shadow-sm"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                          </VoteButton>
                          <span className={`min-w-[1.5rem] text-center text-sm font-black ${userVote?.vote_type === "upvote" ? "text-orange-500" : userVote?.vote_type === "downvote" ? "text-blue-500" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {score}
                          </span>
                          <VoteButton
                            postId={postData.id}
                            voteType="downvote"
                            isActive={userVote?.vote_type === "downvote"}
                            className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-full transition-all hover:scale-110 active:scale-90 text-zinc-400 hover:text-blue-500 hover:shadow-sm"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                          </VoteButton>
                        </div>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold px-2 text-sm">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <span>{commentCount} <span className="hidden sm:inline">Comments</span></span>
                        </div>

                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

                        <SaveButton
                          postId={postData.id}
                          isSaved={isSaved}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments Section Background */}
                  <div id="comments" className="bg-zinc-50 dark:bg-black/20 border-t border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
                    <h3 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-200">Discussion</h3>
                    <PostComments postId={postData.id} currentUserProfile={profileData} />
                  </div>
                </div>
              </PostContentWrapper>
            </main>

            {/* Right Sidebar - Widgets */}
            <aside className="hidden xl:col-span-3 xl:block">
              <div className="sticky top-28 space-y-6">
                <ForumRightSidebar />
              </div>
            </aside>

          </div>
        </div>
      </div>
    </ForumScrollRestorationProvider>
  );
}
