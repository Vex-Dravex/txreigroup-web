import { createSupabaseServerClient } from "@/lib/supabase/server";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

export default async function PostComments({ postId }: { postId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  // Fetch comments
  const { data: comments } = await supabase
    .from("forum_comments")
    .select(`
      *,
      profiles:author_id (
        display_name,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: true });

  // Fetch user's votes on comments
  let votesMap = new Map<string, string>();
  if (authData.user && comments && comments.length > 0) {
    const { data: userVotes } = await supabase
      .from("forum_comment_votes")
      .select("comment_id, vote_type")
      .eq("user_id", authData.user.id);

    votesMap = new Map((userVotes || []).map((v) => [v.comment_id, v.vote_type]));
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        Comments {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      {authData.user && <CommentForm postId={postId} />}

      <div className="mt-6">
        {comments && comments.length > 0 ? (
          <CommentList comments={comments} votesMap={votesMap} currentUserId={authData.user?.id} />
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}

