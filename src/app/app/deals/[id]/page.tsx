import { redirect, notFound } from "next/navigation";
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
  lot_size_acres: number | null;
  year_built: number | null;
  status: "draft" | "pending" | "approved" | "rejected" | "closed";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  profiles: {
    id: string;
    display_name: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor";
};

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
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

  // Fetch deal with wholesaler profile
  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      *,
      profiles:wholesaler_id (
        id,
        display_name
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !deal) {
    notFound();
  }

  const dealData = deal as Deal;

  // Check access permissions
  const isOwner = dealData.wholesaler_id === authData.user.id;
  const isAdmin = userRole === "admin";
  const canView =
    isAdmin ||
    (userRole === "investor" && dealData.status === "approved") ||
    (userRole === "wholesaler" && isOwner);

  if (!canView) {
    notFound();
  }

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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app/deals"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Deals
          </Link>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{dealData.title}</h1>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(dealData.status)}`}
              >
                {dealData.status}
              </span>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {dealData.property_address}, {dealData.property_city}, {dealData.property_state}
              {dealData.property_zip && ` ${dealData.property_zip}`}
            </p>
          </div>
          {isOwner && dealData.status !== "approved" && (
            <Link
              href={`/app/deals/${dealData.id}/edit`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Edit Deal
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {dealData.description && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Description</h2>
                <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{dealData.description}</p>
              </div>
            )}

            {/* Property Details */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Property Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                {dealData.property_type && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Property Type</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50 capitalize">{dealData.property_type}</dd>
                  </>
                )}
                {dealData.square_feet && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Square Feet</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      {dealData.square_feet.toLocaleString()}
                    </dd>
                  </>
                )}
                {dealData.bedrooms && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bedrooms</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">{dealData.bedrooms}</dd>
                  </>
                )}
                {dealData.bathrooms && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bathrooms</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">{dealData.bathrooms}</dd>
                  </>
                )}
                {dealData.lot_size_acres && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Lot Size</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                      {dealData.lot_size_acres.toFixed(2)} acres
                    </dd>
                  </>
                )}
                {dealData.year_built && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Year Built</dt>
                    <dd className="text-sm text-zinc-900 dark:text-zinc-50">{dealData.year_built}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Admin Notes (only visible to admin or owner) */}
            {dealData.admin_notes && (isAdmin || isOwner) && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Notes</h2>
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {dealData.admin_notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Financial Summary</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Asking Price</dt>
                  <dd className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatPrice(dealData.asking_price)}
                  </dd>
                </div>
                {dealData.arv && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">ARV</dt>
                    <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(dealData.arv)}
                    </dd>
                  </div>
                )}
                {dealData.repair_estimate && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Repair Estimate</dt>
                    <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(dealData.repair_estimate)}
                    </dd>
                  </div>
                )}
                {dealData.arv && dealData.repair_estimate && (
                  <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Potential Profit</dt>
                    <dd className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatPrice(dealData.arv - dealData.asking_price - dealData.repair_estimate)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Deal Info */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Deal Information</h2>
              <dl className="space-y-3 text-sm">
                {dealData.profiles?.display_name && (
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Listed By</dt>
                    <dd className="mt-1 text-zinc-900 dark:text-zinc-50">{dealData.profiles.display_name}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-zinc-600 dark:text-zinc-400">Created</dt>
                  <dd className="mt-1 text-zinc-900 dark:text-zinc-50">
                    {new Date(dealData.created_at).toLocaleDateString()}
                  </dd>
                </div>
                {dealData.approved_at && (
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Approved</dt>
                    <dd className="mt-1 text-zinc-900 dark:text-zinc-50">
                      {new Date(dealData.approved_at).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Inquiry Button (for investors viewing approved deals) */}
            {userRole === "investor" && dealData.status === "approved" && (
              <Link
                href={`/app/deals/${dealData.id}/inquiry`}
                className="block w-full rounded-md bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Express Interest
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

