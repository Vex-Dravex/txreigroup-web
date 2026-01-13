"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRoles, hasRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const STORAGE_BUCKET = "education-videos";
const LEVELS = new Set(["Beginner", "Intermediate", "Advanced"]);

async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const roles = await getUserRoles(
    supabase,
    authData.user.id,
    profile?.role || "investor"
  );
  if (!hasRole(roles, "admin")) {
    throw new Error("Forbidden: Admin access required");
  }

  return authData.user.id;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export async function createEducationVideo(formData: FormData) {
  const adminId = await verifyAdmin();
  const supabase = await createSupabaseServerClient();

  const title = String(formData.get("title") || "").trim();
  const descriptionRaw = String(formData.get("description") || "").trim();
  const level = String(formData.get("level") || "Beginner");
  const topics = formData.getAll("topics").map((topic) => String(topic));
  const file = formData.get("file");
  const thumbnailFile = formData.get("thumbnail");

  if (!title) {
    throw new Error("Title is required");
  }
  if (!LEVELS.has(level)) {
    throw new Error("Invalid level");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Video file is required");
  }
  if (!file.type.startsWith("video/")) {
    throw new Error("File must be a video");
  }

  const fileName = sanitizeFileName(file.name || "video");
  const storagePath = `${adminId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Failed to upload video: ${uploadError.message}`);
  }

  const { data: publicUrl } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  let thumbnailStoragePath: string | null = null;
  let thumbnailUrl: string | null = null;

  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    if (!thumbnailFile.type.startsWith("image/")) {
      throw new Error("Thumbnail must be an image");
    }

    const thumbName = sanitizeFileName(thumbnailFile.name || "thumbnail");
    thumbnailStoragePath = `${adminId}/thumbs/${crypto.randomUUID()}-${thumbName}`;

    const { error: thumbUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(thumbnailStoragePath, thumbnailFile, {
        contentType: thumbnailFile.type,
      });

    if (thumbUploadError) {
      console.warn("Failed to upload thumbnail:", thumbUploadError);
      // Don't fail the whole request, just log it
    } else {
      const { data: thumbPublicUrl } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(thumbnailStoragePath);
      thumbnailUrl = thumbPublicUrl.publicUrl;
    }
  }

  const { error: insertError } = await supabase
    .from("education_videos")
    .insert({
      title,
      description: descriptionRaw || null,
      level,
      topics,
      video_url: publicUrl.publicUrl,
      storage_path: storagePath,
      thumbnail_url: thumbnailUrl,
      thumbnail_storage_path: thumbnailStoragePath,
      mime_type: file.type,
      file_size: file.size,
      created_by: adminId,
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    throw new Error(`Failed to save video: ${insertError.message}`);
  }

  revalidatePath("/app/admin/videos");
  revalidatePath("/app/courses");
  redirect("/app/admin/videos");
}

export async function updateEducationVideo(formData: FormData) {
  await verifyAdmin();
  const supabase = await createSupabaseServerClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const descriptionRaw = String(formData.get("description") || "").trim();
  const level = String(formData.get("level") || "Beginner");
  const topics = formData.getAll("topics").map((topic) => String(topic));
  const file = formData.get("file");

  if (!id) {
    throw new Error("Video id is required");
  }
  if (!title) {
    throw new Error("Title is required");
  }
  if (!LEVELS.has(level)) {
    throw new Error("Invalid level");
  }

  const { data: existing, error: existingError } = await supabase
    .from("education_videos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error("Video not found");
  }

  const updates: Record<string, unknown> = {
    title,
    description: descriptionRaw || null,
    level,
    topics,
    updated_at: new Date().toISOString(),
  };

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("video/")) {
      throw new Error("File must be a video");
    }

    const fileName = sanitizeFileName(file.name || "video");
    const storagePath = `${existing.storage_path.split("/")[0]}/${crypto.randomUUID()}-${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Failed to upload video: ${uploadError.message}`);
    }

    const { data: publicUrl } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    updates.video_url = publicUrl.publicUrl;
    updates.storage_path = storagePath;
    updates.mime_type = file.type;
    updates.file_size = file.size;

    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([existing.storage_path]);
  }

  const { error: updateError } = await supabase
    .from("education_videos")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    throw new Error(`Failed to update video: ${updateError.message}`);
  }

  revalidatePath("/app/admin/videos");
  revalidatePath(`/app/admin/videos/${id}`);
  revalidatePath("/app/courses");
  redirect("/app/admin/videos");
}

export async function deleteEducationVideo(formData: FormData) {
  await verifyAdmin();
  const supabase = await createSupabaseServerClient();

  const id = String(formData.get("id") || "");
  if (!id) {
    throw new Error("Video id is required");
  }

  const { data: existing, error: existingError } = await supabase
    .from("education_videos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    throw new Error("Video not found");
  }

  await supabase.storage.from(STORAGE_BUCKET).remove([existing.storage_path]);

  const { error: deleteError } = await supabase
    .from("education_videos")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(`Failed to delete video: ${deleteError.message}`);
  }

  revalidatePath("/app/admin/videos");
  revalidatePath("/app/courses");
}

export async function setEducationVideoPublished(formData: FormData) {
  await verifyAdmin();
  const supabase = await createSupabaseServerClient();

  const id = String(formData.get("id") || "");
  const publishValue = String(formData.get("publish") || "false");
  const shouldPublish = publishValue === "true";

  if (!id) {
    throw new Error("Video id is required");
  }

  const { error } = await supabase
    .from("education_videos")
    .update({
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update publish status: ${error.message}`);
  }

  revalidatePath("/app/admin/videos");
  revalidatePath("/app/courses");
}
