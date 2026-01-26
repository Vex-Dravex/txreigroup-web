import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import DealCRMTable from "./DealCRMTable";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
    id: string;
    role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
    display_name: string | null;
    avatar_url: string | null;
};

export default async function CRMPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

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

    // Fetch approved deals
    const { data: deals, error } = await supabase
        .from("deals")
        .select(`
        *,
        profiles:wholesaler_id (
            display_name,
            email,
            phone_number: phone
        )
    `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching CRM deals:", error);
    }

    return (
        <div className="w-full">
            <AppHeader
                userRole={primaryRole}
                currentPage="admin"
                avatarUrl={profileData?.avatar_url || null}
                displayName={profileData?.display_name || null}
                email={authData.user.email}
            />

            {/* Background decoration (inheriting from admin layout, but ensuring transparency) */}

            <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Disposition Manager</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Manage your active deal pipeline, track closing dates, and coordinate with wholesalers.
                    </p>
                </div>

                <DealCRMTable deals={deals || []} />
            </div>
        </div>
    );
}
