import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("No authenticated user");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { recipientId } = await request.json();
        console.log("Creating/loading conversation between:", user.id, "and", recipientId);

        // Check if conversation already exists between these two users
        const { data: existingParticipants, error: participantsError } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", user.id);

        if (participantsError) {
            console.error("Error fetching existing participants:", participantsError);
            throw participantsError;
        }

        const userConversationIds = existingParticipants?.map(p => p.conversation_id) || [];
        console.log("User conversation IDs:", userConversationIds);

        if (userConversationIds.length > 0) {
            const { data: recipientParticipants, error: recipError } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", recipientId)
                .in("conversation_id", userConversationIds);

            if (recipError) {
                console.error("Error fetching recipient participants:", recipError);
                throw recipError;
            }

            if (recipientParticipants && recipientParticipants.length > 0) {
                // Conversation exists, load messages
                const conversationId = recipientParticipants[0].conversation_id;
                console.log("Found existing conversation:", conversationId);

                const { data: messages, error: messagesError } = await supabase
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

                if (messagesError) {
                    console.error("Error fetching messages:", messagesError);
                    throw messagesError;
                }

                return NextResponse.json({ conversationId, messages });
            }
        }

        // Create new conversation
        console.log("Creating new conversation...");
        const { data: newConversation, error: convError } = await supabase
            .from("conversations")
            .insert({})
            .select()
            .single();

        if (convError) {
            console.error("Error creating conversation:", convError);
            throw convError;
        }

        if (!newConversation) {
            throw new Error("Failed to create conversation - no data returned");
        }

        console.log("Created conversation:", newConversation.id);

        // Add both participants
        const { error: participantsInsertError } = await supabase
            .from("conversation_participants")
            .insert([
                { conversation_id: newConversation.id, user_id: user.id },
                { conversation_id: newConversation.id, user_id: recipientId },
            ]);

        if (participantsInsertError) {
            console.error("Error adding participants:", participantsInsertError);
            throw participantsInsertError;
        }

        console.log("Successfully created conversation and added participants");
        return NextResponse.json({ conversationId: newConversation.id, messages: [] });
    } catch (error: any) {
        console.error("Error in conversation route:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
