import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import VendorFilters from "./VendorFilters";
import VendorCard from "./VendorCard";
import { VendorListing } from "./types";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { exampleVendors } from "./sampleVendors";
import FadeIn, { FadeInStagger } from "../../../components/FadeIn";
import ContractorsTutorial from "./ContractorsTutorial"; // IMPORT TUTORIAL

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

  if (!authData.user) redirect("/login?mode=signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const profileData = profile as Profile | null;
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  // USE EXAMPLE VENDORS ONLY
  const allVendors: VendorListing[] = [...exampleVendors];

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
      <ContractorsTutorial />
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      {/* Background Gradient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <AppHeader
          userRole={userRole}
          currentPage="contractors"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <FadeInStagger className="grid gap-12 lg:grid-cols-12 lg:items-start mb-16">
            <FadeIn className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-200/50 backdrop-blur-sm dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/30">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-display leading-tight">
                Trusted <span className="text-emerald-600 dark:text-emerald-500">Pros</span> for<br />
                Investor Projects
              </h1>

              <p className="max-w-2xl text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Find contractor teams that understand the speed and budget requirements of real estate investing.
                Vetted for reliability and quality.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:col-span-5">
              <div className="rounded-[2rem] border border-white/40 bg-white/30 p-6 shadow-xl shadow-zinc-200/50 backdrop-blur-md ring-1 ring-white/60 dark:border-white/5 dark:bg-zinc-900/30 dark:shadow-black/50 dark:ring-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-100">Marketplace Pulse</h3>
                  <div className="flex -space-x-2">
                    {/* Decorative avatars or circles */}
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-700" />
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-zinc-300 dark:border-zinc-800 dark:bg-zinc-600" />
                    <div className="h-8 w-8 items-center justify-center flex rounded-full border-2 border-white bg-zinc-100 text-[10px] font-bold dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
                      +12
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group rounded-2xl bg-white/60 p-4 transition-all hover:bg-white/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80">
                    <p className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-500">Verified Pros</p>
                    <p className="mt-1 text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display group-hover:scale-110 origin-left transition-transform">{verifiedCount}</p>
                  </div>
                  <div className="group rounded-2xl bg-white/60 p-4 transition-all hover:bg-white/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80">
                    <p className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-500">Trades</p>
                    <p className="mt-1 text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display group-hover:scale-110 origin-left transition-transform">{availableWorkTypes.length}</p>
                  </div>
                  <div className="group rounded-2xl bg-white/60 p-4 transition-all hover:bg-white/80 dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80">
                    <p className="text-xs uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-500">Markets</p>
                    <p className="mt-1 text-3xl font-black text-zinc-900 dark:text-zinc-50 font-display group-hover:scale-110 origin-left transition-transform">{availableMarkets.length}</p>
                  </div>
                  <div className="group rounded-2xl bg-emerald-100/50 p-4 transition-all hover:bg-emerald-100/70 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30">
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">Response</p>
                    <p className="mt-1 text-3xl font-black text-emerald-800 dark:text-emerald-300 font-display group-hover:scale-110 origin-left transition-transform">&lt; 24h</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </FadeInStagger>

          <FadeIn delay={0.4}>
            <VendorFilters
              availableWorkTypes={availableWorkTypes}
              availableMarkets={availableMarkets}
              activeVendors={filteredVendors}
            />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
