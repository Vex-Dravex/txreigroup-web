import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { estimateInsurance, insuranceEstimateInputSchema } from "@/lib/insurance/estimateInsurance";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type DealType = "cash_deal" | "seller_finance" | "mortgage_takeover" | "trust_acquisition";

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
  buyer_entry_cost?: number;
  deal_type?: DealType;
  arv: number | null;
  repair_estimate: number | null;
  square_feet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lot_size_acres: number | null;
  year_built: number | null;
  replacement_cost_override?: number | null;
  insurance_estimate_annual?: number | null;
  insurance_estimate_monthly?: number | null;
  insurance_estimate_inputs?: Record<string, unknown> | null;
  insurance_estimate_updated_at?: string | null;
  property_image_url?: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "closed";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  profiles: {
    id: string;
    display_name: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name?: string | null;
  avatar_url?: string | null;
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Handle both Promise and direct params (Next.js 13+ vs 15+)
  const resolvedParams = await Promise.resolve(params);
  const dealId = resolvedParams.id;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  // Fetch deal with wholesaler profile
  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      *,
      profiles:wholesaler_id (
        id,
        display_name,
        email,
        phone
      )
    `)
    .eq("id", dealId)
    .single();

  // Handle example listings (for demo)
  const exampleListings: Record<string, Deal> = {
    "example-1": {
      id: "example-1",
      wholesaler_id: "example-wholesaler-1",
      title: "Fixer Upper in Prime Location",
      description: "Great investment opportunity in growing neighborhood. This property needs some TLC but has excellent potential. Located in a desirable area with good schools and amenities nearby. Perfect for investors looking to flip or hold as a rental property.\n\nProperty features:\n- Solid foundation\n- Good roof condition\n- Needs cosmetic updates\n- Large backyard\n- Close to shopping and dining",
      property_address: "1234 Oak Street",
      property_city: "Dallas",
      property_state: "TX",
      property_zip: "75201",
      property_type: "Single Family",
      asking_price: 85000,
      buyer_entry_cost: 15000,
      deal_type: "cash_deal",
      arv: 180000,
      repair_estimate: 35000,
      square_feet: 1850,
      bedrooms: 3,
      bathrooms: 2,
      lot_size_acres: 0.25,
      year_built: 1985,
      property_image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-1",
        display_name: "John Smith",
        email: "john@example.com",
        phone: "(214) 555-0123",
      },
    },
    "example-2": {
      id: "example-2",
      wholesaler_id: "example-wholesaler-2",
      title: "Seller Finance Opportunity",
      description: "Owner willing to finance - low down payment required. This is a rare opportunity to acquire a property with seller financing. The owner is motivated and flexible on terms.\n\nBenefits:\n- Low down payment\n- Flexible terms\n- Owner financing available\n- Great location\n- Move-in ready condition",
      property_address: "5678 Maple Avenue",
      property_city: "Houston",
      property_state: "TX",
      property_zip: "77001",
      property_type: "Townhouse",
      asking_price: 120000,
      buyer_entry_cost: 25000,
      deal_type: "seller_finance",
      arv: 195000,
      repair_estimate: 28000,
      square_feet: 1650,
      bedrooms: 2,
      bathrooms: 2.5,
      lot_size_acres: 0.15,
      year_built: 2010,
      property_image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-2",
        display_name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "(713) 555-0456",
      },
    },
    "example-3": {
      id: "example-3",
      wholesaler_id: "example-wholesaler-3",
      title: "Mortgage Takeover Deal",
      description: "Assumable mortgage with low interest rate. This property has an assumable FHA loan with a great interest rate. Perfect for investors looking to minimize financing costs.\n\nDetails:\n- Assumable FHA loan\n- Low interest rate\n- Good terms\n- Property in good condition\n- Great investment potential",
      property_address: "9012 Pine Road",
      property_city: "Austin",
      property_state: "TX",
      property_zip: "78701",
      property_type: "Single Family",
      asking_price: 95000,
      buyer_entry_cost: 20000,
      deal_type: "mortgage_takeover",
      arv: 220000,
      repair_estimate: 42000,
      square_feet: 2100,
      bedrooms: 4,
      bathrooms: 3,
      lot_size_acres: 0.3,
      year_built: 1995,
      property_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-3",
        display_name: "Mike Davis",
        email: "mike@example.com",
        phone: "(512) 555-0789",
      },
    },
    "example-4": {
      id: "example-4",
      wholesaler_id: "example-wholesaler-4",
      title: "Trust Acquisition Property",
      description: "Estate sale property - quick close possible. This property is being sold through a trust and the executor wants a quick sale. Great opportunity for investors.\n\nHighlights:\n- Estate sale\n- Quick close possible\n- Good condition\n- Prime location\n- Investment potential",
      property_address: "3456 Elm Street",
      property_city: "San Antonio",
      property_state: "TX",
      property_zip: "78201",
      property_type: "Single Family",
      asking_price: 75000,
      buyer_entry_cost: 18000,
      deal_type: "trust_acquisition",
      arv: 165000,
      repair_estimate: 30000,
      square_feet: 1750,
      bedrooms: 3,
      bathrooms: 2,
      lot_size_acres: 0.2,
      year_built: 1988,
      property_image_url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-4",
        display_name: "Lisa Anderson",
        email: "lisa@example.com",
        phone: "(210) 555-0321",
      },
    },
    "example-5": {
      id: "example-5",
      wholesaler_id: "example-wholesaler-5",
      title: "Cash Deal - Below Market",
      description: "Motivated seller, needs quick sale. This property is priced well below market value. The seller needs to close quickly, making this an excellent opportunity for cash buyers.\n\nWhy this is a great deal:\n- Below market price\n- Motivated seller\n- Quick close\n- Good location\n- Solid investment",
      property_address: "7890 Cedar Lane",
      property_city: "Fort Worth",
      property_state: "TX",
      property_zip: "76101",
      property_type: "Single Family",
      asking_price: 68000,
      buyer_entry_cost: 12000,
      deal_type: "cash_deal",
      arv: 150000,
      repair_estimate: 25000,
      square_feet: 1600,
      bedrooms: 3,
      bathrooms: 2,
      lot_size_acres: 0.22,
      year_built: 1992,
      property_image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-5",
        display_name: "Robert Wilson",
        email: "robert@example.com",
        phone: "(817) 555-0654",
      },
    },
    "example-6": {
      id: "example-6",
      wholesaler_id: "example-wholesaler-6",
      title: "Seller Finance - Great Terms",
      description: "Owner financing available, flexible terms. The owner is offering excellent financing terms for qualified buyers. This is a great opportunity for investors who want to minimize upfront costs.\n\nFinancing details:\n- Owner financing available\n- Flexible terms\n- Low down payment\n- Competitive rates\n- Property in good condition",
      property_address: "2345 Birch Boulevard",
      property_city: "Plano",
      property_state: "TX",
      property_zip: "75023",
      property_type: "Single Family",
      asking_price: 110000,
      buyer_entry_cost: 22000,
      deal_type: "seller_finance",
      arv: 200000,
      repair_estimate: 38000,
      square_feet: 1950,
      bedrooms: 3,
      bathrooms: 2.5,
      lot_size_acres: 0.28,
      year_built: 2005,
      property_image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
      status: "approved",
      admin_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      profiles: {
        id: "example-wholesaler-6",
        display_name: "Jennifer Martinez",
        email: "jennifer@example.com",
        phone: "(972) 555-0987",
      },
    },
  };

  let dealData: Deal | null = null;

  // Check if it's an example listing
  if (dealId && dealId.startsWith("example-") && exampleListings[dealId]) {
    dealData = exampleListings[dealId];
  } else {
    // Fetch from database
    if (error || !deal) {
      notFound();
    }
    dealData = deal as Deal;
  }

  if (!dealData) {
    notFound();
  }

  // Check access permissions (skip for example listings)
  if (dealId && !dealId.startsWith("example-")) {
    const isOwner = dealData.wholesaler_id === authData.user.id;
    const isAdmin = hasRole(roles, "admin");
    const canView =
      isAdmin ||
      (hasRole(roles, "investor") && dealData.status === "approved") ||
      (hasRole(roles, "wholesaler") && isOwner);

    if (!canView) {
      notFound();
    }
  }

  const isOwner = dealData.wholesaler_id === authData.user.id;
  const isAdmin = hasRole(roles, "admin");

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Deal type badge colors and labels
  const getDealTypeInfo = (dealType?: DealType) => {
    switch (dealType) {
      case "cash_deal":
        return { label: "Cash Deal", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
      case "seller_finance":
        return { label: "Seller Finance", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
      case "mortgage_takeover":
        return { label: "Mortgage Takeover", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };
      case "trust_acquisition":
        return { label: "Trust Acquisition", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
      default:
        return { label: "Cash Deal", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
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

  const dealTypeInfo = getDealTypeInfo(dealData.deal_type);
  const buyerEntryCost = dealData.buyer_entry_cost || dealData.asking_price * 0.2;
  const insuranceParsed = dealData.insurance_estimate_inputs
    ? insuranceEstimateInputSchema.safeParse(dealData.insurance_estimate_inputs)
    : null;
  const insuranceEstimate = insuranceParsed?.success ? estimateInsurance(insuranceParsed.data) : null;
  const insuranceMonthly = dealData.insurance_estimate_monthly ?? insuranceEstimate?.monthly ?? null;
  const insuranceAnnual = dealData.insurance_estimate_annual ?? insuranceEstimate?.annual ?? null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="deals"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/app/deals"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Off Market MLS
          </Link>
        </div>

        {/* Property Image */}
        <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="relative h-96 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            {dealData.property_image_url ? (
              <img
                src={dealData.property_image_url}
                alt={dealData.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
            {/* Deal Type Badge on Image */}
            {dealData.deal_type && (
              <div className="absolute left-4 top-4">
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${dealTypeInfo.color}`}>
                  {dealTypeInfo.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">{dealData.title}</h1>
            <p className="mb-4 text-xl text-zinc-600 dark:text-zinc-400">
              {dealData.property_address}, {dealData.property_city}, {dealData.property_state}
              {dealData.property_zip && ` ${dealData.property_zip}`}
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(dealData.status)}`}
              >
                {dealData.status}
              </span>
            </div>
          </div>
          {isOwner && dealData.status !== "approved" && dealId && !dealId.startsWith("example-") && (
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
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Property Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {dealData.description}
                </p>
              </div>
            )}

            {/* Property Details */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Property Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                {dealData.property_type && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Property Type</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50 capitalize">
                      {dealData.property_type}
                    </dd>
                  </>
                )}
                {dealData.square_feet && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Square Feet</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {dealData.square_feet.toLocaleString()} sq ft
                    </dd>
                  </>
                )}
                {dealData.bedrooms && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bedrooms</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{dealData.bedrooms}</dd>
                  </>
                )}
                {dealData.bathrooms && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bathrooms</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{dealData.bathrooms}</dd>
                  </>
                )}
                {dealData.lot_size_acres && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Lot Size</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {dealData.lot_size_acres.toFixed(2)} acres
                    </dd>
                  </>
                )}
                {dealData.year_built && (
                  <>
                    <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Year Built</dt>
                    <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{dealData.year_built}</dd>
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
            {/* Buyer Entry Cost - Prominently Displayed */}
            <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 shadow-sm dark:border-blue-400 dark:bg-blue-950/20">
              <div className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">Buyer Entry Cost</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatPrice(buyerEntryCost)}
              </div>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/30">
              <div className="mb-1 text-sm font-semibold text-indigo-900 dark:text-indigo-200">Estimated Insurance</div>
              <div className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                Estimate only
              </div>
              {insuranceMonthly !== null && insuranceAnnual !== null ? (
                <>
                  <div className="mt-2 text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {formatPrice(insuranceMonthly)} / mo
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-200">
                    {formatPrice(insuranceAnnual)} / yr
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-200">Not provided</p>
              )}
              {insuranceEstimate && (
                <details className="mt-3 text-xs text-indigo-700 dark:text-indigo-200">
                  <summary className="cursor-pointer">How we calculate</summary>
                  <div className="mt-2 space-y-1">
                    <div>Replacement cost: {formatPrice(insuranceEstimate.replacementCost)}</div>
                    <div>Cost per sqft: {formatPrice(insuranceEstimate.breakdown.costPerSqft)}</div>
                    <div>Base rate: {(insuranceEstimate.breakdown.baseRate * 100).toFixed(2)}%</div>
                    {insuranceEstimate.breakdown.baseRateAdjustments.length > 0 && (
                      <div>Adjustments: {insuranceEstimate.breakdown.baseRateAdjustments.join(", ")}</div>
                    )}
                    <div>Occupancy multiplier: {insuranceEstimate.breakdown.occupancyMultiplier.toFixed(2)}x</div>
                    <div>Deductible multiplier: {insuranceEstimate.breakdown.deductibleMultiplier.toFixed(2)}x</div>
                    <div>Risk multiplier: {insuranceEstimate.breakdown.riskMultiplier.toFixed(2)}x</div>
                  </div>
                </details>
              )}
            </div>

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

            {/* Contact Information */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contact Wholesaler</h2>
              {dealData.profiles?.display_name && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Name</div>
                  <div className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {dealData.profiles.display_name}
                  </div>
                </div>
              )}
              {dealData.profiles?.email && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email</div>
                  <a
                    href={`mailto:${dealData.profiles.email}`}
                    className="mt-1 block text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {dealData.profiles.email}
                  </a>
                </div>
              )}
              {dealData.profiles?.phone && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Phone</div>
                  <a
                    href={`tel:${dealData.profiles.phone.replace(/\D/g, "")}`}
                    className="mt-1 block text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {dealData.profiles.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Deal Info */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Deal Information</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-zinc-600 dark:text-zinc-400">Listed</dt>
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
            {hasRole(roles, "investor") && dealData.status === "approved" && (
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
