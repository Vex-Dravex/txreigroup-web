"use client";

import { CommentVoteButton } from "../components/CommentVoteButton";
import { useState } from "react";
import CommentForm from "./CommentForm";

type Comment = {
  id: string;
  author_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  parent_comment_id: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type CommentListProps = {
  comments: Comment[];
  votesMap: Map<string, string>;
  currentUserId?: string;
  currentUserProfile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  postId?: string;
};

export default function CommentList({ comments, votesMap, currentUserId, currentUserProfile, postId }: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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

  const getReplies = (commentId: string) => {
    return comments.filter((c) => c.parent_comment_id === commentId);
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const authorName = comment.profiles?.display_name || "Anonymous";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const userVote = votesMap.get(comment.id);
    const score = (comment.upvotes || 0) - (comment.downvotes || 0);
    const replies = getReplies(comment.id);
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className={`group ${depth > 0 ? "mt-4 pl-4 sm:pl-8 border-l-2 border-zinc-100 dark:border-zinc-800" : ""}`}>
        <div className="flex gap-3 sm:gap-4">
          <a
            href={`/app/profile/${comment.author_id}`}
            className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            {comment.profiles?.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                {authorInitials}
              </div>
            )}
          </a>

          <div className="flex-1 min-w-0">
            <div className="rounded-2xl rounded-tl-none bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`/app/profile/${comment.author_id}`}
                    className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {authorName}
                  </a>
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
              </div>

              <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300">
                <p className="whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 pl-2">
              {/* Votes */}
              <div className="flex items-center gap-1">
                <CommentVoteButton
                  commentId={comment.id}
                  voteType="upvote"
                  isActive={userVote === "upvote"}
                  className="p-1 text-zinc-400 hover:text-orange-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                </CommentVoteButton>

                <span className={`text-xs font-bold min-w-[1.2rem] text-center ${userVote === 'upvote' ? 'text-orange-500' : userVote === 'downvote' ? 'text-blue-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {score}
                </span>

                <CommentVoteButton
                  commentId={comment.id}
                  voteType="downvote"
                  isActive={userVote === "downvote"}
                  className="p-1 text-zinc-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                </CommentVoteButton>
              </div>

              <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800"></div>

              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className={`text-xs font-bold transition-colors ${isReplying ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
              >
                Reply
              </button>
            </div>

            {isReplying && postId && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <CommentForm
                  postId={postId}
                  parentCommentId={comment.id}
                  userAvatarUrl={currentUserProfile?.avatar_url || null}
                  userDisplayName={currentUserProfile?.display_name || null}
                  onSuccess={() => setReplyingTo(null)}
                />
              </div>
            )}

            {/* Recursively render replies */}
            {replies.length > 0 && (
              <div className="mt-4">
                {replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <h3 className="text-zinc-900 dark:text-zinc-200 font-bold text-lg">No comments yet</h3>
        <p className="text-zinc-500 dark:text-zinc-400">Be the first to share your thoughts!</p>
      </div>
    )
  }

  // Filter for top-level comments to start rendering
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);

  return (
    <div className="space-y-8">
      {topLevelComments.map((comment) => renderComment(comment))}
    </div>
  );
}
