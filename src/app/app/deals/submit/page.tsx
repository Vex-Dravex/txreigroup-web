import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import DealForm from "./DealForm";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function SubmitDealPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30 overflow-x-hidden">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      {/* Background Gradient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <AppHeader
          userRole={userRole}
          currentPage="deals"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />

        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3">Wholesale Platform</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne mb-4">
              Submit a <span className="text-blue-600">Deal</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg max-w-2xl">
              Share a property you have under contract. Our algorithm will help you estimate insurance and present the deal to qualified investors.
            </p>
          </div>

          <div className="relative">
            {/* The DealForm itself will handle its own glass/card styling to allow for animations */}
            <DealForm />
          </div>
        </div>
      </div>
    </div>
  );
}

