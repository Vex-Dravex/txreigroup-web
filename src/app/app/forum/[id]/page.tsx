import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import PostComments from "./PostComments";
import { VoteButton } from "../components/VoteButton";

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
  forum_post_mentions: {
    mentioned_user_id: string;
    profiles: {
      display_name: string | null;
    } | null;
  }[];
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function PostDetailPage({ params }: { params: { id: string } }) {
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

  // Fetch post with all related data
  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .select(`
      *,
      profiles:author_id (
        display_name,
        avatar_url
      ),
      forum_post_tags (
        tag
      ),
      forum_post_mentions (
        mentioned_user_id,
        profiles:mentioned_user_id (
          display_name
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (postError || !post) {
    notFound();
  }

  const postData = post as ForumPost;

  // Get user's vote
  const { data: userVote } = await supabase
    .from("forum_post_votes")
    .select("vote_type")
    .eq("post_id", params.id)
    .eq("user_id", authData.user.id)
    .single();

  const score = postData.upvotes - postData.downvotes;
  const authorName = postData.profiles?.display_name || "Anonymous";
  const authorInitials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        <Link
          href="/app/forum"
          className="mb-4 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to Forum
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex">
            {/* Voting Section */}
            <div className="flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-l-lg">
              <VoteButton
                postId={postData.id}
                voteType="upvote"
                isActive={userVote?.vote_type === "upvote"}
              >
                ▲
              </VoteButton>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 my-2">
                {score}
              </span>
              <VoteButton
                postId={postData.id}
                voteType="downvote"
                isActive={userVote?.vote_type === "downvote"}
              >
                ▼
              </VoteButton>
            </div>

            {/* Post Content */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {postData.profiles?.avatar_url ? (
                    <img
                      src={postData.profiles.avatar_url}
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
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatTimeAgo(postData.created_at)}
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
              {postData.forum_post_tags && postData.forum_post_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {postData.forum_post_tags.map((tagObj, idx) => (
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
              {postData.forum_post_mentions && postData.forum_post_mentions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Mentioned:</p>
                  <div className="flex flex-wrap gap-2">
                    {postData.forum_post_mentions.map((mention, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        @{mention.profiles?.display_name || "User"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <PostComments postId={postData.id} />
      </div>
    </div>
  );
}

