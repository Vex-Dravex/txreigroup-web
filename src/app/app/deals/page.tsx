import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import FilterProvider, { FilterToggleButton, FilterSidebarWrapper } from "./FilterContainer";
import FilterTagsDisplay from "./FilterTagsDisplay";
import DealsGrid from "./DealsGrid";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";

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
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

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
  };

  // Filter deals based on search params
  displayDeals = displayDeals.filter((deal) => {
    // Bedrooms filter
    if (filters.bedrooms !== null) {
      const dealBedrooms = typeof deal.bedrooms === 'number' ? deal.bedrooms : (deal.bedrooms ? parseInt(String(deal.bedrooms), 10) : null);
      if (dealBedrooms === null || isNaN(dealBedrooms)) {
        return false;
      }
      if (filters.exactBedrooms) {
        // Exact match: must be exactly this number
        if (dealBedrooms !== filters.bedrooms) {
          return false;
        }
      } else {
        // Minimum match: must be at least this number
        if (dealBedrooms < filters.bedrooms) {
          return false;
        }
      }
    }

    // Bathrooms filter
    if (filters.bathrooms !== null) {
      const dealBathrooms = typeof deal.bathrooms === 'number' ? deal.bathrooms : (deal.bathrooms ? parseFloat(String(deal.bathrooms)) : null);
      if (dealBathrooms === null || isNaN(dealBathrooms)) {
        return false;
      }
      if (filters.exactBathrooms) {
        // Exact match: must be exactly this number (within 0.01 tolerance for floating point)
        if (Math.abs(dealBathrooms - filters.bathrooms) > 0.01) {
          return false;
        }
      } else {
        // Minimum match: must be at least this number
        if (dealBathrooms < filters.bathrooms) {
          return false;
        }
      }
    }

    // Square footage filter
    if (filters.minSqFt !== null) {
      const dealSqFt = typeof deal.square_feet === 'number' ? deal.square_feet : (deal.square_feet ? parseInt(String(deal.square_feet)) : null);
      if (dealSqFt === null || dealSqFt < filters.minSqFt) {
        return false;
      }
    }
    if (filters.maxSqFt !== null) {
      const dealSqFt = typeof deal.square_feet === 'number' ? deal.square_feet : (deal.square_feet ? parseInt(String(deal.square_feet)) : null);
      if (dealSqFt === null || dealSqFt > filters.maxSqFt) {
        return false;
      }
    }

    // Lot size filter
    if (filters.minLotSize !== null) {
      const dealLotSize = typeof deal.lot_size_acres === 'number' ? deal.lot_size_acres : (deal.lot_size_acres ? parseFloat(String(deal.lot_size_acres)) : null);
      if (dealLotSize === null || dealLotSize < filters.minLotSize) {
        return false;
      }
    }
    if (filters.maxLotSize !== null) {
      const dealLotSize = typeof deal.lot_size_acres === 'number' ? deal.lot_size_acres : (deal.lot_size_acres ? parseFloat(String(deal.lot_size_acres)) : null);
      if (dealLotSize === null || dealLotSize > filters.maxLotSize) {
        return false;
      }
    }

    // Deal type filter - exclude deals that don't match the selected deal type
    if (filters.dealType) {
      // If deal doesn't have deal_type or it doesn't match, exclude it
      if (!deal.deal_type || deal.deal_type !== filters.dealType) {
        return false;
      }
    }

    // Buyer entry cost filter
    if (filters.minEntryPrice !== null || filters.maxEntryPrice !== null) {
      // Handle buyer_entry_cost - it might be a number, string, or null
      let buyerEntryCost: number;
      if (deal.buyer_entry_cost !== null && deal.buyer_entry_cost !== undefined) {
        buyerEntryCost = typeof deal.buyer_entry_cost === 'number' 
          ? deal.buyer_entry_cost 
          : parseFloat(String(deal.buyer_entry_cost)) || 0;
      } else {
        // Fallback to 20% of asking price if buyer_entry_cost is not set
        buyerEntryCost = typeof deal.asking_price === 'number' 
          ? deal.asking_price * 0.2 
          : parseFloat(String(deal.asking_price)) * 0.2 || 0;
      }
      
      if (filters.minEntryPrice !== null && buyerEntryCost < filters.minEntryPrice) {
        return false;
      }
      if (filters.maxEntryPrice !== null && buyerEntryCost > filters.maxEntryPrice) {
        return false;
      }
    }

    // City filter - case-insensitive comparison
    if (filters.city) {
      const dealCity = deal.property_city ? deal.property_city.toLowerCase().trim() : '';
      if (!dealCity || dealCity !== filters.city) {
        return false;
      }
    }

    // Zipcode filter - exact match (trimmed)
    if (filters.zipcode) {
      const dealZip = deal.property_zip ? String(deal.property_zip).trim() : '';
      if (!dealZip || dealZip !== filters.zipcode) {
        return false;
      }
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

  return (
    <FilterProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <AppHeader
          userRole={userRole}
          currentPage="deals"
          avatarUrl={profileData?.avatar_url || null}
          displayName={profileData?.display_name || null}
          email={authData.user.email}
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Off Market MLS</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {isAdmin
                  ? "All deals"
                  : isWholesaler
                    ? "Manage your deals"
                    : "Browse approved wholesale deals"}
                {displayDeals.length > 0 && (
                  <span className="ml-2">({displayDeals.length} {displayDeals.length === 1 ? "listing" : "listings"})</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <FilterToggleButton />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Sidebar + Main Content Layout */}
        <div className="flex gap-6">
          {/* Filter Sidebar - controlled by FilterToggleButton */}
          <FilterSidebarWrapper />

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Filter Tags - shown above listings */}
            <Suspense fallback={null}>
              <FilterTagsDisplay />
            </Suspense>

            {displayDeals.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {Object.values(filters).some((v) => v !== null)
                    ? "No deals match your current filters. Try adjusting your search criteria."
                    : isAdmin
                      ? "No deals found."
                      : isWholesaler
                        ? "You haven't created any deals yet."
                        : "No approved deals available at this time."}
                </p>
                {Object.values(filters).some((v) => v !== null) && (
                  <Link
                    href="/app/deals"
                    className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    Clear Filters
                  </Link>
                )}
              </div>
            ) : (
              <DealsGrid>
                {displayDeals.map((deal) => {
                  const dealTypeInfo = getDealTypeInfo(deal.deal_type);
                  const buyerEntryCost = deal.buyer_entry_cost || deal.asking_price * 0.2; // Default to 20% if not set
                  
                  return (
                    <Link
                      key={deal.id}
                      href={`/app/deals/${deal.id}`}
                      className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      {/* Property Image */}
                      <div className="relative h-64 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        {deal.property_image_url ? (
                          <img
                            src={deal.property_image_url}
                            alt={deal.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                        )}
                        {/* Deal Type Badge */}
                        {deal.deal_type && (
                          <div className="absolute left-3 top-3">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${dealTypeInfo.color}`}>
                              {dealTypeInfo.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Buyer Entry Cost - Prominently Displayed */}
                        <div className="mb-3">
                          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Buyer Entry Cost</div>
                          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            {formatPrice(buyerEntryCost)}
                          </div>
                        </div>

                        {/* Address */}
                        <h2 className="mb-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                          {deal.property_address}
                        </h2>
                        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {deal.property_city}, {deal.property_state} {deal.property_zip}
                        </p>

                        {/* Property Details Grid */}
                        <div className="mb-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                          {deal.property_type && (
                            <div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Type</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50 capitalize">
                                {deal.property_type}
                              </div>
                            </div>
                          )}
                          {deal.bedrooms && (
                            <div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Bedrooms</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{deal.bedrooms}</div>
                            </div>
                          )}
                          {deal.bathrooms && (
                            <div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Bathrooms</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{deal.bathrooms}</div>
                            </div>
                          )}
                          {deal.square_feet && (
                            <div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Sq Ft</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {deal.square_feet.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {deal.insurance_estimate_monthly !== null && deal.insurance_estimate_monthly !== undefined && (
                            <div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Est. Insurance</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {formatPrice(deal.insurance_estimate_monthly)} / mo
                              </div>
                            </div>
                          )}
                          {deal.lot_size_acres && (
                            <div className="col-span-2">
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">Lot Size</div>
                              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                                {deal.lot_size_acres.toFixed(2)} acres
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Asking Price */}
                        <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Asking Price</span>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatPrice(deal.asking_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </DealsGrid>
            )}
          </div>
        </div>
        </div>
      </div>
    </FilterProvider>
  );
}
