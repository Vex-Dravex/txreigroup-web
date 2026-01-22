"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDealDispositionStatus(dealId: string, status: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("deals")
        .update({ disposition_status: status })
        .eq("id", dealId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/app/admin/crm");
}

export async function updateExpectedClosingDate(dealId: string, date: string | null) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from("deals")
        .update({ expected_closing_date: date })
        .eq("id", dealId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/app/admin/crm");
}

export async function addDealNote(dealId: string, content: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("deal_notes")
        .insert({
            deal_id: dealId,
            user_id: user.id,
            content
        });

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/app/admin/crm");
}

export async function getDealNotes(dealId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("deal_notes")
        .select(`
            id,
            content,
            created_at,
            profiles:user_id (
                display_name,
                avatar_url
            )
        `)
        .eq("deal_id", dealId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}
