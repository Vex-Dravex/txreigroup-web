import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "./components/AppHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  display_name: string | null;
  role: "admin" | "investor" | "wholesaler" | "contractor";
  status: string;
  avatar_url: string | null;
};

type Membership = {
  id: string;
  tier: "free" | "investor_basic" | "investor_pro" | "contractor_basic" | "contractor_featured";
  status: "active" | "past_due" | "canceled";
  current_period_end: string | null;
};

export default async function AppHome() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Fetch membership
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (membershipError) {
    console.error("Error fetching membership:", membershipError);
  }

  const profileData = profile as Profile | null;
  const membershipData = membership as Membership | null;

  const displayName = profileData?.display_name || authData.user.email?.split("@")[0] || "User";
  const role = profileData?.role || "investor";
  const tier = membershipData?.tier || "free";
  const membershipStatus = membershipData?.status || "active";

  // Format tier name for display
  const tierDisplayNames: Record<string, string> = {
    free: "Free",
    investor_basic: "Investor Basic",
    investor_pro: "Investor Pro",
    contractor_basic: "Contractor Basic",
    contractor_featured: "Contractor Featured",
  };

  const roleDisplayNames: Record<string, string> = {
    admin: "Administrator",
    investor: "Investor",
    wholesaler: "Wholesaler",
    contractor: "Contractor",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={role}
        currentPage="dashboard"
        avatarUrl={profileData?.avatar_url}
        displayName={displayName}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Member Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Welcome back, {displayName}!</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Profile</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Display Name</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{displayName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{authData.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Role</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {roleDisplayNames[role]}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Membership Card */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Membership</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Tier</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {tierDisplayNames[tier]}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      membershipStatus === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : membershipStatus === "past_due"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {membershipStatus === "active"
                      ? "Active"
                      : membershipStatus === "past_due"
                        ? "Past Due"
                        : "Canceled"}
                  </span>
                </dd>
              </div>
              {membershipData?.current_period_end && (
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Period End</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {new Date(membershipData.current_period_end).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/deals"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Deal Board
            </Link>
            <Link
              href="/app/contractors"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Contractors
            </Link>
            <Link
              href="/app/courses"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Courses
            </Link>
            {role === "wholesaler" && (
              <Link
                href="/app/deals/new"
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                Create Deal
              </Link>
            )}
            {role === "admin" && (
              <Link
                href="/app/admin"
                className="rounded-md border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-900 transition-colors hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
