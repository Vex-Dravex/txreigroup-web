"use client";

import { voteOnComment } from "../actions";

type CommentVoteButtonProps = {
  commentId: string;
  voteType: "upvote" | "downvote";
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
};

export function CommentVoteButton({ commentId, voteType, isActive, children, className = "" }: CommentVoteButtonProps) {
  const handleVote = async () => {
    await voteOnComment(commentId, voteType);
    window.location.reload();
  };

  const activeClass = voteType === "upvote" ? "text-sky-600" : "text-rose-500";
  const hoverClass = voteType === "upvote" ? "hover:text-sky-600" : "hover:text-rose-500";

  return (
    <button
      onClick={handleVote}
      className={`transition-colors ${isActive ? activeClass : `text-zinc-400 ${hoverClass}`
        } ${className}`}
    >
      {children}
    </button>
  );
}
