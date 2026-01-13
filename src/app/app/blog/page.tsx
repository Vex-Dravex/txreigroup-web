import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login");

    // Fetch profile for header
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
    const role = getPrimaryRole(roles, profile?.role || "investor");
    const isAdmin = hasRole(roles, "admin");

    const displayName = profile?.display_name || authData.user.email?.split("@")[0] || "User";

    // Fetch posts
    const { data: posts } = await supabase
        .from("blog_posts")
        .select(`
      *,
      author:author_id(display_name, avatar_url)
    `)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    const featuredPost = posts?.[0];
    const previousPosts = posts?.slice(1) || [];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <AppHeader
                userRole={role}
                currentPage="blog"
                avatarUrl={profile?.avatar_url}
                displayName={displayName}
                email={authData.user.email}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Investor Insights</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Weekly stories about investors, their projects, and their journey.
                        </p>
                    </div>
                    <Link
                        href="/app/admin/blog/new"
                        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                        Create Post
                    </Link>
                </div>

                {featuredPost ? (
                    <section className="mb-12">
                        <Link href={`/app/blog/${featuredPost.slug}`} className="group relative block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-zinc-950">
                            <div className="md:flex">
                                <div className="relative h-64 w-full md:h-auto md:w-1/2 lg:w-2/3">
                                    {featuredPost.featured_image_url ? (
                                        <Image
                                            src={featuredPost.featured_image_url}
                                            alt={featuredPost.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-400 dark:bg-zinc-800">
                                            <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center p-8 md:w-1/2 lg:w-1/3">
                                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                        Latest Story
                                    </div>
                                    <h2 className="mt-2 text-3xl font-bold text-zinc-900 group-hover:text-purple-600 dark:text-zinc-50 dark:group-hover:text-purple-400">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="mt-4 line-clamp-3 text-zinc-600 dark:text-zinc-400">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="mt-8 flex items-center gap-3">
                                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                            {featuredPost.author?.avatar_url ? (
                                                <Image
                                                    src={featuredPost.author.avatar_url}
                                                    alt={featuredPost.author.display_name || "Author"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-500">
                                                    {featuredPost.author?.display_name?.[0] || "A"}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                {featuredPost.author?.display_name || "Unknown Author"}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {new Date(featuredPost.published_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                ) : (
                    <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                        <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">No posts yet</h3>
                        <p className="mt-1 text-sm text-zinc-500">Get started by creating a new blog post.</p>
                    </div>
                )}

                {previousPosts.length > 0 && (
                    <section>
                        <h3 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Recent Stories</h3>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {previousPosts.map((post) => (
                                <Link key={post.id} href={`/app/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all hover:border-purple-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-purple-800/30">
                                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                                        {post.featured_image_url ? (
                                            <Image
                                                src={post.featured_image_url}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h4 className="mb-2 text-xl font-bold text-zinc-900 group-hover:text-purple-600 dark:text-zinc-50 dark:group-hover:text-purple-400">
                                            {post.title}
                                        </h4>
                                        <p className="mb-4 flex-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                {post.author?.avatar_url ? (
                                                    <Image
                                                        src={post.author.avatar_url}
                                                        alt={post.author.display_name || "Author"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-zinc-500">
                                                        {post.author?.display_name?.[0] || "A"}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-zinc-500">
                                                {new Date(post.published_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
