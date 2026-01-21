import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messageId, emoji } = await request.json();

        // Check if reaction already exists
        const { data: existingReaction } = await supabase
            .from("message_reactions")
            .select("id")
            .eq("message_id", messageId)
            .eq("user_id", user.id)
            .eq("emoji", emoji)
            .single();

        if (existingReaction) {
            // Remove reaction if it already exists
            await supabase
                .from("message_reactions")
                .delete()
                .eq("id", existingReaction.id);

            return NextResponse.json({ action: "removed" });
        }

        // Add new reaction
        const { error } = await supabase
            .from("message_reactions")
            .insert({
                message_id: messageId,
                user_id: user.id,
                emoji,
            });

        if (error) {
            throw error;
        }

        return NextResponse.json({ action: "added" });
    } catch (error) {
        console.error("Error adding reaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
