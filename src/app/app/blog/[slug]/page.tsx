import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login");

    // Fetch post
    const { data: post } = await supabase
        .from("blog_posts")
        .select(`
      *,
      author:author_id(display_name, avatar_url, bio)
    `)
        .eq("slug", slug)
        .single();

    if (!post) notFound();

    // Fetch profile for header
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
    const role = getPrimaryRole(roles, profile?.role || "investor");
    const displayName = profile?.display_name || authData.user.email?.split("@")[0] || "User";

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <AppHeader
                userRole={role}
                currentPage="blog"
                avatarUrl={profile?.avatar_url}
                displayName={displayName}
                email={authData.user.email}
            />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Link
                    href="/app/blog"
                    className="mb-8 inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                </Link>

                <article className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-zinc-950">
                    {post.featured_image_url && (
                        <div className="relative aspect-video w-full">
                            <Image
                                src={post.featured_image_url}
                                alt={post.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8 sm:p-12">
                        <h1 className="mb-6 text-3xl font-bold text-zinc-900 sm:text-4xl dark:text-zinc-50">
                            {post.title}
                        </h1>

                        <div className="mb-8 flex items-center gap-4 border-b border-zinc-100 pb-8 dark:border-zinc-800">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                {post.author?.avatar_url ? (
                                    <Image
                                        src={post.author.avatar_url}
                                        alt={post.author.display_name || "Author"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-medium text-zinc-500">
                                        {post.author?.display_name?.[0] || "A"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-zinc-900 dark:text-zinc-50">
                                    {post.author?.display_name || "Unknown Author"}
                                </div>
                                <div className="text-sm text-zinc-500">
                                    {new Date(post.published_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-zinc max-w-none dark:prose-invert">
                            <div className="whitespace-pre-wrap">
                                {post.content}
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
