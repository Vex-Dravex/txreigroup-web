"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEducationComment(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const videoId = String(formData.get("videoId") || "");
  const body = String(formData.get("body") || "").trim();

  if (!videoId) {
    throw new Error("Video id is required");
  }
  if (!body) {
    throw new Error("Comment is required");
  }

  const { error } = await supabase.from("education_video_comments").insert({
    video_id: videoId,
    author_id: authData.user.id,
    body,
  });

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`);
  }

  revalidatePath(`/app/courses/videos/${videoId}`);
}

export async function addToWatchLater(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const videoId = String(formData.get("videoId") || "");
  if (!videoId) {
    throw new Error("Video id is required");
  }

  const { error } = await supabase.from("education_watch_later").upsert({
    user_id: authData.user.id,
    video_id: videoId,
  });

  if (error) {
    throw new Error(`Failed to save watch later: ${error.message}`);
  }

  revalidatePath(`/app/courses/videos/${videoId}`);
  revalidatePath("/app/courses/watch-later");
}

export async function removeFromWatchLater(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const videoId = String(formData.get("videoId") || "");
  if (!videoId) {
    throw new Error("Video id is required");
  }

  const { error } = await supabase
    .from("education_watch_later")
    .delete()
    .eq("user_id", authData.user.id)
    .eq("video_id", videoId);

  if (error) {
    throw new Error(`Failed to remove watch later: ${error.message}`);
  }

  revalidatePath(`/app/courses/videos/${videoId}`);
  revalidatePath("/app/courses/watch-later");
}
