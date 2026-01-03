import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
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
  if (profileData?.role !== "admin") {
    redirect("/app");
  }

  // Get statistics
  const [dealsResult, inquiriesResult, usersResult, contractorsResult] = await Promise.all([
    supabase
      .from("deals")
      .select("status", { count: "exact", head: true })
      .in("status", ["pending", "approved", "rejected"]),
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
  ]);

  const pendingDealsCount = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole="admin"
        currentPage="admin"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage deals, inquiries, and users</p>
          </div>
          <Link
            href="/app"
            className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/app/admin/deals"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Deals</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {pendingDealsCount.count || 0}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <svg
                  className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/app/admin/inquiries"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">New Inquiries</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {inquiriesResult.count || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/app/admin/users"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{usersResult.count || 0}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/app/admin/contractors"
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Pending Contractors</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {contractorsResult.count || 0}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <svg
                  className="h-6 w-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/admin/deals"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Review Deals
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
          </div>
        </div>
      </div>
    </div>
  );
}

