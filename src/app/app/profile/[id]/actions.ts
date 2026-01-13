"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requestNetwork(targetUserId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  if (authData.user.id === targetUserId) {
    throw new Error("Cannot request your own network");
  }

  const { data: existing } = await supabase
    .from("network_requests")
    .select("id, status")
    .eq("requester_id", authData.user.id)
    .eq("requestee_id", targetUserId)
    .single();

  if (existing?.status === "accepted") {
    return;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("network_requests")
      .update({ status: "pending", responded_at: null })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Failed to update network request: ${updateError.message}`);
    }
  } else {
    const { error: insertError } = await supabase.from("network_requests").insert({
      requester_id: authData.user.id,
      requestee_id: targetUserId,
      status: "pending",
    });

    if (insertError) {
      throw new Error(`Failed to send network request: ${insertError.message}`);
    }
  }

  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: targetUserId,
    type: "network_request",
    title: "New Network Request",
    message: "You received a new network request. Review it on your profile page.",
    related_deal_id: null,
    metadata: {
      requester_id: authData.user.id,
    },
  });

  if (notificationError) {
    throw new Error(`Failed to create network request notification: ${notificationError.message}`);
  }

  revalidatePath(`/app/profile/${targetUserId}`);
}

export async function respondNetworkRequest(requestId: string, action: "accepted" | "declined") {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: request } = await supabase
    .from("network_requests")
    .select("id, requestee_id, requester_id")
    .eq("id", requestId)
    .single();

  if (!request || request.requestee_id !== authData.user.id) {
    throw new Error("Not authorized to respond to this request");
  }

  const { error } = await supabase
    .from("network_requests")
    .update({ status: action, responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw new Error(`Failed to respond to request: ${error.message}`);
  }

  if (action === "accepted") {
    const { error: notifyError } = await supabase.from("notifications").insert({
      user_id: request.requester_id,
      type: "network_accepted",
      title: "Network Request Accepted",
      message: "Your network request was accepted. You are now connected.",
      related_deal_id: null,
      metadata: {
        requestee_id: authData.user.id,
      },
    });

    if (notifyError) {
      throw new Error(`Failed to create acceptance notification: ${notifyError.message}`);
    }
  }

  revalidatePath(`/app/profile/${authData.user.id}`);
  revalidatePath(`/app/profile/${request.requester_id}`);
}

export async function createPortfolioItem(profileId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user || authData.user.id !== profileId) {
    throw new Error("Unauthorized");
  }

  const category = String(formData.get("category") || "");
  const imageUrl = String(formData.get("imageUrl") || "");
  const caption = String(formData.get("caption") || "");

  if (!category || !imageUrl) {
    throw new Error("Category and image URL are required");
  }

  const { error } = await supabase.from("user_portfolio_items").insert({
    user_id: profileId,
    category,
    image_url: imageUrl,
    caption: caption || null,
  });

  if (error) {
    throw new Error(`Failed to add portfolio item: ${error.message}`);
  }

  revalidatePath(`/app/profile/${profileId}`);
}

export async function createReview(reviewedUserId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const comment = String(formData.get("comment") || "").trim();
  const ratingStr = String(formData.get("rating") || "");
  const rating = parseInt(ratingStr, 10);

  if (!comment) {
    throw new Error("Comment is required");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Please select a star rating between 1 and 5");
  }

  const { error } = await supabase.from("user_reviews").insert({
    reviewer_id: authData.user.id,
    reviewed_user_id: reviewedUserId,
    comment,
    rating,
  });

  if (error) {
    throw new Error(`Failed to add review: ${error.message}`);
  }

  revalidatePath(`/app/profile/${reviewedUserId}`);
}

export async function updateProfile(profileId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user || authData.user.id !== profileId) {
    throw new Error("Unauthorized");
  }

  const avatarUrl = String(formData.get("avatarUrl") || "").trim();
  const bannerUrl = String(formData.get("bannerUrl") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  const avatarFile = formData.get("avatarFile");
  const bannerFile = formData.get("bannerFile");

  const updatePayload: Record<string, string | null> = {};

  const uploadFile = async (file: File, folder: string) => {
    const arrayBuffer = await file.arrayBuffer();
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${folder}/${profileId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("forum-media")
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("forum-media").getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (avatarFile instanceof File && avatarFile.size > 0) {
    updatePayload.avatar_url = await uploadFile(avatarFile, "profiles/avatars");
  } else if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl;
  }

  if (bannerFile instanceof File && bannerFile.size > 0) {
    updatePayload.banner_url = await uploadFile(bannerFile, "profiles/banners");
  } else if (bannerUrl) {
    updatePayload.banner_url = bannerUrl;
  }

  if (formData.has("bio")) {
    updatePayload.bio = bio || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profileId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  revalidatePath(`/app/profile/${profileId}`);
}
