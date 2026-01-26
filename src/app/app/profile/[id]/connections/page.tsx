import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

export const dynamic = "force-dynamic";

type Profile = {
    id: string;
    role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
    display_name?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    bio?: string | null;
};

export default async function ConnectionsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const profileId = resolvedParams.id;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

    // Fetch the profile whose connections we are viewing
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, display_name, avatar_url, banner_url, bio")
        .eq("id", profileId)
        .single();

    if (!profile) {
        notFound();
    }

    // Fetch Viewer Data for Header
    const { data: viewerProfile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();
    const viewerProfileData = viewerProfile as Profile | null;
    const viewerRoles = await getUserRoles(supabase, authData.user.id, viewerProfileData?.role || "investor");
    const viewerPrimaryRole = getPrimaryRole(viewerRoles, viewerProfileData?.role || "investor");

    // Fetch Connections
    const { data: connectionsData } = await supabase
        .from("network_requests")
        .select(
            "requester_id, requestee_id, requester:requester_id ( id, display_name, avatar_url, role ), requestee:requestee_id ( id, display_name, avatar_url, role )"
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${profileId},requestee_id.eq.${profileId}`);

    const connections = (connectionsData || []).map((conn: any) => {
        const isRequester = conn.requester_id === profileId;
        // The "other" user is the connection
        const otherUser = isRequester ? conn.requestee : conn.requester;
        // Handle array response if join returns array
        const userObj = Array.isArray(otherUser) ? otherUser[0] : otherUser;
        return userObj;
    }).filter(Boolean);

    const formatRoleLabel = (role: string) => role.replace("_", " ");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            <AppHeader
                userRole={viewerPrimaryRole}
                currentPage="community"
                avatarUrl={viewerProfileData?.avatar_url || null}
                displayName={viewerProfileData?.display_name || null}
                email={authData.user.email}
            />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href={`/app/profile/${profileId}`}
                        className="rounded-full bg-white p-2 shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                        <svg
                            className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Connections</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {profile.display_name}&apos;s network ({connections.length})
                        </p>
                    </div>
                </div>

                {connections.length === 0 ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dotted border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                        <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                            <svg className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">No connections yet</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            When {profile.display_name} connects with others, they&apos;ll appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {connections.map((user: any) => (
                            <Link
                                key={user.id}
                                href={`/app/profile/${user.id}`}
                                className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.display_name || "User"}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-zinc-500">
                                            {(user.display_name || "U").slice(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                                        {user.display_name || "Community Member"}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                            {formatRoleLabel(user.role || "investor")}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
