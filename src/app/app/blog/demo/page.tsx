
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import BlogCenterClient from "../BlogCenterClient";

export const dynamic = 'force-dynamic';

export default async function BlogDemoPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

    // Fetch profile for header
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
    const role = getPrimaryRole(roles, profile?.role || "investor");
    const displayName = profile?.display_name || authData.user.email?.split("@")[0] || "User";

    // Fetch posts
    const { data: dbPosts } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:author_id(display_name, avatar_url)
        `)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    // Fallback to demo data if DB is empty or just merge them
    const { blogDemoPostsList } = await import("../blogDemoData");
    const posts = [...(dbPosts || []), ...blogDemoPostsList];

    return (
        <div className="relative min-h-screen bg-zinc-950 selection:bg-purple-500/30 overflow-hidden">
            <div className="noise-overlay opacity-20" />

            {/* Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <AppHeader
                userRole={role}
                currentPage="blog"
                avatarUrl={profile?.avatar_url}
                displayName={displayName}
                email={authData.user.email}
            />

            <BlogCenterClient posts={posts || []} isDemo={true} />
        </div>
    );
}
