"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import FadeIn, { FadeInStagger } from "@/app/components/FadeIn";

export default function MembershipPage() {
    const [loading, setLoading] = useState(false);
    const [membership, setMembership] = useState<any>(null);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function fetchMembership() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("memberships")
                .select("*")
                .eq("user_id", user.id)
                .single();

            setMembership(data);
        }
        fetchMembership();
    }, [supabase]);

    const handleManageSubscription = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ returnUrl: window.location.href }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to access portal");
            }
            const { url } = await response.json();
            window.location.href = url;
        } catch (error: any) {
            console.error("Error accessing portal:", error);
            alert(error.message || "Failed to access subscription portal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-4xl mx-auto">
                <FadeIn>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
                        Membership Management
                    </h1>
                </FadeIn>

                <FadeInStagger>
                    <FadeIn>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Current Plan</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400">
                                        {membership ? `You are on the ${membership.tier} plan` : "No active subscription"}
                                    </p>
                                </div>
                                <div>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${membership?.status === 'active' || membership?.status === 'trialing'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                        {membership?.status || 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {membership && membership.current_period_end && (
                                <div className="grid gap-4 mb-8">
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border border-zinc-200 dark:border-zinc-800/50 flex justify-between items-center">
                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Current Period Ends</span>
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {new Date(membership.current_period_end).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-4">
                                {membership ? (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Loading..." : "Manage Subscription"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/onboarding/subscription')}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105"
                                    >
                                        SELECT
                                    </button>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                </FadeInStagger>
            </div>
        </div>
    );
}
