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

  const activeClass = voteType === "upvote" ? "text-sky-600" : "text-rose-500";
  const hoverClass = voteType === "upvote" ? "hover:text-sky-600" : "hover:text-rose-500";

  return (
    <button
      onClick={handleVote}
      className={`text-lg transition-colors ${
        isActive ? activeClass : `text-zinc-400 ${hoverClass}`
      }`}
    >
      {children}
    </button>
  );
}
