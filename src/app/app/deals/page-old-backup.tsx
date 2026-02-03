import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import FilterProvider, { FilterToggleButton, FilterSidebarWrapper } from "./FilterContainer";
import FilterTagsDisplay from "./FilterTagsDisplay";
import DealsGrid from "./DealsGrid";
import SearchBar from "./SearchBar";
import PaginationControls from "./PaginationControls";
import { ScrollRestorationProvider } from "./useScrollRestoration";
import DealLink from "./DealLink";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import { SavedDealsProvider } from "./SavedDealsProvider";
import SaveButton from "./SaveButton";
import DealsListContainer from "./DealsListContainer";
import MarketplaceTutorial from "./MarketplaceTutorial";
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
  buyer_entry_cost?: number; // Entry cost for buyer
  deal_type?: DealType; // Type of wholesale deal
  arv: number | null;
  repair_estimate: number | null;
  square_feet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lot_size_acres: number | null;
  insurance_estimate_annual?: number | null;
  insurance_estimate_monthly?: number | null;
  property_image_url?: string | null; // URL for property image
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

export default async function DealsPage({
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

  // Fetch deals based on role
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

  // Add example listings if no deals exist (for demonstration)
  const exampleListings: Deal[] = [
    {
      id: "example-1",
      wholesaler_id: "example-wholesaler-1",
      title: "Fixer Upper in Prime Location",
      description: "Great investment opportunity in growing neighborhood",
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
      property_image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "John Smith",
        email: "john@example.com",
        phone: "(214) 555-0123",
      },
    },
    {
      id: "example-2",
      wholesaler_id: "example-wholesaler-2",
      title: "Seller Finance Opportunity",
      description: "Owner willing to finance - low down payment required",
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
      property_image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "(713) 555-0456",
      },
    },
    {
      id: "example-3",
      wholesaler_id: "example-wholesaler-3",
      title: "Mortgage Takeover Deal",
      description: "Assumable mortgage with low interest rate",
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
      property_image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Mike Davis",
        email: "mike@example.com",
        phone: "(512) 555-0789",
      },
      deal_media: [
        { file_path: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", display_order: 1 },
        { file_path: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop", display_order: 2 },
        { file_path: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop", display_order: 3 },
      ],
    },
    {
      id: "example-4",
      wholesaler_id: "example-wholesaler-4",
      title: "Trust Acquisition Property",
      description: "Estate sale property - quick close possible",
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
      property_image_url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Lisa Anderson",
        email: "lisa@example.com",
        phone: "(210) 555-0321",
      },
      deal_media: [
        { file_path: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop", display_order: 1 },
        { file_path: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop", display_order: 2 },
      ],
    },
    {
      id: "example-5",
      wholesaler_id: "example-wholesaler-5",
      title: "Cash Deal - Below Market",
      description: "Motivated seller, needs quick sale",
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
      property_image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Robert Wilson",
        email: "robert@example.com",
        phone: "(817) 555-0654",
      },
    },
    {
      id: "example-6",
      wholesaler_id: "example-wholesaler-6",
      title: "Seller Finance - Great Terms",
      description: "Owner financing available, flexible terms",
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
      property_image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Jennifer Martinez",
        email: "jennifer@example.com",
        phone: "(972) 555-0987",
      },
    },
    {
      id: "example-7",
      wholesaler_id: "example-wholesaler-7",
      title: "Cozy Starter Home",
      description: "Perfect first home or investment property",
      property_address: "1111 Main Street",
      property_city: "Dallas",
      property_state: "TX",
      property_zip: "75202",
      property_type: "Single Family",
      asking_price: 65000,
      buyer_entry_cost: 10000,
      deal_type: "cash_deal",
      arv: 140000,
      repair_estimate: 20000,
      square_feet: 1200,
      bedrooms: 1,
      bathrooms: 1,
      lot_size_acres: 0.15,
      property_image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        display_name: "Test Wholesaler",
        email: "test@example.com",
        phone: "(214) 555-9999",
      },
    },
  ];

  // Use example listings if no real deals exist (for demo purposes)
  let displayDeals = dealsData.length > 0 ? dealsData : exampleListings;

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
    // 1. Status Filter - remove pending and approved cards (badges) users don't need to see
    if (!isAdmin && !deal.id.startsWith('example-')) {
      if (deal.status === 'rejected' || deal.status === 'draft') {
        // Wholesalers can only see their own non-approved deals
        if (!isWholesaler || deal.wholesaler_id !== authData.user.id) {
          return false;
        }
      }
    }

    // 2. Search filter - matches against title, address, or city
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

  // Pagination Logic
  const totalItems = displayDeals.length;
  const currentPage = Math.max(1, filters.page);
  const limit = Math.max(10, filters.limit); // Enforce minimum limit of 10 if invalid
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedDeals = displayDeals.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <FilterProvider>
      <SavedDealsProvider>
        <ScrollRestorationProvider>
          <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
            <MarketplaceTutorial />
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
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne mb-3">
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

                  {/* Action Bar: Search + Filter + Save - All grouped together */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12">
                    {/* Search Bar */}
                    <div className="flex-1 min-w-0">
                      <Suspense fallback={null}>
                        <SearchBar />
                      </Suspense>
                    </div>

                    {/* Filter and Save Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Suspense fallback={null}>
                        <FilterToggleButton />
                      </Suspense>
                      <SaveButton />
                    </div>
                  </div>
                </div>

                {/* Sidebar + Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                  {/* Filter Sidebar - controlled by FilterToggleButton */}
                  <div className="lg:pt-2"> {/* Tiny offset to align with grid top */}
                    <FilterSidebarWrapper />
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 w-full">
                    {/* Filter Tags - shown above listings */}
                    <Suspense fallback={null}>
                      <div className="mb-6">
                        <FilterTagsDisplay />
                      </div>
                    </Suspense>

                    {displayDeals.length === 0 ? (
                      <div className="glass rounded-[2rem] border border-zinc-200 p-16 text-center shadow-sm dark:border-zinc-800">
                        <div className="text-4xl mb-4">🏠</div>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium text-lg">
                          {Object.values(filters).some((v) => v !== null)
                            ? "No matches found for your current criteria."
                            : isAdmin
                              ? "Inventory is currently empty."
                              : isWholesaler
                                ? "You haven't posted any deals yet."
                                : "No new opportunities at the moment."}
                        </p>
                        {Object.values(filters).some((v) => v !== null) && (
                          <Link
                            href="/app/deals"
                            className="mt-6 inline-flex items-center px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                          >
                            Clear all filters
                          </Link>
                        )}
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

