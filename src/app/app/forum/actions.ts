"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function verifyAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    redirect("/login");
  }
  
  return { supabase, userId: authData.user.id };
}

export async function createPost(formData: FormData) {
  const { supabase, userId } = await verifyAuth();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const topic = formData.get("topic") as string;
  const hashtagsJson = formData.get("hashtags") as string;
  const mentionsJson = formData.get("mentions") as string;
  const images = formData.getAll("images") as File[];

  // Parse hashtags and mentions
  const hashtags = hashtagsJson ? JSON.parse(hashtagsJson) : [];
  const mentions = mentionsJson ? JSON.parse(mentionsJson) : [];

  // Upload images to Supabase Storage
  const imageUrls: string[] = [];
  if (images.length > 0) {
    for (const image of images) {
      if (image.size > 0) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `forum-posts/${fileName}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await image.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("forum-media")
          .upload(filePath, arrayBuffer, {
            contentType: image.type,
            upsert: false,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from("forum-media").getPublicUrl(filePath);
          imageUrls.push(data.publicUrl);
        }
      }
    }
  }

  // Create post
  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .insert({
      author_id: userId,
      title,
      content,
      topic,
      image_urls: imageUrls,
    })
    .select()
    .single();

  if (postError) {
    throw new Error(`Failed to create post: ${postError.message}`);
  }

  // Create hashtags
  if (hashtags.length > 0) {
    const tagInserts = hashtags.map((tag: string) => ({
      post_id: post.id,
      tag: tag.toLowerCase(),
    }));

    await supabase.from("forum_post_tags").insert(tagInserts);
  }

  // Create mentions (need to find user IDs by username/email)
  if (mentions.length > 0) {
    // For now, we'll search by display_name or email
    // In a real app, you'd want a better user search
    const { data: mentionedUsers } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("display_name", mentions);

    if (mentionedUsers && mentionedUsers.length > 0) {
      const mentionInserts = mentionedUsers.map((user) => ({
        post_id: post.id,
        mentioned_user_id: user.id,
      }));

      await supabase.from("forum_post_mentions").insert(mentionInserts);
    }
  }

  revalidatePath("/app/forum");
  return { success: true, postId: post.id };
}

export async function voteOnPost(postId: string, voteType: "upvote" | "downvote") {
  const { supabase, userId } = await verifyAuth();

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("forum_post_votes")
    .select("vote_type")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same vote type
      await supabase
        .from("forum_post_votes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
    } else {
      // Update vote
      await supabase
        .from("forum_post_votes")
        .update({ vote_type: voteType })
        .eq("post_id", postId)
        .eq("user_id", userId);
    }
  } else {
    // Create new vote
    await supabase.from("forum_post_votes").insert({
      post_id: postId,
      user_id: userId,
      vote_type: voteType,
    });
  }

  revalidatePath("/app/forum");
  revalidatePath(`/app/forum/${postId}`);
}

export async function createComment(postId: string, content: string, parentCommentId?: string) {
  const { supabase, userId } = await verifyAuth();

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    author_id: userId,
    content,
    parent_comment_id: parentCommentId || null,
  });

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  revalidatePath(`/app/forum/${postId}`);
}

export async function voteOnComment(commentId: string, voteType: "upvote" | "downvote") {
  const { supabase, userId } = await verifyAuth();

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from("forum_comment_votes")
    .select("vote_type")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same vote type
      await supabase
        .from("forum_comment_votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId);
    } else {
      // Update vote
      await supabase
        .from("forum_comment_votes")
        .update({ vote_type: voteType })
        .eq("comment_id", commentId)
        .eq("user_id", userId);
    }
  } else {
    // Create new vote
    await supabase.from("forum_comment_votes").insert({
      comment_id: commentId,
      user_id: userId,
      vote_type: voteType,
    });
  }

  revalidatePath("/app/forum");
}
