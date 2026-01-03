"use client";

import { voteOnComment } from "../actions";

type CommentVoteButtonProps = {
  commentId: string;
  voteType: "upvote" | "downvote";
  isActive: boolean;
  children: React.ReactNode;
};

export function CommentVoteButton({ commentId, voteType, isActive, children }: CommentVoteButtonProps) {
  const handleVote = async () => {
    await voteOnComment(commentId, voteType);
    window.location.reload();
  };

  return (
    <button
      onClick={handleVote}
      className={`text-lg transition-colors ${
        isActive
          ? voteType === "upvote"
            ? "text-orange-500"
            : "text-blue-500"
          : "text-zinc-400 hover:text-orange-500"
      }`}
    >
      {children}
    </button>
  );
}

