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
    <div className="space-y-6">
      {comments.map((comment) => {
        const authorName = comment.profiles?.display_name || "Anonymous";
        const authorInitials = authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        const userVote = votesMap.get(comment.id);

        return (
          <div key={comment.id} className="flex gap-4">
            <a
              href={`/app/profile/${comment.author_id}`}
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
            >
              {comment.profiles?.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-400">
                  {authorInitials}
                </div>
              )}
            </a>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <a
                  href={`/app/profile/${comment.author_id}`}
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  {authorName}
                </a>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatTimeAgo(comment.created_at)}
                </span>
              </div>

              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {comment.content}
              </p>

              <div className="flex items-center gap-2 pt-1">
                {/* Votes */}
                <div className="flex items-center gap-1">
                  <CommentVoteButton
                    commentId={comment.id}
                    voteType="upvote"
                    isActive={userVote === "upvote"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 11v8a2 2 0 0 0 2 2h6a3 3 0 0 0 2.96-2.46l1.1-6A2 2 0 0 0 17.1 10H14l.72-3.6a2 2 0 0 0-3.7-1.24L7 11Z" />
                      <path d="M7 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                    </svg>
                  </CommentVoteButton>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {comment.upvotes || 0}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <CommentVoteButton
                    commentId={comment.id}
                    voteType="downvote"
                    isActive={userVote === "downvote"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 13V5a2 2 0 0 0-2-2H9A3 3 0 0 0 6.04 5.46l-1.1 6A2 2 0 0 0 6.9 14H10l-.72 3.6a2 2 0 0 0 3.7 1.24L17 13Z" />
                      <path d="M17 13h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
                    </svg>
                  </CommentVoteButton>
                </div>

                {/* Reply Button (Placeholder for future) */}
                <button className="ml-2 rounded-full px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  Reply
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
