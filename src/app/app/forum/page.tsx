import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { SearchInput } from "./components/SearchInput";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";
import { ForumPost } from "./types";
import ForumFeed from "./components/ForumFeed";
import { ForumLeftSidebar } from "./components/ForumLeftSidebar";
import { ForumRightSidebar } from "./components/ForumRightSidebar";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
    .order(topicFilter === 'popular' ? "upvotes" : "created_at", { ascending: false })
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
    if (savedPostIds && savedPostIds.length > 0) {
      query = query.in("id", savedPostIds);
    } else {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
  } else if (topicFilter !== "all" && topicFilter !== "uncategorized" && topicFilter !== "popular") {
    // "popular" is just a sort filter, not a topic filter, but we treat "all" as no filter.
    query = query.eq("topic", topicFilter);
  } else if (topicFilter === "uncategorized") {
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
    .select("post_id, vote_type")
    .eq("user_id", authData.user.id);

  // Fetch user's saved posts
  const { data: userSaves } = await supabase
    .from("forum_saved_posts")
    .select("post_id")
    .eq("user_id", authData.user.id);

  const votesMap = new Map((userVotes || []).map((v) => [v.post_id, v.vote_type]));
  const savesSet = new Set((userSaves || []).map((s) => s.post_id));

  // Calculate score for sorting (hot algorithm)
  const postsData = (posts as unknown as ForumPost[]) || [];
  const now = Date.now();
  const postsWithVotes = postsData.map((post) => ({
    ...post,
    ...post,
    user_vote: votesMap.get(post.id) ? { vote_type: votesMap.get(post.id) } : null,
    is_saved: savesSet.has(post.id),
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

    if (topicFilter === 'popular') {
      // Sort by most interaction: (upvotes + comment_count)
      return (b.upvotes + b.comment_count) - (a.upvotes + a.comment_count);
    }

    return scoreB - scoreA;
  });

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
                <ForumLeftSidebar topicFilter={topicFilter} />
              </div>
            </aside>

            {/* Center - Feed */}
            <main className="lg:col-span-9 xl:col-span-7">
              <div className="mb-8 flex flex-col gap-4">
                {/* Mobile Header stuff only shows on small screens if needed, but AppHeader covers it. 
                            We keep SearchInput prominent as per design. 
                        */}
                <div className="sticky top-20 z-30 -mx-4 bg-zinc-50/95 px-4 py-3 backdrop-blur-md dark:bg-black/95 sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <SearchInput />
                    </div>
                    <div className="lg:hidden">
                      {/* Mobile Menu Trigger could go here if we built a drawer, but relying on AppHeader for now */}
                    </div>
                  </div>
                </div>

                {/* Create Post Input Trigger (Reddit Style) */}
                <div className="hidden sm:flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    {profileData?.avatar_url ? (
                      <img src={profileData.avatar_url} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                        {profileData?.display_name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <a href="/app/forum/new" className="flex-1 rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors text-left">
                    Create a post...
                  </a>
                  <a href="/app/forum/new" className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </a>
                </div>
              </div>

              <ForumFeed posts={sortedPosts} topicFilter={topicFilter} key={topicFilter} />
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
