import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { VoteButton } from "./components/VoteButton";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ForumPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  image_urls: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  forum_post_tags: {
    tag: string;
  }[];
  user_vote: {
    vote_type: string;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function ForumPage() {
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
  const userRole = profileData?.role || "investor";

  // Fetch forum posts with author info and tags
  const { data: posts, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      profiles:author_id (
        display_name,
        avatar_url
      ),
      forum_post_tags (
        tag
      )
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching forum posts:", error);
  }

  // Fetch user's votes separately
  const { data: userVotes } = await supabase
    .from("forum_post_votes")
    .select("post_id, vote_type")
    .eq("user_id", authData.user.id);

  const votesMap = new Map((userVotes || []).map((v) => [v.post_id, v.vote_type]));

  // Calculate score for sorting (hot algorithm: score = (upvotes - downvotes) / hours_since_post)
  const postsData = (posts as ForumPost[]) || [];
  const now = Date.now();
  const postsWithVotes = postsData.map((post) => ({
    ...post,
    user_vote: votesMap.get(post.id) ? { vote_type: votesMap.get(post.id) } : null,
  }));
  const sortedPosts = postsWithVotes.sort((a, b) => {
    // Pinned posts always first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Calculate hot score
    const hoursA = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
    const hoursB = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
    const scoreA = (a.upvotes - a.downvotes) / Math.max(hoursA, 1);
    const scoreB = (b.upvotes - b.downvotes) / Math.max(hoursB, 1);
    
    return scoreB - scoreA;
  });

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Community Forum</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Share ideas, ask questions, and connect with the community
            </p>
          </div>
          <Link
            href="/app/forum/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            New Post
          </Link>
        </div>

        {sortedPosts.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No posts yet. Be the first to share!</p>
            <Link
              href="/app/forum/new"
              className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPosts.map((post) => {
              const score = post.upvotes - post.downvotes;
              const authorName = post.profiles?.display_name || "Anonymous";
              const authorInitials = authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={post.id}
                  className={`rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-950 ${
                    post.is_pinned
                      ? "border-blue-300 dark:border-blue-700"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex">
                    {/* Voting Section */}
                    <div className="flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-l-lg">
                      <VoteButton
                        postId={post.id}
                        voteType="upvote"
                        isActive={post.user_vote?.vote_type === "upvote"}
                      >
                        ▲
                      </VoteButton>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 my-1">
                        {score}
                      </span>
                      <VoteButton
                        postId={post.id}
                        voteType="downvote"
                        isActive={post.user_vote?.vote_type === "downvote"}
                      >
                        ▼
                      </VoteButton>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={authorName}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              {authorInitials}
                            </div>
                          )}
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {authorName}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatTimeAgo(post.created_at)}
                          </span>
                          {post.is_pinned && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Pinned
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={`/app/forum/${post.id}`}>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2 hover:text-zinc-700 dark:hover:text-zinc-300">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        {post.content}
                      </p>

                      {/* Images Preview */}
                      {post.image_urls && post.image_urls.length > 0 && (
                        <div className="mb-3 flex gap-2">
                          {post.image_urls.slice(0, 3).map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Post image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          ))}
                          {post.image_urls.length > 3 && (
                            <div className="w-20 h-20 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-600 dark:text-zinc-400">
                              +{post.image_urls.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {post.forum_post_tags && post.forum_post_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.forum_post_tags.map((tagObj, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                              #{tagObj.tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                        <Link
                          href={`/app/forum/${post.id}`}
                          className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300"
                        >
                          💬 {post.comment_count} comments
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

