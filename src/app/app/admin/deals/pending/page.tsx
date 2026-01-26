import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import AppHeader from "@/app/app/components/AppHeader";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name?: string | null;
  avatar_url?: string | null;
};

type Deal = {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "draft" | "closed";
  asking_price: number;
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
  }[] | null;
};

export default async function PendingDealsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

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

  const [{ data: pendingDeals }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("deals")
      .select(
        `
        id,
        title,
        status,
        asking_price,
        property_address,
        property_city,
        property_state,
        property_zip,
        created_at,
        profiles:wholesaler_id (
          display_name
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const statusClasses = (status: Deal["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  return (
    <div className="w-full">
      <AppHeader
        userRole={primaryRole}
        currentPage="admin"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
        pendingDealsCount={pendingCount || 0}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Pending Deal Reviews</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Scroll through pending submissions and open a deal to review and approve.
            </p>
          </div>
          <Link
            href="/app/admin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        {pendingDeals && pendingDeals.length > 0 ? (
          <div className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50">
            {(pendingDeals as Deal[]).map((deal) => (
              <Link
                key={deal.id}
                href={`/app/admin/deals/${deal.id}`}
                className="block px-6 py-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{deal.title}</h2>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                          deal.status
                        )}`}
                      >
                        {deal.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {deal.property_address}, {deal.property_city}, {deal.property_state}
                      {deal.property_zip && ` ${deal.property_zip}`}
                    </p>
                    {deal.profiles?.[0]?.display_name && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Submitted by {deal.profiles[0].display_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Asking</div>
                    <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(deal.asking_price)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No pending deals to review. You are all caught up.
            </p>
            <Link
              href="/app/admin/deals"
              className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              View all deals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
