import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SupportForm from "./SupportForm";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import FadeIn, { FadeInStagger } from "../../components/FadeIn";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, display_name, email, avatar_url, role")
        .eq("id", user.id)
        .single();

    const viewerRoles = await getUserRoles(supabase, user.id, profile?.role || "investor");
    const viewerPrimaryRole = getPrimaryRole(viewerRoles, profile?.role || "investor");

    const initialName = profile?.display_name || (profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : '');
    const initialEmail = profile?.email || user.email || '';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-purple-500/30">
            <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

            {/* Background Gradient Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <div className="relative z-10">
                <AppHeader
                    userRole={viewerPrimaryRole}
                    currentPage="support"
                    avatarUrl={profile?.avatar_url || null}
                    displayName={profile?.display_name || user.email?.split("@")[0]}
                    email={user.email}
                />

                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <FadeInStagger className="space-y-12">
                        <FadeIn className="text-center space-y-4 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200/50 backdrop-blur-sm dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Support & Assistance
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 font-display">
                                How can we <span className="text-purple-600 dark:text-purple-500">support</span> you?
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                Have a question, found a bug, or need help navigating the platform?
                                Our dedicated support team is here to ensure you have the best experience possible.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <SupportForm
                                initialEmail={initialEmail}
                                initialName={initialName}
                            />
                        </FadeIn>
                    </FadeInStagger>
                </div>
            </div>
        </div>
    );
}
