import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import type { Role } from "@/lib/roles";
import Link from "next/link";
import AppHeader from "./app/components/AppHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is authenticated (but don't redirect - homepage is public)
  let isAuthenticated = false;
  let userProfile: { avatar_url: string | null; display_name: string | null; email: string | null } | null = null;
  let userRole: Role = "investor";
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      isAuthenticated = true;
      // Fetch profile for authenticated users
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, role")
        .eq("id", authData.user.id)
        .single();

      const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
      
      userProfile = {
        avatar_url: profile?.avatar_url || null,
        display_name: profile?.display_name || null,
        email: authData.user.email || null,
      };

      userRole = getPrimaryRole(roles, profile?.role || "investor");
    }
  } catch (error) {
    // If auth check fails, user is not authenticated
    console.error("Auth check failed:", error);
  }

  // Fetch homepage content (public, no auth required)
  let upcomingLivestreams: any[] = [];
  let latestBlogPosts: any[] = [];
  let communityUpdates: any[] = [];

  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch upcoming livestreams (next 3)
    const { data: livestreams } = await supabase
      .from("livestreams")
      .select("*")
      .eq("is_upcoming", true)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(3);
    
    upcomingLivestreams = livestreams || [];

    // Fetch latest published blog posts (3 most recent)
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3);
    
    latestBlogPosts = blogPosts || [];

    // Fetch latest community updates (5 most recent, prioritize featured)
    const { data: updates } = await supabase
      .from("community_updates")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);
    
    communityUpdates = updates || [];
  } catch (error) {
    // If fetching fails, just show empty sections
    console.error("Error fetching homepage content:", error);
  }

  // Show landing page for unauthenticated users
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <AppHeader
        userRole={isAuthenticated ? userRole : "investor"}
        currentPage="home"
        avatarUrl={userProfile?.avatar_url || null}
        displayName={userProfile?.display_name || null}
        email={userProfile?.email || null}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              Texas Real Estate
              <br />
              Investor Community
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Connect with investors, access exclusive wholesale deals, find trusted contractors, and
              grow your real estate investment portfolio.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-zinc-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-50"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Livestreams Section */}
          {upcomingLivestreams.length > 0 && (
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Upcoming Livestreams</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingLivestreams.map((stream) => (
                  <div
                    key={stream.id}
                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {stream.thumbnail_url && (
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      {stream.title}
                    </h4>
                    {stream.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {stream.description}
                      </p>
                    )}
                    <div className="text-sm text-zinc-500 dark:text-zinc-500">
                      {new Date(stream.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    {stream.stream_url && (
                      <a
                        href={stream.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                      >
                        Watch Live
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Blog Posts Section */}
          {latestBlogPosts.length > 0 && (
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Latest Blog Posts</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestBlogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                      {post.title}
                    </h4>
                    {post.excerpt && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {post.published_at &&
                        new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Community Updates Section */}
          {communityUpdates.length > 0 && (
            <div className="mt-24">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Community Updates</h3>
              <div className="space-y-4">
                {communityUpdates.map((update) => (
                  <div
                    key={update.id}
                    className={`rounded-lg border p-6 shadow-sm ${
                      update.is_featured
                        ? "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {update.title}
                          </h4>
                          {update.is_featured && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Featured
                            </span>
                          )}
                        </div>
                        {update.content && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            {update.content}
                          </p>
                        )}
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {new Date(update.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="mx-auto mt-24 max-w-2xl sm:mt-32 lg:mt-40 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-50">
                  Off Market MLS
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  <p className="flex-auto">
                    Access exclusive off-market wholesale deals vetted by our team. Only approved
                    deals are visible to verified investors.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-50">
                  Vendor Marketplace
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  <p className="flex-auto">
                    Find verified vendors for your investment projects. Connect directly with
                    trusted professionals in your area.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-50">
                  Education Center
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  <p className="flex-auto">
                    Learn real estate investing strategies through our comprehensive course library.
                    Track your progress and advance your skills.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} TXREIGROUP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
