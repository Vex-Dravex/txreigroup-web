import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import ServiceFilters from "./ServiceFilters";
import VendorCard from "../contractors/VendorCard";
import { VendorListing } from "../contractors/types";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";

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

const exampleServices: VendorListing[] = [
  {
    id: "ts-1",
    name: "Bayou Title Partners",
    tagline: "Investor-first title team with fast turn commitments",
    description:
      "Investor-focused title searches, mobile notary coordination, and weekly closing windows for high-volume portfolios.",
    location: "Houston, TX",
    marketAreas: ["Houston", "Coastal Texas"],
    workTypes: ["Title Company"],
    verificationStatus: "verified",
    contact: {
      name: "Alyssa Kim",
      phone: "(713) 555-0145",
      email: "investors@bayoutitle.com",
      website: "https://bayoutitle.com",
    },
    logoUrl: "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=200&q=80",
    pastProjects: [
      {
        title: "20-door portfolio closings",
        location: "Houston Metro",
        budget: "$1.3M",
        referenceName: "Harbor Lane Capital",
        description: "Handled sequential cash-out refis and coordinated title curatives across five counties.",
      },
    ],
  },
  {
    id: "ts-2",
    name: "Lone Star Escrow Co.",
    tagline: "Escrow officers who keep assignment deals moving",
    description:
      "Experienced in wholesale assignments, double closes, and investor-friendly escrow workflows with transparent timelines.",
    location: "Dallas, TX",
    marketAreas: ["Dallas-Fort Worth", "Austin"],
    workTypes: ["Escrow Officer"],
    verificationStatus: "verified",
    contact: {
      name: "Derrick Fuentes",
      phone: "(214) 555-0179",
      email: "derick@lsescrow.com",
      website: "https://lsescrow.com",
    },
    logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=200&q=80",
    pastProjects: [
      {
        title: "Assignment-friendly closings",
        location: "DFW Metroplex",
        budget: "$620k",
        referenceName: "Peak Wholesale Group",
        description: "Coordinated simultaneous closes for 12 wholesale assignments in under 60 days.",
      },
    ],
  },
  {
    id: "ts-3",
    name: "Cedar Capital Private Money",
    tagline: "Fast approvals for buy-and-hold investors",
    description:
      "Bridge and private money options for acquisitions, rehab, and portfolio refinances with 48-hour term sheets.",
    location: "Austin, TX",
    marketAreas: ["Austin", "Texas Hill Country", "San Antonio"],
    workTypes: ["Private Money Lender"],
    verificationStatus: "verified",
    contact: {
      name: "Monica Perez",
      phone: "(512) 555-0122",
      email: "monica@cedarcapital.com",
      website: "https://cedarcapital.com",
    },
    logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=200&q=80",
    pastProjects: [
      {
        title: "Bridge lending for STR renovation",
        location: "Fredericksburg, TX",
        budget: "$410k",
        referenceName: "Vista REI Holdings",
        description: "Funded in 10 days with rehab draws structured for short-term rental timelines.",
      },
    ],
  },
  {
    id: "ts-4",
    name: "Sunset Gator Buyers",
    tagline: "Close-ready cash buyers across Texas metros",
    description:
      "Cash buyer network with clear criteria, quick inspections, and reliable closing timelines for wholesalers.",
    location: "San Antonio, TX",
    marketAreas: ["San Antonio", "Austin", "Houston"],
    workTypes: ["Gator"],
    verificationStatus: "pending",
    contact: {
      name: "Bryce Alvarado",
      phone: "(210) 555-0199",
      email: "acquisitions@sunsetgator.com",
    },
    logoUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=200&q=80",
    pastProjects: [
      {
        title: "Wholesale disposition pipeline",
        location: "San Antonio",
        referenceName: "Main Street Wholesale",
        description: "Consistently purchased 4-6 deals monthly with 10-day average close.",
      },
    ],
  },
  {
    id: "ts-5",
    name: "Bluebonnet Transaction Ops",
    tagline: "Coordinators who manage docs and deadlines",
    description:
      "Transaction coordinators who keep rehab and wholesale paperwork on track with weekly status updates.",
    location: "Dallas, TX",
    marketAreas: ["Dallas-Fort Worth", "Houston"],
    workTypes: ["Transaction Coordinator"],
    verificationStatus: "verified",
    contact: {
      name: "Leah Porter",
      phone: "(972) 555-0107",
      email: "leah@bbtxops.com",
      website: "https://bbtxops.com",
    },
    logoUrl: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=200&q=80",
    pastProjects: [
      {
        title: "Multi-deal closing coordination",
        location: "Dallas Metro",
        budget: "$980k",
        referenceName: "BrightPath Investments",
        description: "Managed 18 closings across 4 title companies with shared checklists.",
      },
    ],
  },
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

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
  const userRole = getPrimaryRole(roles, profile?.role || "investor");

  const selectedWorkTypes = parseListParam(resolvedSearchParams.workType);
  const selectedMarkets = parseListParam(resolvedSearchParams.market);
  const verifiedOnly = resolvedSearchParams.verified === "true";
  const keyword = (resolvedSearchParams.q || "").toLowerCase().trim();

  const filteredServices = exampleServices
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
    new Set([...BASE_SERVICE_TYPES, ...exampleServices.flatMap((service) => service.workTypes)])
  ).sort();
  const availableMarkets = Array.from(
    new Set([...BASE_MARKET_AREAS, ...exampleServices.flatMap((service) => service.marketAreas)])
  ).sort();

  const verifiedCount = exampleServices.filter((service) => service.verificationStatus === "verified").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <AppHeader
        userRole={userRole}
        currentPage="transaction-services"
        avatarUrl={profile?.avatar_url || null}
        displayName={profile?.display_name || null}
        email={authData.user.email}
      />

      <section className="border-b border-zinc-200/70 bg-white/60 py-12 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-900/50">
                Transaction services marketplace
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
                Title, escrow, and funding partners built for investors
              </h1>
              <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
                Find transaction service providers who already understand assignments, double closes, and fast funding.
                Compare coverage areas, see recent work, and connect directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/app/deals"
                  className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Explore investor deals
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Promote your services
                </Link>
              </div>
              <div className="grid gap-3 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                  <p>Verified partners share experience with investor closings and draw schedules.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500"></span>
                  <p>Filter by service type and market coverage to match your deal pipeline.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-emerald-50 p-6 shadow-lg ring-1 ring-inset ring-white/70 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/30 dark:ring-black/30">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Marketplace snapshot</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Verified partners</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{verifiedCount}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Title, escrow, lending, gators</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Service types</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                      {availableWorkTypes.length}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Specialized investor support</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Markets</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{availableMarkets.length}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Texas-wide coverage</p>
                  </div>
                  <div className="rounded-xl bg-white/90 p-4 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-800">
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Typical close</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">10-14 days</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Investor-aligned timelines</p>
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
              Transaction service directory
            </p>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Showing {filteredServices.length} partners
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Filter by service type, market area, verification, or keyword to find the right partner.
            </p>
          </div>
        </div>

        <ServiceFilters availableWorkTypes={availableWorkTypes} availableMarkets={availableMarkets}>
          {filteredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/60 p-10 text-center text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
              No transaction services match those filters yet. Try clearing filters or choosing a nearby market.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => (
                <VendorCard key={service.id} vendor={service} verifiedLabel="Verified Partner" />
              ))}
            </div>
          )}
        </ServiceFilters>
      </div>
    </div>
  );
}
