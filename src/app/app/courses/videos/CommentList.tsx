"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CommentForm from "./CommentForm";

export type VideoComment = {
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    parent_comment_id: string | null;
    profiles: { display_name: string | null; avatar_url: string | null } | null;
};

type CommentNode = VideoComment & { children: CommentNode[] };

function CommentItem({
    comment,
    videoId,
    userAvatarUrl,
    userDisplayName,
}: {
    comment: CommentNode;
    videoId: string;
    userAvatarUrl: string | null;
    userDisplayName: string | null;
}) {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 group">
                <Link
                    href={`/app/profile/${comment.author_id}`}
                    className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 ring-2 ring-white dark:ring-zinc-900 transition-transform hover:scale-105"
                >
                    {comment.profiles?.avatar_url ? (
                        <img
                            src={comment.profiles.avatar_url}
                            alt={comment.profiles.display_name || "User"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-black text-zinc-600 dark:text-zinc-300">
                            {comment.profiles?.display_name
                                ? comment.profiles.display_name[0].toUpperCase()
                                : "U"}
                        </div>
                    )}
                </Link>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/app/profile/${comment.author_id}`}
                            className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                        >
                            {comment.profiles?.display_name || "Member"}
                        </Link>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                            })}
                        </span>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {comment.body}
                    </p>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            Reply
                        </button>
                    </div>

                    {isReplying && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <CommentForm
                                videoId={videoId}
                                userAvatarUrl={userAvatarUrl}
                                userDisplayName={userDisplayName}
                                parentCommentId={comment.id}
                                onSuccess={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.children.length > 0 && (
                <div className="pl-6 ml-5 border-l-2 border-zinc-100 dark:border-zinc-800/50 space-y-6">
                    {comment.children.map((child) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            videoId={videoId}
                            userAvatarUrl={userAvatarUrl}
                            userDisplayName={userDisplayName}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentList({
    comments,
    videoId,
    userAvatarUrl,
    userDisplayName,
}: {
    comments: VideoComment[];
    videoId: string;
    userAvatarUrl: string | null;
    userDisplayName: string | null;
}) {
    const commentTree = useMemo(() => {
        const commentMap = new Map<string, CommentNode>();

        // First pass: create nodes
        // Sort by created_at ascending for replies usually, but input is typically descending.
        // Let's sort input by date ascending first so the tree is built logically (though map lookup handles out of order).
        // Actually, for display:
        // Top level: usually Newest First.
        // Replies: usually Oldest First (chronological).

        // Let's process comments.
        comments.forEach(c => {
            commentMap.set(c.id, { ...c, children: [] });
        });

        const roots: CommentNode[] = [];

        comments.forEach(c => {
            const node = commentMap.get(c.id)!;
            if (c.parent_comment_id) {
                const parent = commentMap.get(c.parent_comment_id);
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Orphaned comment or parent not loaded; treat as root? Or ignore.
                    // For safety, maybe push to roots if parent missing?
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        // Sort roots by date descending (Newest first)
        roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Sort children by date ascending (Oldest first) for conversation flow
        const sortChildren = (nodes: CommentNode[]) => {
            nodes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            nodes.forEach(n => sortChildren(n.children));
        };
        roots.forEach(r => sortChildren(r.children));

        return roots;

    }, [comments]);


    if (comments.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Be the first to share your thoughts
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {commentTree.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    videoId={videoId}
                    userAvatarUrl={userAvatarUrl}
                    userDisplayName={userDisplayName}
                />
            ))}
        </div>
    );
}
