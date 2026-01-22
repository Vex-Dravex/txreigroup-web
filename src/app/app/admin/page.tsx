import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import AdminDashboardContent from "./AdminDashboardContent";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  if (!hasRole(roles, "admin")) {
    redirect("/app");
  }
  const primaryRole = getPrimaryRole(roles, profileData?.role || "investor");

  // Get statistics
  const [pendingDealsResult, inquiriesResult, usersResult, contractorsResult, dealInterestResult] = await Promise.all([
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("deal_inquiries")
      .select("status", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contractor_profiles")
      .select("verification_status", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    supabase
      .from("deal_interest")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <AdminDashboardContent
      userRole={primaryRole}
      profileData={profileData}
      authEmail={authData.user.email}
      pendingDealsCount={pendingDealsResult.count || 0}
      inquiriesCount={inquiriesResult.count || 0}
      usersCount={usersResult.count || 0}
      contractorsCount={contractorsResult.count || 0}
      dealInterestCount={dealInterestResult.count || 0}
    />
  );
}
