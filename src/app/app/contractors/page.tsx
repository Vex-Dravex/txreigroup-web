import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import VendorFilters from "./VendorFilters";
import VendorCard from "./VendorCard";
import { VendorListing } from "./types";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { exampleVendors } from "./sampleVendors";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ContractorProfile = {
  id: string;
  business_name: string;
  business_city: string | null;
  business_state: string | null;
  service_areas: string[] | null;
  bio: string | null;
  verification_status: "pending" | "verified" | "rejected";
  logo_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  profiles: {
    display_name: string | null;
  } | null;
  contractor_services: {
    service_name: string;
  }[];
};

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name: string | null;
  avatar_url: string | null;
};

type SearchParams = {
  workType?: string;
  market?: string;
  verified?: string;
  q?: string;
};

const BASE_WORK_TYPES = [
  "General Contracting",
  "Plumbing",
  "Electrical",
  "Drywall & Paint",
  "Roofing",
  "Landscaping",
  "HVAC",
  "Flooring",
  "Framing & Carpentry",
];

const BASE_MARKET_AREAS = [
  "Dallas-Fort Worth",
  "Austin",
  "Houston",
  "San Antonio",
  "Texas Hill Country",
  "Coastal Texas",
  "West Texas",
];

function parseListParam(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ContractorsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedSearchParams = await searchParams;
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
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");
  const isVendor = hasRole(roles, "contractor");

  let contractorsData: ContractorProfile[] = [];

  try {
    let contractorsQuery = supabase
      .from("contractor_profiles")
      .select(
        `
        *,
        profiles:id (
          display_name
        ),
        contractor_services (
          service_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (hasRole(roles, "investor") && !hasRole(roles, "admin") && !isVendor) {
      contractorsQuery = contractorsQuery.eq("verification_status", "verified");
    }

    const { data: contractors, error } = await contractorsQuery;

    if (error) {
      console.warn("Error fetching contractors (showing sample vendors instead):", error?.message || error);
    } else if (contractors) {
      contractorsData = contractors as ContractorProfile[];
    }
  } catch (error) {
    console.warn("Error loading contractors (showing sample vendors instead):", error);
  }

  const mappedVendors: VendorListing[] = contractorsData.map((contractor) => {
    const location = [contractor.business_city, contractor.business_state].filter(Boolean).join(", ");
    const marketAreas =
      contractor.service_areas && contractor.service_areas.length > 0
        ? contractor.service_areas
        : location
          ? [location]
          : [];

    const workTypes =
      contractor.contractor_services && contractor.contractor_services.length > 0
        ? contractor.contractor_services.map((service) => service.service_name)
        : ["General Contracting"];

    return {
      id: contractor.id,
      name: contractor.business_name,
      tagline: contractor.verification_status === "verified" ? "Verified vendor" : "Pending verification",
      description: contractor.bio,
      location: location || null,
      marketAreas,
      workTypes,
      verificationStatus: contractor.verification_status,
      contact: {
        name: contractor.profiles?.display_name || contractor.business_name,
        email: contractor.contact_email || null,
        phone: contractor.contact_phone || null,
        website: contractor.website_url || null,
      },
      logoUrl: contractor.logo_url || null,
      pastProjects: [
        {
          title: "Investor project support",
          location: location || "Texas",
          referenceName: contractor.business_name,
          description: contractor.bio || "References available upon request.",
        },
      ],
    };
  });

  const allVendors: VendorListing[] = [...mappedVendors, ...exampleVendors];

  const selectedWorkTypes = parseListParam(resolvedSearchParams.workType);
  const selectedMarkets = parseListParam(resolvedSearchParams.market);
  const verifiedOnly = resolvedSearchParams.verified === "true";
  const keyword = (resolvedSearchParams.q || "").toLowerCase().trim();

  const filteredVendors = allVendors
    .filter((vendor) => {
      const matchesWorkType =
        selectedWorkTypes.length === 0 ||
        selectedWorkTypes.some((type) =>
          vendor.workTypes.some((workType) => workType.toLowerCase() === type.toLowerCase())
        );

      const matchesMarket =
        selectedMarkets.length === 0 ||
        selectedMarkets.some((market) =>
          vendor.marketAreas.some((area) => area.toLowerCase() === market.toLowerCase())
        );

      const matchesVerified = !verifiedOnly || vendor.verificationStatus === "verified";

      const matchesKeyword =
        !keyword ||
        [
          vendor.name,
          vendor.description || "",
          vendor.tagline || "",
          vendor.workTypes.join(" "),
          vendor.marketAreas.join(" "),
          vendor.location || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesWorkType && matchesMarket && matchesVerified && matchesKeyword;
    })
    .sort((a, b) => {
      if (a.verificationStatus !== b.verificationStatus) {
        return a.verificationStatus === "verified" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  const availableWorkTypes = Array.from(
    new Set([...BASE_WORK_TYPES, ...allVendors.flatMap((vendor) => vendor.workTypes)])
  ).sort();
  const availableMarkets = Array.from(
    new Set([...BASE_MARKET_AREAS, ...allVendors.flatMap((vendor) => vendor.marketAreas)])
  ).sort();

  const verifiedCount = allVendors.filter((vendor) => vendor.verificationStatus === "verified").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="contractors"
        avatarUrl={profileData?.avatar_url || null}
        displayName={profileData?.display_name || null}
        email={authData.user.email}
      />

      <section className="border-b border-zinc-200/70 bg-white/60 py-12 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-900/50">
                Vendor marketplace
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                Validated vendors for investor projects
              </h1>
              <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
                Find contractor teams that already know how to work with investors, hard-money draws, and fast turns.
                Filter by trade and market, see references, and reach out directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/app/deals"
                  className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  View investor deals
                </Link>
                {isVendor ? (
                  <Link
                    href="/app/contractors/profile"
                    className="rounded-md border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    My vendor profile
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Refer a vendor
                  </Link>
                )}
              </div>
              <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  <p>
                    Verified vendors come with references and recent investor jobs so you can move quickly.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span>
                  <p>Filter by trade, market, and verification level similar to the Off Market MLS experience.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-blue-50 p-6 shadow-lg ring-1 ring-inset ring-white/70 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950/30 dark:ring-black/30">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Marketplace pulse</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Verified vendors</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{verifiedCount}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Active across Texas markets</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Trades covered</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {availableWorkTypes.length}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">From GC to specialty subs</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Markets</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{availableMarkets.length}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">DFW, Austin, San Antonio + more</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Avg. response</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">Under 24h</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">For investor outreach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              Vendor directory
            </p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Showing {filteredVendors.length} vendors
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Filter by trade, market area, verification, or keyword to find the right crew.
            </p>
          </div>
          {isVendor && (
            <Link
              href="/app/contractors/profile"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Update my vendor profile
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.25 3A1.25 1.25 0 0 0 3 4.25v11.5C3 16.66 3.56 17 4.25 17h11.5c.69 0 1.25-.34 1.25-1.25V4.25C17 3.56 16.44 3 15.75 3H4.25ZM14 7.5a.75.75 0 0 1 0 1.5H8.56l2.22 2.22a.75.75 0 0 1-1.06 1.06l-3.5-3.5a.75.75 0 0 1 0-1.06l3.5-3.5a.75.75 0 0 1 1.06 1.06L8.56 7.5H14Z" />
              </svg>
            </Link>
          )}
        </div>

        <VendorFilters availableWorkTypes={availableWorkTypes} availableMarkets={availableMarkets}>
          {filteredVendors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/60 p-10 text-center text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
              No vendors match those filters yet. Try clearing filters or choosing a nearby market.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          )}
        </VendorFilters>
      </div>
    </div>
  );
}
