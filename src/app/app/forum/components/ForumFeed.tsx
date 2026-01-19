"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { VoteButton } from "./VoteButton";
import { SaveButton } from "./SaveButton";
import { ForumPostLink } from "@/components/ScrollSavingLink";
import { ForumPost } from "../types";
import { FORUM_TOPICS } from "../topics";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as any,
        },
    },
};

const topicLabelMap = FORUM_TOPICS.reduce<Record<string, string>>((acc, topic) => {
    acc[topic.slug] = topic.label;
    return acc;
}, {});

const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

interface ForumFeedProps {
    posts: ForumPost[];
    topicFilter?: string;
}

export default function ForumFeed({ posts, topicFilter }: ForumFeedProps) {
    if (posts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50"
            >
                <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">No posts just yet</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
                    Be the first to spark a conversation in this community. Share your thoughts, questions, or deals!
                </p>
                <Link
                    href="/app/forum/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
                >
                    <span>Start Discussion</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {posts.map((post) => {
                const authorName = post.profiles?.display_name || "Anonymous";
                const authorInitials = authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                const score = post.upvotes - post.downvotes;

                return (
                    <motion.div
                        key={post.id}
                        variants={itemVariants}
                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${post.is_pinned
                            ? "border-blue-500/30 bg-blue-50/10 dark:bg-blue-900/5 shadow-md shadow-blue-500/5"
                            : "border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/40 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                    >


                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2 text-xs">
                                {post.topic && (
                                    <Link
                                        href={`/app/forum?topic=${post.topic}`}
                                        className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-bold text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                    >
                                        {/* Optional icon based on topic could go here */}
                                        {topicLabelMap[post.topic] || post.topic}
                                    </Link>
                                )}
                                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                <span className="text-zinc-500 dark:text-zinc-400">Posted by</span>
                                <Link href={`/app/profile/${post.author_id}`} className="font-semibold text-zinc-900 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-blue-400">
                                    {authorName}
                                </Link>
                                <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                <span className="text-zinc-500 dark:text-zinc-400">{formatTimeAgo(post.created_at)}</span>
                                {post.is_pinned && (
                                    <span className="ml-auto flex items-center gap-1 text-green-600 dark:text-green-400 font-bold uppercase tracking-wider text-[10px]">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                                        Pinned
                                    </span>
                                )}
                            </div>

                            {/* Title & Content */}
                            <div className="flex gap-4">
                                <div className="flex-1 min-w-0">
                                    <ForumPostLink postId={post.id}>
                                        <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 leading-snug">
                                            {post.title}
                                        </h2>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                                            {post.content}
                                        </div>
                                    </ForumPostLink>

                                    {/* Tags */}
                                    {post.forum_post_tags && post.forum_post_tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {post.forum_post_tags.map((tagObj, idx) => (
                                                <span key={idx} className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                                    #{tagObj.tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail */}
                                {post.image_urls && post.image_urls.length > 0 && (
                                    <ForumPostLink postId={post.id} className="shrink-0">
                                        <div className="relative h-24 w-32 md:h-28 md:w-40 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                            <img
                                                src={post.image_urls[0]}
                                                alt="Post thumbnail"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {post.image_urls.length > 1 && (
                                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    +{post.image_urls.length - 1}
                                                </div>
                                            )}
                                        </div>
                                    </ForumPostLink>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="mt-4 flex flex-wrap items-center gap-x-1 sm:gap-x-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                {/* Votes */}
                                <div className="flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1 mr-2">
                                    <VoteButton postId={post.id} voteType="upvote" isActive={post.user_vote?.vote_type === "upvote"} className="p-1 hover:text-orange-500 rounded"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg></VoteButton>
                                    <span className={`min-w-[1.5rem] text-center ${post.user_vote?.vote_type === "upvote" ? "text-orange-500" : post.user_vote?.vote_type === "downvote" ? "text-blue-500" : ""}`}>{score}</span>
                                    <VoteButton postId={post.id} voteType="downvote" isActive={post.user_vote?.vote_type === "downvote"} className="p-1 hover:text-blue-500 rounded"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg></VoteButton>
                                </div>

                                <Link
                                    href={`/app/forum/${post.id}#comments`}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <span>{post.comment_count} Comments</span>
                                </Link>



                                <SaveButton
                                    postId={post.id}
                                    isSaved={!!post.is_saved}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
