import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "./AccountForm";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

export default async function AccountPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, display_name, email, phone, role, avatar_url")
        .eq("id", user.id)
        .single();

    const viewerRoles = await getUserRoles(supabase, user.id, profile?.role || "investor");
    const viewerPrimaryRole = getPrimaryRole(viewerRoles, profile?.role || "investor");

    // If profile is missing (rare), use basic auth details
    const profileData = profile || {
        id: user.id,
        email: user.email,
        role: "investor",
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <AppHeader
                userRole={viewerPrimaryRole}
                currentPage="account"
                avatarUrl={profile?.avatar_url || null}
                displayName={profile?.display_name || user.email?.split("@")[0]}
                email={user.email}
            />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Account Settings</h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Manage your personal profile, account security, and membership subscription.
                    </p>
                </div>

                <AccountForm
                    profile={profileData}
                    userEmail={user.email || ""}
                />
            </div>
        </div>
    );
}
