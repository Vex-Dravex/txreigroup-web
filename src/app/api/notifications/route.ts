import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
        .from("notifications")
        .select(`
      *,
      actor:actor_id (
        id,
        display_name,
        avatar_url
      )
    `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    return NextResponse.json(notifications);
}
