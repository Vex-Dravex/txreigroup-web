
import { redirect } from "next/navigation";
import AppHeader from "../../components/AppHeader";
import { SearchInput } from "../components/SearchInput";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";
import { ForumPost } from "../types";
import ForumFeed from "../components/ForumFeed";
import { ForumLeftSidebar } from "../components/ForumLeftSidebar";
import { ForumRightSidebar } from "../components/ForumRightSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { forumDemoPosts } from "../forumDemoData";
import ForumTutorial from "../ForumTutorial";

export const dynamic = 'force-dynamic';

export default async function ForumDemoPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();

    const profileData = profile as any;
    const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
    const userRole = getPrimaryRole(roles, profileData?.role || "investor");

    // Map demo posts to the ForumPost type
    const mappedDemoPosts: any[] = forumDemoPosts.map(post => ({
        ...post,
        updated_at: post.created_at,
        profiles: post.author,
        forum_post_tags: post.tags.map(tag => ({ tag })),
        user_vote: null,
        is_saved: false
    }));

    return (
        <ForumScrollRestorationProvider>
            <div className="relative min-h-screen bg-zinc-950 selection:bg-blue-500/30 overflow-hidden">
                <div className="noise-overlay opacity-20" />

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

                <div className="relative z-10 mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-8">
                        <aside className="hidden lg:col-span-3 lg:block xl:col-span-2">
                            <div className="sticky top-28 space-y-8">
                                <ForumLeftSidebar topicFilter="all" />
                            </div>
                        </aside>

                        <main className="lg:col-span-9 xl:col-span-7">
                            <div className="mb-8 flex flex-col gap-4">
                                <div className="sticky top-20 z-30 -mx-4 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <SearchInput />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    id="forum-create-post"
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
                                    <div className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-400 text-left">
                                        Share something with the community...
                                    </div>
                                </div>
                            </div>

                            <ForumFeed posts={mappedDemoPosts} topicFilter="all" />
                        </main>

                        <aside className="hidden xl:col-span-3 xl:block">
                            <div className="sticky top-28 space-y-6">
                                <ForumRightSidebar />
                            </div>
                        </aside>
                    </div>
                </div>
                <ForumTutorial />
            </div>
        </ForumScrollRestorationProvider>
    );
}
