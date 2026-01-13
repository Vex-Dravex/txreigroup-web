"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleWatchLater(videoId: string, videoType: "course" | "education" | "sample") {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }


    // Check if already saved
    const { data: existing } = await supabase
        .from("watch_later_videos")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .eq("video_type", videoType)
        .single();

    if (existing) {
        // Remove from watch later
        const { error } = await supabase
            .from("watch_later_videos")
            .delete()
            .eq("user_id", user.id)
            .eq("video_id", videoId)
            .eq("video_type", videoType);

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/app/courses");
        return { success: true, saved: false };
    } else {
        // Add to watch later
        const { error } = await supabase
            .from("watch_later_videos")
            .insert({
                user_id: user.id,
                video_id: videoId,
                video_type: videoType,
            });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath("/app/courses");
        return { success: true, saved: true };
    }
}

export async function getWatchLaterVideos() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from("watch_later_videos")
        .select("video_id, video_type")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching watch later videos:", error);
        return [];
    }

    return data || [];
}
