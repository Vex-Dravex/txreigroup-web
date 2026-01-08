"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Verify admin access
async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
  if (!hasRole(roles, "admin")) {
    throw new Error("Forbidden: Admin access required");
  }

  return authData.user.id;
}

// Approve a deal
export async function approveDeal(dealId: string, adminNotes?: string) {
  const adminId = await verifyAdmin();

  const supabase = await createSupabaseServerClient();

  // Update deal status
  const { error } = await supabase
    .from("deals")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: adminId,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  if (error) {
    throw new Error(`Failed to approve deal: ${error.message}`);
  }

  // Create audit event
  await supabase.from("deal_events").insert({
    deal_id: dealId,
    event_type: "approved",
    actor_id: adminId,
    new_value: { status: "approved", approved_at: new Date().toISOString() },
  });

  revalidatePath("/app/admin/deals");
  revalidatePath(`/app/deals/${dealId}`);
  revalidatePath("/app/deals");
}

// Reject a deal
export async function rejectDeal(dealId: string, adminNotes: string) {
  const adminId = await verifyAdmin();

  if (!adminNotes || adminNotes.trim().length === 0) {
    throw new Error("Admin notes are required when rejecting a deal");
  }

  const supabase = await createSupabaseServerClient();
  const { data: dealInfo, error: dealInfoError } = await supabase
    .from("deals")
    .select("wholesaler_id, title")
    .eq("id", dealId)
    .single();

  if (dealInfoError || !dealInfo) {
    throw new Error(`Failed to load deal for rejection: ${dealInfoError?.message || "Not found"}`);
  }

  // Update deal status
  const { error } = await supabase
    .from("deals")
    .update({
      status: "rejected",
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  if (error) {
    throw new Error(`Failed to reject deal: ${error.message}`);
  }

  const rejectionMessage =
    "We apologize but your deal does not meet the criteria to be listed on our marketplace, you will receive an email with amplifying information as to why your deal was not accepted.";

  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: dealInfo.wholesaler_id,
    type: "deal_rejected",
    title: "Deal Not Accepted",
    message: rejectionMessage,
    related_deal_id: dealId,
    metadata: {
      deal_title: dealInfo.title,
      admin_notes: adminNotes,
    },
  });

  if (notificationError) {
    throw new Error(`Failed to create rejection notification: ${notificationError.message}`);
  }

  // Create audit event
  await supabase.from("deal_events").insert({
    deal_id: dealId,
    event_type: "rejected",
    actor_id: adminId,
    new_value: { status: "rejected", admin_notes: adminNotes },
  });

  revalidatePath("/app/admin/deals");
  revalidatePath(`/app/deals/${dealId}`);
  revalidatePath("/app/deals");
}

// Update inquiry status
export async function updateInquiryStatus(inquiryId: string, status: string) {
  await verifyAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("deal_inquiries")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  if (error) {
    throw new Error(`Failed to update inquiry status: ${error.message}`);
  }

  revalidatePath("/app/admin/inquiries");
}

// Update user role
export async function updateUserRoles(userId: string, roles: Array<"admin" | "investor" | "wholesaler" | "contractor" | "vendor">) {
  await verifyAdmin();

  const supabase = await createSupabaseServerClient();

  const primaryRole = getPrimaryRole(roles, "investor");
  const { error: roleUpdateError } = await supabase
    .from("profiles")
    .update({
      role: primaryRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (roleUpdateError) {
    throw new Error(`Failed to update user role: ${roleUpdateError.message}`);
  }

  const { error: deleteError } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to update user roles: ${deleteError.message}`);
  }

  if (roles.length > 0) {
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert(roles.map((role) => ({ user_id: userId, role })));

    if (insertError) {
      throw new Error(`Failed to update user roles: ${insertError.message}`);
    }
  }

  revalidatePath("/app/admin/users");
}

// Update user status
export async function updateUserStatus(userId: string, status: string) {
  await verifyAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user status: ${error.message}`);
  }

  revalidatePath("/app/admin/users");
}

// Verify a contractor
export async function verifyContractor(contractorId: string, adminNotes?: string) {
  const adminId = await verifyAdmin();

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("contractor_profiles")
    .update({
      verification_status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: adminId,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractorId);

  if (error) {
    throw new Error(`Failed to verify contractor: ${error.message}`);
  }

  revalidatePath("/app/admin/contractors");
  revalidatePath(`/app/contractors/${contractorId}`);
  revalidatePath("/app/contractors");
}

// Reject a contractor
export async function rejectContractor(contractorId: string, adminNotes: string) {
  const adminId = await verifyAdmin();

  if (!adminNotes || adminNotes.trim().length === 0) {
    throw new Error("Admin notes are required when rejecting a contractor");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("contractor_profiles")
    .update({
      verification_status: "rejected",
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractorId);

  if (error) {
    throw new Error(`Failed to reject contractor: ${error.message}`);
  }

  revalidatePath("/app/admin/contractors");
  revalidatePath(`/app/contractors/${contractorId}`);
  revalidatePath("/app/contractors");
}
