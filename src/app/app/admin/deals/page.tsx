import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { approveDeal, rejectDeal } from "../actions";
import DealApprovalForm from "./DealApprovalForm";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    display_name: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function AdminDealsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  if (profileData?.role !== "admin") {
    redirect("/app");
  }

  // Fetch pending deals
  const { data: pendingDeals } = await supabase
    .from("deals")
    .select(`
      *,
      profiles:wholesaler_id (
        id,
        display_name
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch all deals for overview
  const { data: allDeals } = await supabase
    .from("deals")
    .select(`
      *,
      profiles:wholesaler_id (
        id,
        display_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

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
        <div className="mb-6">
          <Link
            href="/app/admin"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Deal Management</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Review and approve/reject pending deals
          </p>
        </div>

        {/* Pending Deals Section */}
        {pendingDeals && pendingDeals.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Pending Approval ({pendingDeals.length})
            </h2>
            <div className="space-y-6">
              {(pendingDeals as Deal[]).map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-lg border border-yellow-200 bg-white p-6 shadow-sm dark:border-yellow-800 dark:bg-zinc-950"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{deal.title}</h3>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(deal.status)}`}
                        >
                          {deal.status}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {deal.property_address}, {deal.property_city}, {deal.property_state}
                        {deal.property_zip && ` ${deal.property_zip}`}
                      </p>
                      {deal.profiles?.display_name && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          Listed by: {deal.profiles.display_name}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/app/deals/${deal.id}`}
                      className="ml-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      View Details →
                    </Link>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Asking Price</p>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatPrice(deal.asking_price)}
                      </p>
                    </div>
                    {deal.arv && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">ARV</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatPrice(deal.arv)}
                        </p>
                      </div>
                    )}
                    {deal.square_feet && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Square Feet</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {deal.square_feet.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {(deal.bedrooms || deal.bathrooms) && (
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Beds / Baths</p>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {deal.bedrooms || "—"} / {deal.bathrooms || "—"}
                        </p>
                      </div>
                    )}
                  </div>

                  {deal.description && (
                    <div className="mb-4 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">{deal.description}</p>
                    </div>
                  )}

                  <DealApprovalForm dealId={deal.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Deals Overview */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">All Deals</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-600 dark:text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allDeals && allDeals.length > 0 ? (
                  (allDeals as Deal[]).map((deal) => (
                    <tr
                      key={deal.id}
                      className="border-b border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {deal.title}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {deal.property_city}, {deal.property_state}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                        {formatPrice(deal.asking_price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(deal.status)}`}
                        >
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/deals/${deal.id}`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      No deals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

