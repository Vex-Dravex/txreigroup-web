import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import BlogDetailTutorial from "./BlogDetailTutorial";

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ demo?: string }>
}) {
    const { slug } = await params;
    const { demo } = await searchParams;
    const isDemo = demo === "true";

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

    // Fetch post
    let post: any = null;
    const { data: dbPost } = await supabase
        .from("blog_posts")
        .select(`
            *,
            author:author_id(display_name, avatar_url, bio)
        `)
        .eq("slug", slug)
        .maybeSingle();

    if (dbPost) {
        post = dbPost;
    } else {
        // Fallback to demo data
        const { blogDemoPosts } = await import("../blogDemoData");
        post = blogDemoPosts[slug];
    }

    if (!post) notFound();

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

            <main className="relative pb-24">
                {/* Hero Section */}
                <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-zinc-900">
                    {post.featured_image_url ? (
                        <div className="absolute inset-0">
                            <Image
                                src={post.featured_image_url}
                                alt={post.title}
                                fill
                                className="object-cover opacity-80"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-zinc-900 opacity-50" />
                    )}

                    <div className="absolute inset-0 flex items-end">
                        <div className="mx-auto w-full max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
                            <Link
                                href="/app/blog"
                                className="mb-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-black/50 hover:text-white"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Blog
                            </Link>

                            <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                {post.title}
                            </h1>

                            <div className="flex items-center gap-4" id="blog-post-header">
                                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/20">
                                    {post.author?.avatar_url ? (
                                        <Image
                                            src={post.author.avatar_url}
                                            alt={post.author.display_name || "Author"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                                            {post.author?.display_name?.[0] || "A"}
                                        </div>
                                    )}
                                </div>
                                <div className="text-white">
                                    <div className="font-bold">
                                        {post.author?.display_name || "Unknown Author"}
                                    </div>
                                    <div className="text-sm text-zinc-300 font-medium">
                                        {format(new Date(post.published_at), "MMMM d, yyyy")} • {Math.ceil(post.content.split(' ').length / 200)} min read
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8" id="blog-post-content">
                    {/* Introduction / Lead Paragraph Highlight */}
                    <div className="prose prose-lg prose-zinc dark:prose-invert max-w-none first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-bold first-letter:text-zinc-900 first-letter:dark:text-white">
                        <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-300">
                            {post.content}
                        </div>
                    </div>
                </article>

                {/* Author Bio Footer */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-zinc-50 p-8 dark:bg-zinc-900/50">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">About the Author</h3>
                        <div className="flex gap-6">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                {post.author?.avatar_url ? (
                                    <Image
                                        src={post.author.avatar_url}
                                        alt={post.author.display_name || "Author"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-zinc-500">
                                        {post.author?.display_name?.[0] || "A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {post.author?.display_name}
                                </h4>
                                {post.author?.bio && (
                                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                        {post.author.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>
            <BlogDetailTutorial />
        </div>
    );
}
