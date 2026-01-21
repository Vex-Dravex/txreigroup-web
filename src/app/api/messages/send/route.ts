import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, content, messageType } = await request.json();

        // Verify user is a participant in this conversation
        const { data: participant } = await supabase
            .from("conversation_participants")
            .select("id")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!participant) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Create message
        const { data: message, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
                message_type: messageType || "text",
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

        if (error) {
            throw error;
        }

        // Create notification for other participants
        const { data: otherParticipants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conversationId)
            .neq("user_id", user.id);

        if (otherParticipants && otherParticipants.length > 0) {
            const { data: senderProfile } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("id", user.id)
                .single();

            const notifications = otherParticipants.map(p => ({
                user_id: p.user_id,
                type: "message",
                message: `${senderProfile?.display_name || "Someone"} sent you a message`,
                link: `/app/messages`,
            }));

            await supabase.from("notifications").insert(notifications);
        }

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
