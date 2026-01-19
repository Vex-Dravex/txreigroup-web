import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles, hasRole } from "@/lib/roles";
import DealDetailContent from "./DealDetailContent";

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
  property_image_url?: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "closed";
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

  return (
    <DealDetailContent
      dealData={dealData}
      userRole={userRole}
      roles={roles}
      profileData={profileData}
      userEmail={authData.user.email}
    />
  );
}
