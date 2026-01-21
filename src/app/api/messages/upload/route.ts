import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const conversationId = formData.get("conversationId") as string;
        const messageType = formData.get("messageType") as string;

        if (!file || !conversationId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify user is a participant
        const { data: participant } = await supabase
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!participant) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Upload file to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const bucket = messageType === "image" ? "message-images" : "message-videos";

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        // Create message
        const { data: message, error: messageError } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                message_type: messageType,
                media_url: publicUrl,
            })
            .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          avatar_url
        )
      `)
            .single();

        if (messageError) {
            throw messageError;
        }

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
