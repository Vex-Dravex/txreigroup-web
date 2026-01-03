import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

type Deal = {
  id: string;
  wholesaler_id: string;
  title: string;
  description: string | null;
  property_address: string;
  property_city: string;
  property_state: string;
  property_zip: string | null;
  property_type: string | null;
  asking_price: number;
  arv: number | null;
  repair_estimate: number | null;
  square_feet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: "draft" | "pending" | "approved" | "rejected" | "closed";
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function DealsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const userRole = profileData?.role || "investor";

  // Fetch deals based on role
  let dealsQuery = supabase
    .from("deals")
    .select(`
      *,
      profiles:wholesaler_id (
        display_name
      )
    `)
    .order("created_at", { ascending: false });

  // Investors only see approved deals
  if (userRole === "investor") {
    dealsQuery = dealsQuery.eq("status", "approved");
  }
  // Wholesalers see their own deals
  else if (userRole === "wholesaler") {
    dealsQuery = dealsQuery.eq("wholesaler_id", authData.user.id);
  }
  // Admins see all deals

  const { data: deals, error } = await dealsQuery;

  if (error) {
    console.error("Error fetching deals:", error);
  }

  const dealsData = (deals as Deal[]) || [];

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Status badge colors
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "closed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Deal Board</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {userRole === "investor"
                ? "Browse approved wholesale deals"
                : userRole === "wholesaler"
                  ? "Manage your deals"
                  : "All deals"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/app"
              className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Dashboard
            </Link>
            {userRole === "wholesaler" && (
              <Link
                href="/app/deals/new"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                New Deal
              </Link>
            )}
          </div>
        </div>

        {dealsData.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              {userRole === "investor"
                ? "No approved deals available at this time."
                : userRole === "wholesaler"
                  ? "You haven't created any deals yet."
                  : "No deals found."}
            </p>
            {userRole === "wholesaler" && (
              <Link
                href="/app/deals/new"
                className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Create Your First Deal
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dealsData.map((deal) => (
              <Link
                key={deal.id}
                href={`/app/deals/${deal.id}`}
                className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
                    {deal.title}
                  </h2>
                  <span
                    className={`ml-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusBadgeClass(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </div>

                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {deal.property_address}, {deal.property_city}, {deal.property_state}
                  {deal.property_zip && ` ${deal.property_zip}`}
                </p>

                <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Asking Price</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(deal.asking_price)}
                    </span>
                  </div>
                  {deal.arv && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">ARV</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(deal.arv)}
                      </span>
                    </div>
                  )}
                  {deal.square_feet && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Square Feet</span>
                      <span className="text-zinc-900 dark:text-zinc-50">{deal.square_feet.toLocaleString()}</span>
                    </div>
                  )}
                  {(deal.bedrooms || deal.bathrooms) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Beds / Baths</span>
                      <span className="text-zinc-900 dark:text-zinc-50">
                        {deal.bedrooms || "—"} / {deal.bathrooms || "—"}
                      </span>
                    </div>
                  )}
                </div>

                {deal.profiles?.display_name && (
                  <div className="mt-4 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    Listed by {deal.profiles.display_name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

