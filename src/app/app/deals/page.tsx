import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import FilterProvider, { FilterToggleButton, FilterSidebarWrapper } from "./FilterContainer";
import FilterTagsDisplay from "./FilterTagsDisplay";
import SearchBar from "./SearchBar";
import PaginationControls from "./PaginationControls";
import { ScrollRestorationProvider } from "./useScrollRestoration";
import DealLink from "./DealLink";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { SavedDealsProvider } from "./SavedDealsProvider";
import SaveButton from "./SaveButton";
import DealsListContainer from "./DealsListContainer";
import TutorialTrigger from "./TutorialTrigger";

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
    insurance_estimate_annual?: number | null;
    insurance_estimate_monthly?: number | null;
    property_image_url?: string | null;
    status: "draft" | "pending" | "approved" | "rejected" | "closed";
    created_at: string;
    updated_at: string;
    profiles: {
        display_name: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    deal_media?: {
        file_path: string;
        display_order: number;
    }[];
};

type Profile = {
    id: string;
    role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
    display_name: string | null;
    avatar_url: string | null;
};

type SearchParams = {
    bedrooms?: string;
    exactBedrooms?: string;
    bathrooms?: string;
    exactBathrooms?: string;
    minSqFt?: string;
    maxSqFt?: string;
    minLotSize?: string;
    maxLotSize?: string;
    dealType?: string;
    minEntryPrice?: string;
    maxEntryPrice?: string;
    city?: string;
    zipcode?: string;
    search?: string;
    page?: string;
    limit?: string;
};

export default async function LiveDealsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const resolvedSearchParams = await searchParams;
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) redirect("/login?mode=signup");

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, avatar_url")
        .eq("id", authData.user.id)
        .single();

    const profileData = profile as Profile | null;
    const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
    const userRole = getPrimaryRole(roles, profileData?.role || "investor");
    const isAdmin = hasRole(roles, "admin");
    const isWholesaler = hasRole(roles, "wholesaler");
    const isInvestor = hasRole(roles, "investor");

    // Fetch REAL deals from database
    let dealsQuery = supabase
        .from("deals")
        .select(`
      *,
      profiles:wholesaler_id (
        display_name,
        email,
        phone
      ),
      deal_media(
        file_path,
        display_order
      )
    `)
        .order("created_at", { ascending: false });

    // Investors only see approved deals
    if (isInvestor && !isWholesaler && !isAdmin) {
        dealsQuery = dealsQuery.eq("status", "approved");
    }
    // Wholesalers see their own deals
    else if (isWholesaler && !isAdmin) {
        dealsQuery = dealsQuery.eq("wholesaler_id", authData.user.id);
    }
    // Admins see all deals

    const { data: deals, error } = await dealsQuery;

    if (error) {
        console.error("Error fetching deals:", error);
    }

    const dealsData = (deals as Deal[]) || [];
    let displayDeals = dealsData;

    // Apply filters
    const filters = {
        bedrooms: resolvedSearchParams.bedrooms ? parseInt(resolvedSearchParams.bedrooms) : null,
        exactBedrooms: resolvedSearchParams.exactBedrooms === "true",
        bathrooms: resolvedSearchParams.bathrooms ? parseFloat(resolvedSearchParams.bathrooms) : null,
        exactBathrooms: resolvedSearchParams.exactBathrooms === "true",
        minSqFt: resolvedSearchParams.minSqFt ? parseInt(resolvedSearchParams.minSqFt) : null,
        maxSqFt: resolvedSearchParams.maxSqFt ? parseInt(resolvedSearchParams.maxSqFt) : null,
        minLotSize: resolvedSearchParams.minLotSize ? parseFloat(resolvedSearchParams.minLotSize) : null,
        maxLotSize: resolvedSearchParams.maxLotSize ? parseFloat(resolvedSearchParams.maxLotSize) : null,
        dealType: resolvedSearchParams.dealType || null,
        minEntryPrice: resolvedSearchParams.minEntryPrice ? parseInt(resolvedSearchParams.minEntryPrice) : null,
        maxEntryPrice: resolvedSearchParams.maxEntryPrice ? parseInt(resolvedSearchParams.maxEntryPrice) : null,
        city: resolvedSearchParams.city?.toLowerCase().trim() || null,
        zipcode: resolvedSearchParams.zipcode?.trim() || null,
        search: resolvedSearchParams.search?.toLowerCase().trim() || null,
        page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
        limit: resolvedSearchParams.limit ? parseInt(resolvedSearchParams.limit) : 25,
    };

    // Filter deals based on search params
    displayDeals = displayDeals.filter((deal) => {
        // 1. Status Filter
        if (!isAdmin) {
            if (deal.status === 'rejected' || deal.status === 'draft') {
                if (!isWholesaler || deal.wholesaler_id !== authData.user.id) {
                    return false;
                }
            }
        }

        // 2. Search filter
        if (filters.search) {
            const searchLower = filters.search;
            const titleMatch = deal.title?.toLowerCase().includes(searchLower);
            const addressMatch = deal.property_address?.toLowerCase().includes(searchLower);
            const cityMatch = deal.property_city?.toLowerCase().includes(searchLower);

            if (!titleMatch && !addressMatch && !cityMatch) {
                return false;
            }
        }

        // Bedrooms filter
        if (filters.bedrooms !== null) {
            const dealBedrooms = typeof deal.bedrooms === 'number' ? deal.bedrooms : (deal.bedrooms ? parseInt(String(deal.bedrooms), 10) : null);
            if (dealBedrooms === null || isNaN(dealBedrooms)) {
                return false;
            }
            if (filters.exactBedrooms) {
                if (dealBedrooms !== filters.bedrooms) return false;
            } else {
                if (dealBedrooms < filters.bedrooms) return false;
            }
        }

        // Bathrooms filter
        if (filters.bathrooms !== null) {
            const dealBathrooms = typeof deal.bathrooms === 'number' ? deal.bathrooms : (deal.bathrooms ? parseFloat(String(deal.bathrooms)) : null);
            if (dealBathrooms === null || isNaN(dealBathrooms)) {
                return false;
            }
            if (filters.exactBathrooms) {
                if (Math.abs(dealBathrooms - filters.bathrooms) > 0.01) return false;
            } else {
                if (dealBathrooms < filters.bathrooms) return false;
            }
        }

        // Square footage filter
        if (filters.minSqFt !== null) {
            const dealSqFt = typeof deal.square_feet === 'number' ? deal.square_feet : (deal.square_feet ? parseInt(String(deal.square_feet)) : null);
            if (dealSqFt === null || dealSqFt < filters.minSqFt) return false;
        }
        if (filters.maxSqFt !== null) {
            const dealSqFt = typeof deal.square_feet === 'number' ? deal.square_feet : (deal.square_feet ? parseInt(String(deal.square_feet)) : null);
            if (dealSqFt === null || dealSqFt > filters.maxSqFt) return false;
        }

        // Lot size filter
        if (filters.minLotSize !== null) {
            const dealLotSize = typeof deal.lot_size_acres === 'number' ? deal.lot_size_acres : (deal.lot_size_acres ? parseFloat(String(deal.lot_size_acres)) : null);
            if (dealLotSize === null || dealLotSize < filters.minLotSize) return false;
        }
        if (filters.maxLotSize !== null) {
            const dealLotSize = typeof deal.lot_size_acres === 'number' ? deal.lot_size_acres : (deal.lot_size_acres ? parseFloat(String(deal.lot_size_acres)) : null);
            if (dealLotSize === null || dealLotSize > filters.maxLotSize) return false;
        }

        // Deal type filter
        if (filters.dealType) {
            if (!deal.deal_type || deal.deal_type !== filters.dealType) return false;
        }

        // Buyer entry cost filter
        if (filters.minEntryPrice !== null || filters.maxEntryPrice !== null) {
            let buyerEntryCost: number;
            if (deal.buyer_entry_cost !== null && deal.buyer_entry_cost !== undefined) {
                buyerEntryCost = typeof deal.buyer_entry_cost === 'number'
                    ? deal.buyer_entry_cost
                    : parseFloat(String(deal.buyer_entry_cost)) || 0;
            } else {
                buyerEntryCost = typeof deal.asking_price === 'number'
                    ? deal.asking_price * 0.2
                    : parseFloat(String(deal.asking_price)) * 0.2 || 0;
            }

            if (filters.minEntryPrice !== null && buyerEntryCost < filters.minEntryPrice) return false;
            if (filters.maxEntryPrice !== null && buyerEntryCost > filters.maxEntryPrice) return false;
        }

        // City filter
        if (filters.city) {
            const dealCity = deal.property_city ? deal.property_city.toLowerCase().trim() : '';
            if (!dealCity || dealCity !== filters.city) return false;
        }

        // Zipcode filter
        if (filters.zipcode) {
            const dealZip = deal.property_zip ? String(deal.property_zip).trim() : '';
            if (!dealZip || dealZip !== filters.zipcode) return false;
        }

        return true;
    });

    // Pagination Logic
    const totalItems = displayDeals.length;
    const currentPage = Math.max(1, filters.page);
    const limit = Math.max(10, filters.limit);
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedDeals = displayDeals.slice((currentPage - 1) * limit, currentPage * limit);

    return (
        <FilterProvider>
            <SavedDealsProvider>
                <ScrollRestorationProvider>
                    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
                        <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

                        {/* Background Gradient Elements */}
                        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
                            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
                        </div>

                        <div className="relative z-10">
                            <AppHeader
                                userRole={userRole}
                                currentPage="deals"
                                avatarUrl={profileData?.avatar_url || null}
                                displayName={profileData?.display_name || null}
                                email={authData.user.email}
                            />

                            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                                <div className="mb-12">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                                        <div className="flex-1">
                                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne mb-3">
                                                Creative <span className="text-blue-600">Marketplace</span>
                                            </h1>
                                            <p className="flex items-center flex-wrap gap-3 text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                                                <span>
                                                    {isAdmin
                                                        ? "Master Inventory Control"
                                                        : isWholesaler
                                                            ? "Your Exclusive Inventory"
                                                            : "Curated Wholesale Opportunities"}
                                                </span>
                                                {displayDeals.length > 0 && (
                                                    <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-500">
                                                        {displayDeals.length} {displayDeals.length === 1 ? "listing" : "listings"}
                                                    </span>
                                                )}
                                                <TutorialTrigger />
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12">
                                        <div className="flex-1 min-w-0">
                                            <Suspense fallback={null}>
                                                <SearchBar />
                                            </Suspense>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                                            <Suspense fallback={null}>
                                                <FilterToggleButton />
                                            </Suspense>
                                            <SaveButton />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar + Main Content Layout */}
                                <div className="flex flex-col lg:flex-row gap-12 items-start">
                                    <div className="lg:pt-2">
                                        <FilterSidebarWrapper />
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-1 w-full">
                                        <Suspense fallback={null}>
                                            <div className="mb-6">
                                                <FilterTagsDisplay />
                                            </div>
                                        </Suspense>

                                        {displayDeals.length === 0 ? (
                                            <div className="glass rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-xl">
                                                <div className="text-6xl mb-6">🏠</div>
                                                <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 mb-4">
                                                    {Object.values(filters).some((v) => v !== null)
                                                        ? "No matches found"
                                                        : "Be the First!"}
                                                </h2>
                                                <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg max-w-md mx-auto mb-6">
                                                    {Object.values(filters).some((v) => v !== null)
                                                        ? "No deals match your current search criteria. Try adjusting your filters."
                                                        : isWholesaler
                                                            ? "You haven't posted any deals yet. Be the first to list your wholesale deal for dispo on our marketplace!"
                                                            : "No deals available yet. Be the first to hang your wholesale deal for dispo on our marketplace!"}
                                                </p>
                                                {Object.values(filters).some((v) => v !== null) ? (
                                                    <Link
                                                        href="/app/deals"
                                                        className="inline-flex items-center px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                                                    >
                                                        Clear all filters
                                                    </Link>
                                                ) : isWholesaler ? (
                                                    <Link
                                                        href="/app/deals/submit"
                                                        className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95"
                                                    >
                                                        List Your First Deal
                                                    </Link>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <>
                                                <DealsListContainer
                                                    initialDeals={paginatedDeals}
                                                />

                                                <div className="mt-12">
                                                    <PaginationControls
                                                        currentPage={currentPage}
                                                        totalPages={totalPages}
                                                        totalItems={totalItems}
                                                        limit={limit}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollRestorationProvider>
            </SavedDealsProvider>
        </FilterProvider>
    );
}
