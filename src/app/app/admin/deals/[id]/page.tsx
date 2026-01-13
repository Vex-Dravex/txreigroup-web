import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../../../components/AppHeader";
import DealApprovalForm from "../DealApprovalForm";
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

export default async function AdminDealReviewPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const dealId = resolvedParams.id;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

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

  const [dealResult, pendingDealsResult] = await Promise.all([
    supabase
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
      .single(),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  if (dealResult.error || !dealResult.data) {
    notFound();
  }

  const dealData = dealResult.data as Deal;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const parseAdditionalDetails = (description?: string | null) => {
    if (!description) return {};
    const marker = "Additional submission details:";
    const markerIndex = description.indexOf(marker);
    if (markerIndex === -1) return {};
    const detailLines = description
      .slice(markerIndex + marker.length)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "));

    return detailLines.reduce<Record<string, string>>((acc, line) => {
      const content = line.slice(2);
      const [rawKey, ...rest] = content.split(":");
      if (!rawKey || rest.length === 0) return acc;
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key) acc[key] = value;
      return acc;
    }, {});
  };

  const parseNumber = (value?: string | null) => {
    if (!value) return null;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatOptionalPrice = (value: number | null, fallback = "Not provided") => {
    if (value === null || value === undefined) return fallback;
    return formatPrice(value);
  };

  const formatOptionalPercent = (value: number | null, fallback = "Not provided") => {
    if (value === null || value === undefined) return fallback;
    return `${value.toFixed(1)}%`;
  };

  const formatOptionalNumber = (value: number | null, suffix = "", fallback = "Not provided") => {
    if (value === null || value === undefined) return fallback;
    return `${value.toLocaleString()}${suffix}`;
  };

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
  const additionalDetails = parseAdditionalDetails(dealData.description);
  const getDetail = (key: string) => additionalDetails[key.toLowerCase()];

  const estimatedRent = parseNumber(getDetail("estimated rent"));
  const purchasePrice = parseNumber(getDetail("purchase price")) ?? dealData.asking_price;
  const downPayment = parseNumber(getDetail("down payment"));
  const monthlyPayment = parseNumber(getDetail("monthly payment"));
  const balloonLength = parseNumber(getDetail("balloon length"));
  const remainingBalance = parseNumber(getDetail("remaining balance"));
  const interestRate = parseNumber(getDetail("interest rate"));
  const existingMonthlyPayment = parseNumber(getDetail("existing monthly payment"));
  const estimatedTaxes = parseNumber(getDetail("estimated taxes"));
  const estimatedInsurance = parseNumber(getDetail("estimated insurance"));
  const vacancy = parseNumber(getDetail("vacancy"));
  const managementCosts = parseNumber(getDetail("management costs"));

  const entryCost = downPayment ?? buyerEntryCost;
  const equity = remainingBalance !== null ? purchasePrice - remainingBalance : null;
  const equityPercentage =
    equity !== null && purchasePrice > 0 ? (equity / purchasePrice) * 100 : null;
  const rentOperatingCosts = estimatedRent !== null ? estimatedRent * 0.2 : null;
  const monthlyExpenses =
    (estimatedTaxes ?? 0) +
    (estimatedInsurance ?? 0) +
    (rentOperatingCosts ?? 0) +
    (vacancy ?? 0) +
    (managementCosts ?? 0);

  const mortgageMonthlyPayment = existingMonthlyPayment ?? monthlyPayment;
  const monthlyCashFlow =
    estimatedRent !== null && mortgageMonthlyPayment !== null
      ? estimatedRent - mortgageMonthlyPayment - monthlyExpenses
      : estimatedRent !== null
        ? estimatedRent - monthlyExpenses
        : null;
  const annualCashFlow = monthlyCashFlow !== null ? monthlyCashFlow * 12 : null;
  const cashOnCashReturn =
    annualCashFlow !== null && entryCost > 0 ? (annualCashFlow / entryCost) * 100 : null;

  const insuranceParsed = dealData.insurance_estimate_inputs
    ? insuranceEstimateInputSchema.safeParse(dealData.insurance_estimate_inputs)
    : null;
  const insuranceEstimate = insuranceParsed?.success ? estimateInsurance(insuranceParsed.data) : null;
  const insuranceMonthly = dealData.insurance_estimate_monthly ?? insuranceEstimate?.monthly ?? null;
  const insuranceAnnual = dealData.insurance_estimate_annual ?? insuranceEstimate?.annual ?? null;

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/app/admin/deals"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Deal Management
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/app/deals/${dealId}/edit`}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Edit Deal
            </Link>
            <Link
              href="/app/deals"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              View Off Market MLS
            </Link>
          </div>
        </div>

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
            {dealData.deal_type && (
              <div className="absolute left-4 top-4">
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${dealTypeInfo.color}`}>
                  {dealTypeInfo.label}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {dealData.description && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Property Description</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {dealData.description}
                </p>
              </div>
            )}

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

            {dealData.admin_notes && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Admin Notes</h2>
                <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                  {dealData.admin_notes}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 shadow-sm dark:border-blue-400 dark:bg-blue-950/20">
              <div className="mb-2 text-sm font-medium text-blue-700 dark:text-blue-300">Buyer Entry Cost</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {formatPrice(buyerEntryCost)}
              </div>
            </div>

            <div
              className={`rounded-lg border p-6 shadow-sm ${dealData.deal_type === "seller_finance"
                  ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
                  : dealData.deal_type === "mortgage_takeover"
                    ? "border-purple-200 bg-purple-50/70 dark:border-purple-900/60 dark:bg-purple-950/30"
                    : dealData.deal_type === "trust_acquisition"
                      ? "border-orange-200 bg-orange-50/70 dark:border-orange-900/60 dark:bg-orange-950/30"
                      : "border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/30"
                }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Deal Summary</h2>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                  {dealTypeInfo.label}
                </span>
              </div>
              {dealData.deal_type === "cash_deal" && (
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Purchase Price</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatPrice(dealData.asking_price)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Estimated Repairs</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(dealData.repair_estimate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">ARV</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(dealData.arv)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Spread</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {dealData.arv && dealData.repair_estimate
                        ? formatPrice(dealData.arv - dealData.asking_price - dealData.repair_estimate)
                        : "Not provided"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Estimated Insurance <span className="text-[10px] uppercase tracking-wide">(Estimate only)</span>
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {insuranceMonthly !== null && insuranceAnnual !== null
                        ? `${formatPrice(insuranceMonthly)} / mo (${formatPrice(insuranceAnnual)} / yr)`
                        : "Not provided"}
                    </dd>
                  </div>
                </dl>
              )}

              {dealData.deal_type === "seller_finance" && (
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Purchase Price</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(purchasePrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Down Payment</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(entryCost)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Monthly Payment</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(monthlyPayment)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Balloon Length</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalNumber(balloonLength, " months")}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Interest Rate</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPercent(interestRate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Estimated Rent</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedRent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Taxes</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedTaxes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Insurance</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedInsurance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Ops Reserve (20% rent)</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(rentOperatingCosts)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Monthly Cash Flow</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {monthlyCashFlow !== null ? formatPrice(monthlyCashFlow) : "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Yearly Cash Flow</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {annualCashFlow !== null ? formatPrice(annualCashFlow) : "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Cash-on-Cash Return</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {formatOptionalPercent(cashOnCashReturn)}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Estimated Insurance <span className="text-[10px] uppercase tracking-wide">(Estimate only)</span>
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {insuranceMonthly !== null && insuranceAnnual !== null
                        ? `${formatPrice(insuranceMonthly)} / mo (${formatPrice(insuranceAnnual)} / yr)`
                        : "Not provided"}
                    </dd>
                  </div>
                </dl>
              )}

              {(dealData.deal_type === "mortgage_takeover" || dealData.deal_type === "trust_acquisition") && (
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Mortgage Balance</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(remainingBalance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Down Payment</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(entryCost)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Equity Percentage</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {formatOptionalPercent(equityPercentage)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Principal &amp; Interest</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(existingMonthlyPayment)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Taxes</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedTaxes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Insurance</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedInsurance)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Ops Reserve (20% rent)</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(rentOperatingCosts)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Estimated Rent</dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatOptionalPrice(estimatedRent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Cash-on-Cash Return</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {formatOptionalPercent(cashOnCashReturn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">Monthly Cash Flow</dt>
                    <dd className="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-300">
                      {monthlyCashFlow !== null ? formatPrice(monthlyCashFlow) : "Not provided"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-zinc-600 dark:text-zinc-400">
                      Estimated Insurance <span className="text-[10px] uppercase tracking-wide">(Estimate only)</span>
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {insuranceMonthly !== null && insuranceAnnual !== null
                        ? `${formatPrice(insuranceMonthly)} / mo (${formatPrice(insuranceAnnual)} / yr)`
                        : "Not provided"}
                    </dd>
                  </div>
                </dl>
              )}

              {insuranceEstimate && (
                <details className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <summary className="cursor-pointer">How we calculate insurance</summary>
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
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Calculations reflect submitted inputs; missing fields show as not provided.
              </p>
              <div className="mt-4 rounded-md border border-zinc-200 bg-white/70 p-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Approve / Reject
                </div>
                <DealApprovalForm dealId={dealData.id} />
              </div>
            </div>

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

            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Deal Information</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-zinc-600 dark:text-zinc-400">Submitted</dt>
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
          </div>
        </div>
      </div>
    </div>
  );
}
