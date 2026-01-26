import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import NewPostForm from "./NewPostForm";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { ForumLeftSidebar } from "../components/ForumLeftSidebar";
import { ForumRightSidebar } from "../components/ForumRightSidebar";
import { SearchInput } from "../components/SearchInput";
import { ForumScrollRestorationProvider } from "@/lib/scrollRestoration";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function NewPostPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

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
                <ForumLeftSidebar topicFilter="all" />
              </div>
            </aside>

            {/* Center - Form */}
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

              <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-8">
                <div className="mb-8 border-b border-zinc-100 pb-6 dark:border-zinc-800">
                  <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                    Create New Post
                  </h1>
                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    Share your thoughts, ask questions, or provide updates to the community.
                  </p>
                </div>

                <NewPostForm />
              </div>
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
