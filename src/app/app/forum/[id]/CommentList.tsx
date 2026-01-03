"use client";

import { CommentVoteButton } from "../components/CommentVoteButton";

type Comment = {
  id: string;
  author_id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type CommentListProps = {
  comments: Comment[];
  votesMap: Map<string, string>;
  currentUserId?: string;
};

export default function CommentList({ comments, votesMap, currentUserId }: CommentListProps) {
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

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const score = comment.upvotes - comment.downvotes;
        const authorName = comment.profiles?.display_name || "Anonymous";
        const authorInitials = authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const userVote = votesMap.get(comment.id);

        return (
          <div
            key={comment.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex gap-4">
              {/* Voting */}
              {currentUserId && (
                <div className="flex flex-col items-center">
                  <CommentVoteButton
                    commentId={comment.id}
                    voteType="upvote"
                    isActive={userVote === "upvote"}
                  >
                    ▲
                  </CommentVoteButton>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 my-1">
                    {score}
                  </span>
                  <CommentVoteButton
                    commentId={comment.id}
                    voteType="downvote"
                    isActive={userVote === "downvote"}
                  >
                    ▼
                  </CommentVoteButton>
                </div>
              )}

              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={authorName}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {authorInitials}
                    </div>
                  )}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {authorName}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

