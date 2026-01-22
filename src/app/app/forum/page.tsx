import { redirect } from "next/navigation";
import AppHeader from "../components/AppHeader";
import { SearchInput } from "./components/SearchInput";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";
import { ForumPost } from "./types";
import ForumFeed from "./components/ForumFeed";
import { ForumLeftSidebar } from "./components/ForumLeftSidebar";
import { ForumRightSidebar } from "./components/ForumRightSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

// Define types for search parameters
interface ForumPageSearchParams {
  search?: string;
  topic?: string;
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams?: ForumPageSearchParams;
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
  const searchTerm = searchParams?.search || "";

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

  const topicFilter = searchParams?.topic || "all";

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
      // If no saved posts, return an empty set to prevent fetching all posts
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
  } else if (topicFilter !== "all" && topicFilter !== "uncategorized" && topicFilter !== "popular") {
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
    user_vote: votesMap.get(post.id) ? { vote_type: votesMap.get(post.id) } : null,
    is_saved: savesSet.has(post.id),
  }));

  const sortedPosts = postsWithVotes.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    const hoursA = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
    const hoursB = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
    const scoreA = (a.upvotes - a.downvotes) / Math.max(hoursA, 1);
    const scoreB = (b.upvotes - b.downvotes) / Math.max(hoursB, 1);

    if (topicFilter === 'popular') {
      return (b.upvotes + b.comment_count) - (a.upvotes + a.comment_count);
    }

    return scoreB - scoreA;
  });

  return (
    <ForumScrollRestorationProvider>
      <div className="relative min-h-screen bg-zinc-950 selection:bg-blue-500/30 overflow-hidden">
        <div className="noise-overlay opacity-20" />

        {/* Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <AppHeader
          userRole={userRole}
          currentPage="forum"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />

        <div
          className="relative z-10 mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8"
        >
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
                <div className="sticky top-20 z-30 -mx-4 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <SearchInput />
                    </div>
                  </div>
                </div>

                {/* Create Post Input Trigger (Reddit Style) */}
                <div
                  className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-sm hover:border-white/20 transition-all"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                    {profileData?.avatar_url ? (
                      <img src={profileData.avatar_url} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500">
                        {profileData?.display_name?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <a href="/app/forum/new" className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all text-left">
                    Share something with the community...
                  </a>
                  <a href="/app/forum/new" className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
