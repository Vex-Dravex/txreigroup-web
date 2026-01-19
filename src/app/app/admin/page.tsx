import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Check if user is admin
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

  // Get statistics
  const [pendingDealsResult, inquiriesResult, usersResult, contractorsResult, dealInterestResult] = await Promise.all([
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("deal_inquiries")
      .select("status", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contractor_profiles")
      .select("verification_status", { count: "exact", head: true })
      .eq("verification_status", "pending"),
    supabase
      .from("deal_interest")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={primaryRole}
        currentPage="admin"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
        pendingDealsCount={pendingDealsResult.count || 0}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage deals, inquiries, and members</p>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Back to Member Dashboard
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Profile</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Display Name</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                  {profileData?.display_name || "Admin"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</dt>
                <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">{authData.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Role</dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Administrator
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Snapshot</h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Deals</dt>
                <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  <Link
                    href="/app/admin/deals/pending"
                    className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {pendingDealsResult.count || 0}
                  </Link>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">New Inquiries</dt>
                <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {inquiriesResult.count || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</dt>
                <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {usersResult.count || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Contractors</dt>
                <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {contractorsResult.count || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Deal Interest</dt>
                <dd className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  <Link
                    href="/app/admin/deal-interest"
                    className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                  >
                    {dealInterestResult.count || 0}
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/admin/videos"
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
            >
              Manage Education Center
            </Link>
            <Link
              href="/app/admin/deals"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Review Deals
            </Link>
            <Link
              href="/app/admin/deal-interest"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              View Deal Interest
            </Link>
            <Link
              href="/app/admin/inquiries"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Review Inquiries
            </Link>
            <Link
              href="/app/admin/users"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Manage Users
            </Link>
            <Link
              href="/app/admin/contractors"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Verify Contractors
            </Link>
            <Link
              href="/app/admin/contractors"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Verify Contractors
            </Link>
            <Link
              href="/app/admin/blog"
              className="rounded-md border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
            >
              Manage Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
