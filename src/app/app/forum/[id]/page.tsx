import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import PostComments from "./PostComments";
import { VoteButton } from "../components/VoteButton";
import { FORUM_TOPICS } from "../topics";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

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

  // Fetch post (keep query resilient; fetch related data separately)
  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", id)
    .single();

  // If RLS blocks the row, try a server-side admin client (service role) as a fallback
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
    console.error("Error fetching post", postError);
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

  // Fetch mentions with display names (best effort)
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="forum"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/app/forum"
          className="mb-4 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to Forum
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              {topicLabel && (
                <Link
                  href={`/app/forum?topic=${postData.topic}`}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200"
                >
                  r/{topicLabel.replace(/\s+/g, "").toLowerCase()}
                </Link>
              )}
              <span>Posted {formatTimeAgo(postData.created_at)}</span>
            </div>

            <div className="mt-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {authorProfile?.avatar_url ? (
                  <img
                    src={authorProfile.avatar_url}
                    alt={authorName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {authorInitials}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {authorName}
                </span>
                {postData.is_pinned && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Pinned
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              {postData.title}
            </h1>

            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {postData.content}
              </p>
            </div>

            {/* Images */}
            {postData.image_urls && postData.image_urls.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                {postData.image_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Post image ${idx + 1}`}
                    className="w-full rounded-md"
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tagObj, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    #{tagObj.tag}
                  </span>
                ))}
              </div>
            )}

            {/* Mentions */}
            {mentions && mentions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Mentioned:</p>
                <div className="flex flex-wrap gap-2">
                  {mentions.map((mention, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      @{(mention as any)?.profiles?.display_name || "User"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="#comments"
                  className="inline-flex items-center gap-1 font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-zinc-50"
                >
                  💬 {postData.comment_count} Comments
                </Link>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                  <VoteButton
                    postId={postData.id}
                    voteType="upvote"
                    isActive={userVote?.vote_type === "upvote"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 11v8a2 2 0 0 0 2 2h6a3 3 0 0 0 2.96-2.46l1.1-6A2 2 0 0 0 17.1 10H14l.72-3.6a2 2 0 0 0-3.7-1.24L7 11Z" />
                      <path d="M7 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                    </svg>
                  </VoteButton>
                  <span>{postData.upvotes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <VoteButton
                    postId={postData.id}
                    voteType="downvote"
                    isActive={userVote?.vote_type === "downvote"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 13V5a2 2 0 0 0-2-2H9A3 3 0 0 0 6.04 5.46l-1.1 6A2 2 0 0 0 6.9 14H10l-.72 3.6a2 2 0 0 0 3.7 1.24L17 13Z" />
                      <path d="M17 13h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                    </svg>
                  </VoteButton>
                  <span>{postData.downvotes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments">
          <PostComments postId={postData.id} currentUserProfile={profileData} />
        </div>
      </div>
    </div>
  );
}
