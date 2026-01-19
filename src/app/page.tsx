import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import type { Role } from "@/lib/roles";
import LandingPageContent from "./components/landing/LandingPageContent";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is authenticated (but don't redirect - homepage is public)
  let isAuthenticated = false;
  let userProfile: { avatar_url: string | null; display_name: string | null; email: string | null } | null = null;
  let userRole: Role = "investor";

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      isAuthenticated = true;
      // Fetch profile for authenticated users
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, role")
        .eq("id", authData.user.id)
        .single();

      const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");

      userProfile = {
        avatar_url: profile?.avatar_url || null,
        display_name: profile?.display_name || null,
        email: authData.user.email || null,
      };

      userRole = getPrimaryRole(roles, profile?.role || "investor");
    }
  } catch (error) {
    // If auth check fails, user is not authenticated
    console.error("Auth check failed:", error);
  }

  return (
    <LandingPageContent
      isAuthenticated={isAuthenticated}
      userProfile={userProfile}
      userRole={userRole}
    />
  );
}
