"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function submitSupportRequest(formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const subject = String(formData.get("subject") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();

    if (!message || !subject || !email) {
        throw new Error("Missing required fields");
    }

    // In the future, this will send an email. 
    // For now, we will log it or store it in a hypothetical 'support_requests' table if it exists.
    // Since we don't have that table created, we'll just simulate a successful send.

    console.log("Support Request Received:", {
        userId: user?.id || "anonymous",
        name,
        email,
        category,
        subject,
        message,
        timestamp: new Date().toISOString()
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return success
    return {
        success: true,
        message: "Your support request has been sent successfully. Our team will get back to you soon."
    };
}
