import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import ServiceFilters from "./ServiceFilters";
import { VendorListing } from "../contractors/types";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { exampleTransactionServices } from "./sampleTransactionServices";
import FadeIn, { FadeInStagger } from "../../components/FadeIn";

export const dynamic = "force-dynamic";

type SearchParams = {
  workType?: string;
  market?: string;
  verified?: string;
  q?: string;
};

const BASE_SERVICE_TYPES = [
  "Title Company",
  "Escrow Officer",
  "Private Money Lender",
  "Gator",
  "Transaction Coordinator",
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

export default async function TransactionServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const userRole = getPrimaryRole(roles, profileData?.role || "investor");

  const selectedWorkTypes = parseListParam(resolvedSearchParams.workType);
  const selectedMarkets = parseListParam(resolvedSearchParams.market);
  const verifiedOnly = resolvedSearchParams.verified === "true";
  const keyword = (resolvedSearchParams.q || "").toLowerCase().trim();

  const filteredServices = exampleTransactionServices
    .filter((service) => {
      const matchesWorkType =
        selectedWorkTypes.length === 0 ||
        selectedWorkTypes.some((type) =>
          service.workTypes.some((workType) => workType.toLowerCase() === type.toLowerCase())
        );

      const matchesMarket =
        selectedMarkets.length === 0 ||
        selectedMarkets.some((market) =>
          service.marketAreas.some((area) => area.toLowerCase() === market.toLowerCase())
        );

      const matchesVerified = !verifiedOnly || service.verificationStatus === "verified";

      const matchesKeyword =
        !keyword ||
        [
          service.name,
          service.description || "",
          service.tagline || "",
          service.workTypes.join(" "),
          service.marketAreas.join(" "),
          service.location || "",
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
    new Set([...BASE_SERVICE_TYPES, ...exampleTransactionServices.flatMap((service) => service.workTypes)])
  ).sort();
  const availableMarkets = Array.from(
    new Set([...BASE_MARKET_AREAS, ...exampleTransactionServices.flatMap((service) => service.marketAreas)])
  ).sort();

  const verifiedCount = exampleTransactionServices.filter((service) => service.verificationStatus === "verified").length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      {/* Background Gradient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <AppHeader
          userRole={userRole}
          currentPage="transaction-services"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <FadeInStagger className="grid gap-12 lg:grid-cols-12 lg:items-start mb-16">
            <FadeIn className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200/50 backdrop-blur-sm dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Partner Network
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-display italic leading-[0.9]">
                Title, Escrow, and <br />
                <span className="text-blue-600 not-italic">Funding Partners</span>
              </h1>

              <p className="max-w-2xl text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Connect with elite partners well-versed in Creative Finance, ready to help you facilitate your closings and scale your portfolio.
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:col-span-5">
              <div className="rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-xl shadow-blue-500/5 backdrop-blur-md ring-1 ring-white/60 dark:border-white/5 dark:bg-zinc-900/30 dark:shadow-black/50 dark:ring-white/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-zinc-50 tracking-tighter">Network Pulse</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">Live Statistics</p>
                  </div>
                  <div className="flex -space-x-4">
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg dark:border-zinc-800" />
                    <div className="h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg dark:border-zinc-800" />
                    <div className="h-12 w-12 items-center justify-center flex rounded-full border-2 border-white bg-white/80 text-[10px] font-black dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 shadow-lg backdrop-blur-sm">
                      +15
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group rounded-2xl bg-white/60 p-5 transition-all hover:bg-blue-600 hover:scale-[1.02] dark:bg-zinc-900/60 dark:hover:bg-blue-600">
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 group-hover:text-blue-100 transition-colors">Verified Partners</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-4xl font-black text-zinc-950 dark:text-zinc-50 font-display group-hover:text-white transition-colors">{verifiedCount}</p>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse group-hover:bg-white" />
                    </div>
                  </div>
                  <div className="group rounded-2xl bg-white/60 p-5 transition-all hover:bg-blue-600 hover:scale-[1.02] dark:bg-zinc-900/60 dark:hover:bg-blue-600">
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 group-hover:text-blue-100 transition-colors">Specialties</p>
                    <p className="mt-1 text-4xl font-black text-zinc-950 dark:text-zinc-50 font-display group-hover:text-white transition-colors">{availableWorkTypes.length}</p>
                  </div>
                  <div className="group rounded-2xl bg-white/60 p-5 transition-all hover:bg-blue-600 hover:scale-[1.02] dark:bg-zinc-900/60 dark:hover:bg-blue-600">
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 group-hover:text-blue-100 transition-colors">Service Regions</p>
                    <p className="mt-1 text-4xl font-black text-zinc-950 dark:text-zinc-50 font-display group-hover:text-white transition-colors">{availableMarkets.length}</p>
                  </div>
                  <div className="group rounded-2xl bg-emerald-500/10 p-5 transition-all hover:bg-emerald-600 hover:scale-[1.02] dark:bg-emerald-500/5 dark:hover:bg-emerald-600">
                    <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600 group-hover:text-emerald-50 transition-colors">Investor Ready</p>
                    <p className="mt-1 text-4xl font-black text-emerald-600 dark:text-emerald-400 font-display group-hover:text-white transition-colors">Pro</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </FadeInStagger>

          <FadeIn delay={0.4}>
            <ServiceFilters
              activeVendors={filteredServices}
              availableWorkTypes={availableWorkTypes}
              availableMarkets={availableMarkets}
            />
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
