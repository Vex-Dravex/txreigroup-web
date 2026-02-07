import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all notifications for the user
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

    if (error) {
        console.error("Error clearing notifications:", error);
        return new NextResponse("Error clearing notifications", { status: 500 });
    }

    return new NextResponse("OK", { status: 200 });
}
