"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SubscriptionGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    allowedTiers?: string[];
    requireActive?: boolean;
}

export default function SubscriptionGuard({
    children,
    fallback,
    allowedTiers,
    requireActive = true,
}: SubscriptionGuardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function checkAccess() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setHasAccess(false);
                    setIsLoading(false);
                    return;
                }

                const { data: membership } = await supabase
                    .from("memberships")
                    .select("status, tier, trial_end")
                    .eq("user_id", user.id)
                    .single();

                if (!membership) {
                    setHasAccess(false);
                    setIsLoading(false);
                    return;
                }

                const isActive =
                    membership.status === 'active' ||
                    membership.status === 'trialing' ||
                    (membership.trial_end && new Date(membership.trial_end) > new Date());

                if (requireActive && !isActive) {
                    setHasAccess(false);
                    setIsLoading(false);
                    return;
                }

                if (allowedTiers && !allowedTiers.includes(membership.tier)) {
                    setHasAccess(false);
                    setIsLoading(false);
                    return;
                }

                setHasAccess(true);
            } catch (error) {
                console.error("Error checking subscription:", error);
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAccess();
    }, [supabase, allowedTiers, requireActive]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!hasAccess) {
        if (fallback) return <>{fallback}</>;

        // Default behavior: Redirect to subscription page or show upgrade message
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    Premium Feature
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
                    This feature requires an active subscription. Upgrade your plan to access unrestricted deal analyis and vendor connections.
                </p>
                <button
                    onClick={() => router.push("/onboarding/subscription")}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                    Upgrade Now
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
