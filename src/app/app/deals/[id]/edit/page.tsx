import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const dealId = resolvedParams.id;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();

    const profileData = profile as {
        role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
        display_name: string | null;
        avatar_url: string | null;
    } | null;

    const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");

    // STRICTLY ENFORCE ADMIN ONLY
    if (!hasRole(roles, "admin")) {
        redirect("/app/deals");
    }

    const userRole = getPrimaryRole(roles, profileData?.role || "investor");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <AppHeader
                userRole={userRole}
                currentPage="deals"
                avatarUrl={profileData?.avatar_url || null}
                displayName={profileData?.display_name || null}
                email={authData.user.email}
            />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950/30">
                    <h1 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Edit Deal</h1>
                    <p className="mt-2 text-yellow-700 dark:text-yellow-300">
                        Deal editing functionality is currently under development. Please utilize the database directly for urgent edits or delete and re-submit the deal.
                    </p>
                    <p className="mt-4 text-sm font-mono text-yellow-600 dark:text-yellow-400">
                        Deal ID: {dealId}
                    </p>
                </div>
            </div>
        </div>
    );
}
