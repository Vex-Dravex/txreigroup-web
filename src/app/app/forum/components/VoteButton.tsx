"use client";

import { voteOnPost } from "../actions";

type VoteButtonProps = {
  postId: string;
  voteType: "upvote" | "downvote";
  isActive: boolean;
  children: React.ReactNode;
};

export function VoteButton({ postId, voteType, isActive, children }: VoteButtonProps) {
  const handleVote = async () => {
    await voteOnPost(postId, voteType);
    window.location.reload();
  };

  return (
    <button
      onClick={handleVote}
      className={`text-2xl transition-colors ${
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

