"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import BlogTutorial from "./BlogTutorial";

interface BlogCenterClientProps {
    posts: any[];
    isDemo?: boolean;
}

export default function BlogCenterClient({ posts, isDemo = false }: BlogCenterClientProps) {
    const featuredPost = posts?.[0];
    const previousPosts = posts?.slice(1) || [];

    return (
        <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Community Blog
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-7xl">
                        Investor <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Insights</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-zinc-400">
                        Updates, strategies, and success stories from the HTX Community.
                    </p>
                </div>
            </div>

            {featuredPost ? (
                <section className="mb-20" id="blog-featured-post">
                    <Link
                        href={`/app/blog/${featuredPost.slug}${isDemo ? '?demo=true' : ''}`}
                        className="group relative block overflow-hidden rounded-[2.5rem] bg-white/5 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-500"
                    >
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                            {featuredPost.featured_image_url ? (
                                <Image
                                    src={featuredPost.featured_image_url}
                                    alt={featuredPost.title}
                                    fill
                                    className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-purple-900/40 to-black" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                        </div>

                        <div className="relative flex min-h-[550px] flex-col justify-end p-8 md:p-12 lg:p-16">
                            <div className="space-y-6 max-w-4xl">
                                <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-300 backdrop-blur-md border border-purple-500/20">
                                        Featured Story
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-white/30" />
                                    <span>
                                        {new Date(featuredPost.published_at).toLocaleDateString(undefined, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                <h2 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl transition-colors group-hover:text-purple-400">
                                    {featuredPost.title}
                                </h2>

                                <p className="line-clamp-2 text-lg text-zinc-300 md:text-xl font-medium max-w-2xl leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="flex items-center gap-4 pt-4">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/10">
                                        {featuredPost.author?.avatar_url ? (
                                            <Image
                                                src={featuredPost.author.avatar_url}
                                                alt={featuredPost.author.display_name || "Author"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                                                {featuredPost.author?.display_name?.[0] || "A"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-white">
                                            {featuredPost.author?.display_name || "Unknown Author"}
                                        </div>
                                        <div className="text-sm font-medium text-zinc-500">
                                            Author
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            ) : (
                <div className="rounded-[2.5rem] border border-dashed border-white/10 p-20 text-center bg-white/5">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                        <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">No posts yet</h3>
                    <p className="mt-2 text-zinc-500">This blog is fresh! Check back soon for new stories.</p>
                </div>
            )}

            {previousPosts.length > 0 && (
                <section id="blog-recent-stories">
                    <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-6">
                        <h3 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                            Recent Stories
                        </h3>
                    </div>

                    <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                        {previousPosts.map((post) => (
                            <Link key={post.id} href={`/app/blog/${post.slug}${isDemo ? '?demo=true' : ''}`} className="group flex flex-col gap-4">
                                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5 shadow-sm transition-all group-hover:shadow-xl border border-white/10 group-hover:border-purple-500/30">
                                    {post.featured_image_url ? (
                                        <Image
                                            src={post.featured_image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                                            <svg className="h-12 w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-purple-900/10" />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                                        <span className="text-purple-400">Article</span>
                                        <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                        <span>
                                            {new Date(post.published_at).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-black leading-tight text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>

                                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                                            {post.author?.avatar_url ? (
                                                <Image
                                                    src={post.author.avatar_url}
                                                    alt={post.author.display_name || "Author"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-zinc-500">
                                                    {post.author?.display_name?.[0] || "A"}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-zinc-300">
                                            {post.author?.display_name || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
            {isDemo && <BlogTutorial />}
        </main>
    );
}
