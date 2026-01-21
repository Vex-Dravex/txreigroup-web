import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "./AccountForm";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import FadeIn, { FadeInStagger } from "../../components/FadeIn";

export const dynamic = 'force-dynamic';

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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-purple-500/30">
            <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

            {/* Background Gradient Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader
                    userRole={viewerPrimaryRole}
                    currentPage="account"
                    avatarUrl={profile?.avatar_url || null}
                    displayName={profile?.display_name || user.email?.split("@")[0]}
                    email={user.email}
                />

                <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    <FadeInStagger className="space-y-8">
                        <FadeIn className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-purple-700 ring-1 ring-inset ring-purple-200/50 backdrop-blur-sm dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-800/30">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                                Account Center
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 font-display">
                                Settings & <span className="text-purple-600 dark:text-purple-500">Identity</span>
                            </h1>
                            <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                Manage your personal profile, security credentials, and membership status in one place.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <AccountForm
                                profile={profileData}
                                userEmail={user.email || ""}
                            />
                        </FadeIn>
                    </FadeInStagger>
                </div>
            </div>
        </div>
    );
}
