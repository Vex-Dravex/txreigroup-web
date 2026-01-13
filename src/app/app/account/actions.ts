"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateAccount(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized");
    }

    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    // Display name is automatically constructed or can be separate. 
    // Let's assume display_name is preferred to be First + Last if not separately set?
    // Or keep them separate. The prompt asked for "first and last name".
    // I will update display_name to be "First Last" if both are provided, for consistency, 
    // unless we want to keep display_name as a nickname. 
    // Let's construct display_name from first and last name if they are present.

    let displayName = String(formData.get("displayName") || "").trim();

    if (!displayName && firstName && lastName) {
        displayName = `${firstName} ${lastName}`;
    }

    const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
    };

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (phone) updates.phone = phone;
    if (displayName) updates.display_name = displayName;

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
    }

    revalidatePath("/app/account");
    revalidatePath(`/app/profile/${user.id}`);
    return { success: true };
}

export async function updateSafeEmail(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const email = String(formData.get("email") || "").trim();
    if (!email) throw new Error("Email is required");

    // Supabase Auth update
    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
        throw new Error(`Failed to update email: ${error.message}`);
    }

    // Note: This usually triggers a confirmation email to both old and new addresses.
    return { success: true, message: "Confirmation emails sent to both old and new addresses." };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createSupabaseServerClient();

    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        throw new Error(`Failed to update password: ${error.message}`);
    }

    return { success: true };
}
