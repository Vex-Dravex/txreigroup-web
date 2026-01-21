import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        // Get messages
        const { data: messages, error } = await supabase
            .from("messages")
            .select(`
        *,
        sender:sender_id (
          id,
          display_name,
          avatar_url
        ),
        reactions:message_reactions (
          emoji,
          user_id
        )
      `)
            .eq("conversation_id", conversationId)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
