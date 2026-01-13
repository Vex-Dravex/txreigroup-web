import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { VoteButton } from "./components/VoteButton";
import { SearchInput } from "./components/SearchInput";
import { FORUM_TOPICS } from "./topics";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";
import { ForumPostLink } from "@/components/ScrollSavingLink";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ForumPost = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  image_urls: string[];
  topic: string | null;
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
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type ForumPageSearchParams = {
  topic?: string;
  search?: string;
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams?: Promise<ForumPageSearchParams>;
}) {
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

  // Fetch forum posts with author info and tags
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const searchTerm = resolvedSearchParams?.search || "";

  // If searching, first get post IDs that match tags
  let tagPostIds: string[] = [];
  if (searchTerm) {
    const { data: tagData } = await supabase
      .from("forum_post_tags")
      .select("post_id")
      .ilike("tag", `%${searchTerm}%`);

    if (tagData) {
      tagPostIds = tagData.map((t: any) => t.post_id);
    }
  }

  const topicFilter = resolvedSearchParams?.topic || "all";

  // If looking for saved posts, fetch those IDs
  let savedPostIds: string[] | null = null;
  if (topicFilter === "saved") {
    const { data: saves } = await supabase
      .from("forum_saved_posts")
      .select("post_id")
      .eq("user_id", authData.user.id);

    savedPostIds = saves?.map((s) => s.post_id) || [];
  }

  // Fetch forum posts with author info and tags
  let query = supabase
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

  if (searchTerm) {
    const orConditions = [
      `title.ilike.%${searchTerm}%`,
      `content.ilike.%${searchTerm}%`,
      `topic.ilike.%${searchTerm}%`
    ];
    if (tagPostIds.length > 0) {
      orConditions.push(`id.in.(${tagPostIds.join(',')})`);
    }
    query = query.or(orConditions.join(','));
  }

  if (topicFilter === "saved") {
    // If savedPostIds is defined (even if empty), filter by it
    if (savedPostIds && savedPostIds.length > 0) {
      query = query.in("id", savedPostIds);
    } else {
      // Force empty result if no saved posts
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
  } else if (topicFilter !== "all" && topicFilter !== "uncategorized") {
    query = query.eq("topic", topicFilter);
  } else if (topicFilter === "uncategorized") {
    // This assumes uncategorized means topic is null? Or matches specific logic?
    // Based on previous code: .filter check was !post.topic. 
    // Supabase filter for null is .is("topic", null)
    query = query.is("topic", null);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching forum posts:", error);
  }

  // Fetch user's votes separately
  const { data: userVotes } = await supabase
    .from("forum_post_votes")
    .select("post_id, vote_type")
    .eq("user_id", authData.user.id);

  const votesMap = new Map((userVotes || []).map((v) => [v.post_id, v.vote_type]));

  // Calculate score for sorting (hot algorithm)
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

  const topicLabelMap = FORUM_TOPICS.reduce<Record<string, string>>((acc, topic) => {
    acc[topic.slug] = topic.label;
    return acc;
  }, {});

  // Note: filtering is now done via SQL mostly, except for specific client-side refinements if needed.
  // The existing code did client-side filtering. Now we moved it to server-side query.
  // We can just use sortedPosts as the filteredPosts if we trust the query.
  // However, the `uncategorizedCount` and `topicCounts` relied on fetching ALL posts and simple filtering.
  // Since we are now potentially filtering in SQL, `postsData` might only contain subset.
  // To keep counts accurate, we might need a separate count query or stick to client side filtering if the dataset is small (limit 50).
  // The original code was `limit(50)` on ALL posts, then filtered client side.
  // If we filter in SQL, we only get 50 matches. This is better for pagination later.
  // But for sidebar counts, we lose accuracy if we don't fetch counts separately.
  // For now, I will remove the counts from the sidebar or keep them as "from displayed" (which is confusing).
  // Or I can just continue to do client-side filtering if I fetch generic "all" first?
  // No, users expect search/filter to work on DB.

  // Let's assume for this step, we keep the main query flow but adapted for "Saved".
  // Note: The previous code fetched `posts` with limit 50, THEN filtered `filteredPosts`. 
  // This means if I was on "topic X", I might see 0 posts if the first 50 global posts didn't have X.
  // My new logic applies filter in SQL, so it finds matching posts.
  // But I need to adjust the variables for render.

  const filteredPosts = sortedPosts; // Since we filtered in SQL

  // Sidebar counts - these are now hard if we don't query for them.
  // I will temporarily remove the counts or set them to "?" or just remove the count bubbles to simplify and be correct.
  // The previous implementation was buggy anyway (counts were based on the LIMIT 50 set).

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
    <ForumScrollRestorationProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <AppHeader
          userRole={userRole}
          currentPage="forum"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Community Forum</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Share ideas, ask questions, and connect with the community
              </p>
            </div>
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="w-full sm:w-64">
                <SearchInput />
              </div>
              <Link
                href="/app/forum/new"
                className="whitespace-nowrap rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                New Post
              </Link>
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Feeds */}
                <div>
                  <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                    Feeds
                  </h3>
                  <nav className="space-y-1">
                    <Link
                      href="/app/forum"
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${topicFilter === "all"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                        }`}
                    >
                      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${topicFilter === "all" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      Home
                    </Link>
                    <Link
                      href="/app/forum?topic=saved"
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${topicFilter === "saved"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                        }`}
                    >
                      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${topicFilter === "saved" ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                      Saved Posts
                    </Link>
                  </nav>
                </div>

                {/* Topics */}
                <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                      Topics
                    </h3>
                    {topicFilter !== "all" && topicFilter !== "saved" && (
                      <Link
                        href="/app/forum"
                        className="text-[10px] font-bold uppercase text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Clear
                      </Link>
                    )}
                  </div>
                  <nav className="space-y-1">
                    {FORUM_TOPICS.map((topic) => {
                      const isSelected = topicFilter === topic.slug;
                      return (
                        <Link
                          key={topic.slug}
                          href={`/app/forum?topic=${topic.slug}`}
                          className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSelected
                            ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                            }`}
                        >
                          <span className="break-words">{topic.label}</span>
                        </Link>
                      );
                    })}

                    <Link
                      href="/app/forum?topic=uncategorized"
                      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${topicFilter === "uncategorized"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                        }`}
                    >
                      <span>Uncategorized</span>
                    </Link>
                  </nav>
                </div>
              </div>
            </aside>

            <main>
              {filteredPosts.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    {sortedPosts.length === 0
                      ? "No posts yet. Be the first to share!"
                      : "No posts in this topic yet. Start the conversation."}
                  </p>
                  <Link
                    href="/app/forum/new"
                    className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    Create Post
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
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
                        className={`rounded-xl border bg-white shadow-sm dark:bg-zinc-950 ${post.is_pinned
                          ? "border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10"
                          : "border-zinc-200 dark:border-zinc-800"
                          }`}
                      >
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <Link
                                href={`/app/profile/${post.author_id}`}
                                className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                              >
                                {post.profiles?.avatar_url ? (
                                  <img
                                    src={post.profiles.avatar_url}
                                    alt={authorName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                    {authorInitials}
                                  </div>
                                )}
                              </Link>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/app/profile/${post.author_id}`}
                                    className="font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                                  >
                                    {authorName}
                                  </Link>
                                  <span className="text-zinc-300 dark:text-zinc-700">
                                    •
                                  </span>
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {formatTimeAgo(post.created_at)}
                                  </span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  {post.topic && (
                                    <Link
                                      href={`/app/forum?topic=${post.topic}`}
                                      className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                                    >
                                      {topicLabelMap[post.topic] || post.topic}
                                    </Link>
                                  )}
                                  {post.is_pinned && (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                      Pinned
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Content & Thumbnail */}
                          <div className="mt-3 flex gap-3 sm:gap-4">
                            <div className="flex-1 space-y-3">
                              <ForumPostLink postId={post.id} className="group block">
                                <h2 className="text-lg font-bold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-300">
                                  {post.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-3 dark:text-zinc-400">
                                  {post.content}
                                </p>
                              </ForumPostLink>

                              {/* Tags */}
                              {post.forum_post_tags && post.forum_post_tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {post.forum_post_tags.map((tagObj, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs text-blue-600 dark:text-blue-400"
                                    >
                                      #{tagObj.tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Thumbnail (Right Side) */}
                            {post.image_urls && post.image_urls.length > 0 && (
                              <ForumPostLink postId={post.id} className="shrink-0 pt-1">
                                <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                  <img
                                    src={post.image_urls[0]}
                                    alt="Post thumbnail"
                                    className="h-full w-full object-cover"
                                  />
                                  {post.image_urls.length > 1 && (
                                    <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                      <span>+{post.image_urls.length - 1}</span>
                                    </div>
                                  )}
                                </div>
                              </ForumPostLink>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                            <div className="flex items-center rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
                              <VoteButton
                                postId={post.id}
                                voteType="upvote"
                                isActive={post.user_vote?.vote_type === "upvote"}
                                className="p-1 hover:text-green-600"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v8a2 2 0 0 0 2 2h6a3 3 0 0 0 2.96-2.46l1.1-6A2 2 0 0 0 17.1 10H14l.72-3.6a2 2 0 0 0-3.7-1.24L7 11Z" /><path d="M7 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></svg>
                              </VoteButton>
                              <span className="min-w-[1.5rem] text-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {post.upvotes - post.downvotes}
                              </span>
                              <VoteButton
                                postId={post.id}
                                voteType="downvote"
                                isActive={post.user_vote?.vote_type === "downvote"}
                                className="p-1 hover:text-red-600"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 13V5a2 2 0 0 0-2-2H9A3 3 0 0 0 6.04 5.46l-1.1 6A2 2 0 0 0 6.9 14H10l-.72 3.6a2 2 0 0 0 3.7 1.24L17 13Z" /><path d="M17 13h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" /></svg>
                              </VoteButton>
                            </div>

                            <Link
                              href={`/app/forum/${post.id}#comments`}
                              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                              <span>{post.comment_count} Comments</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </ForumScrollRestorationProvider>
  );
}
