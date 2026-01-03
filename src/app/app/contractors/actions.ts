"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Create a contractor lead (investor inquiry)
export async function createContractorLead(
  contractorId: string,
  formData: {
    project_description: string;
    project_address?: string;
    project_city?: string;
    project_state?: string;
    project_zip?: string;
    budget_range?: string;
    preferred_contact_method?: string;
    contact_phone?: string;
    contact_email?: string;
  }
) {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    throw new Error("Unauthorized");
  }

  // Verify user is an investor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "investor") {
    throw new Error("Only investors can create contractor leads");
  }

  // Verify contractor is verified
  const { data: contractor } = await supabase
    .from("contractor_profiles")
    .select("verification_status")
    .eq("id", contractorId)
    .single();

  if (!contractor || contractor.verification_status !== "verified") {
    throw new Error("Can only create leads for verified contractors");
  }

  // Create the lead
  const { error } = await supabase.from("contractor_leads").insert({
    contractor_id: contractorId,
    investor_id: authData.user.id,
    project_description: formData.project_description,
    project_address: formData.project_address || null,
    project_city: formData.project_city || null,
    project_state: formData.project_state || null,
    project_zip: formData.project_zip || null,
    budget_range: formData.budget_range || null,
    preferred_contact_method: formData.preferred_contact_method || "either",
    contact_phone: formData.contact_phone || null,
    contact_email: formData.contact_email || null,
    status: "new",
  });

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  revalidatePath(`/app/contractors/${contractorId}`);
}

