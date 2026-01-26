import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type DealInterest = {
    id: string;
    deal_id: string;
    investor_name: string | null;
    investor_email: string | null;
    investor_phone: string | null;
    message: string | null;
    status: string;
    created_at: string;
    deals: {
        title: string;
        property_address: string;
        property_city: string;
        property_state: string;
        asking_price: number;
    } | null;
};

export default async function DealInterestPage() {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();

    const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");

    if (!hasRole(roles, "admin")) {
        redirect("/app");
    }

    const userRole = getPrimaryRole(roles, profile?.role || "investor");

    // Fetch all deal interest submissions
    const { data: interests, error } = await supabase
        .from("deal_interest")
        .select(`
            *,
            deals:deal_id (
                title,
                property_address,
                property_city,
                property_state,
                asking_price
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching deal interest:", error);
    }

    const dealInterests = (interests as DealInterest[]) || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'contacted':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'closed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="w-full">
            <AppHeader
                userRole={userRole}
                currentPage="admin"
                avatarUrl={profile?.avatar_url || null}
                displayName={profile?.display_name || null}
                email={authData.user.email}
            />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/app/admin"
                        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        ← Back to Admin Dashboard
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Deal Interest Notifications</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Investors who have expressed interest in securing deals
                    </p>
                </div>

                {dealInterests.length === 0 ? (
                    <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            No deal interest submissions yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dealInterests.map((interest) => (
                            <div
                                key={interest.id}
                                className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 hover:border-blue-500/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                                    {interest.investor_name || "Anonymous"}
                                                </h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    Interested in: <Link href={`/app/deals/${interest.deal_id}`} className="text-blue-600 hover:underline font-semibold">
                                                        {interest.deals?.title || "Unknown Deal"}
                                                    </Link>
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    {interest.deals?.property_address}, {interest.deals?.property_city}, {interest.deals?.property_state}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            {interest.investor_email && (
                                                <div>
                                                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email</div>
                                                    <a href={`mailto:${interest.investor_email}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                        {interest.investor_email}
                                                    </a>
                                                </div>
                                            )}
                                            {interest.investor_phone && (
                                                <div>
                                                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone</div>
                                                    <a href={`tel:${interest.investor_phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                        {interest.investor_phone}
                                                    </a>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Submitted</div>
                                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                                    {new Date(interest.created_at).toLocaleDateString()} at {new Date(interest.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>

                                        {interest.message && (
                                            <div className="mb-4">
                                                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Message</div>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                                                    "{interest.message}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(interest.status)}`}>
                                            {interest.status}
                                        </span>
                                        {interest.deals?.asking_price && (
                                            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                                ${interest.deals.asking_price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
