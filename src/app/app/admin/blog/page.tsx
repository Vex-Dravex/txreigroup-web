import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login");

    // Check admin role
    const roles = await getUserRoles(supabase, authData.user.id, "investor"); // Default to investor to check
    if (!hasRole(roles, "admin")) {
        redirect("/app");
    }

    // Fetch posts
    const { data: posts } = await supabase
        .from("blog_posts")
        .select(`
      *,
      author:author_id(display_name, avatar_url)
    `)
        .order("created_at", { ascending: false });

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    const primaryRole = getPrimaryRole(roles, profile?.role || "investor");

    return (
        <div className="w-full">
            <AppHeader
                userRole={primaryRole}
                currentPage="admin"
                avatarUrl={profile?.avatar_url}
                displayName={profile?.display_name}
                email={authData.user.email}
            />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manage Blog Posts</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                            Create, edit, and manage your blog content.
                        </p>
                    </div>
                    <Link
                        href="/app/admin/blog/new"
                        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                    >
                        Write New Post
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Post</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900/50">
                            {posts?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500">
                                        No blog posts found. Click "Write New Post" to get started.
                                    </td>
                                </tr>
                            ) : (
                                posts?.map((post) => (
                                    <tr key={post.id}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                                                    {post.featured_image_url ? (
                                                        <Image
                                                            src={post.featured_image_url}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{post.title}</div>
                                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{post.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${post.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(post.published_at || post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Link to edit page (to be implemented if requested, effectively new page but with data) 
                                        For now just linking to the live post 
                                    */}
                                            <Link href={`/app/blog/${post.slug}`} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
