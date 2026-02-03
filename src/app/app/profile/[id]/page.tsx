import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { exampleVendors } from "../../contractors/sampleVendors";
import { exampleTransactionServices } from "../../transaction-services/sampleTransactionServices";
import { VendorListing } from "../../contractors/types";
import ProfileContent, { Profile, PortfolioItem, Review, NetworkRequest } from "./ProfileContent";
import VendorDetailTutorial from "../../contractors/[id]/VendorDetailTutorial";
import TransactionServiceDetailTutorial from "../../transaction-services/demo/TransactionServiceDetailTutorial";

export const dynamic = "force-dynamic";

const getSingleUser = (data: any) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
};

export default async function UserProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id: profileId } = await props.params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, banner_url, bio, email, phone, business_name")
    .eq("id", profileId)
    .single();

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const viewerProfileData = viewerProfile as any;
  const viewerRoles = await getUserRoles(supabase, authData.user.id, viewerProfileData?.role || "investor");
  const viewerPrimaryRole = getPrimaryRole(viewerRoles, viewerProfileData?.role || "investor");

  const isOwner = authData.user.id === profileId;

  // Check if this is a sample vendor or transaction service using ID lookup
  const sampleVendorData: VendorListing | null =
    exampleVendors.find(v => v.id === profileId) ||
    exampleTransactionServices.find(v => v.id === profileId) ||
    null;

  if (!profile && !isOwner && !sampleVendorData) {
    notFound();
  }

  // Auto-create profile for owner if missing
  if (!profile && isOwner) {
    const displayName = authData.user.email?.split("@")[0] || "User";
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      role: "investor",
      display_name: displayName,
      avatar_url: null,
      banner_url: null,
      bio: null,
    });
  }

  const profileData = (profile || {
    id: profileId,
    role: "investor",
    display_name: authData.user.email?.split("@")[0] || "User",
    avatar_url: null,
    banner_url: null,
    bio: null,
  }) as Profile;

  if (sampleVendorData) {
    // Merge sample vendor data with profile to ensure consistency with rich data sections
    profileData.display_name = sampleVendorData.name;
    profileData.avatar_url = sampleVendorData.avatarUrl || sampleVendorData.logoUrl || null;
    profileData.banner_url = sampleVendorData.bannerUrl || null;
    profileData.bio = sampleVendorData.description || null;
    // Ensure role matches the implicit role of these vendors if not set correctly in DB
    if (!profile) {
      profileData.role = "contractor"; // or vendor, checking sample data would be more robust but this is fine for now
      if (exampleVendors.find(v => v.id === profileId)) profileData.role = "vendor";
    }
  }

  const [
    portfolioResult,
    reviewsResult,
    networkRequestResult,
    pendingRequestsResult,
    networkCountResult,
    networkConnectionsResult,
  ] =
    await Promise.all([
      supabase
        .from("user_portfolio_items")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_reviews")
        .select("id, comment, rating, created_at, reviewer:reviewer_id ( id, display_name, avatar_url, role )")
        .eq("reviewed_user_id", profileData.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("network_requests")
        .select("id, status, requester_id, requestee_id")
        .eq("requester_id", authData.user.id)
        .eq("requestee_id", profileData.id)
        .maybeSingle(),
      supabase
        .from("network_requests")
        .select("id, status, requester_id, requestee_id, requester:requester_id ( id, display_name, avatar_url, role )")
        .eq("requestee_id", profileData.id)
        .eq("status", "pending"),
      supabase
        .from("network_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${profileData.id},requestee_id.eq.${profileData.id}`),
      supabase
        .from("network_requests")
        .select(
          "requester_id, requestee_id, requester:requester_id ( id, display_name, avatar_url ), requestee:requestee_id ( id, display_name, avatar_url )"
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${profileData.id},requestee_id.eq.${profileData.id}`)
        .limit(50),
    ]);

  let portfolioItems = (portfolioResult.data || []) as PortfolioItem[];
  let reviews = (reviewsResult.data || []) as Review[];
  const networkRequest = networkRequestResult.data as NetworkRequest | null;
  const pendingRequests = (pendingRequestsResult.data || []) as any[];
  const networkCount = networkCountResult.count || 0;
  const networkConnections = (networkConnectionsResult.data || []) as any[];

  // INJECT DEMO CONTENT FOR TUTORIAL (Lonestar General Builders)
  if (profileId === '8d3c63d8-57e3-4428-ba2e-067755c3c0a1') {
    // Inject Showcase
    if (portfolioItems.length === 0) {
      portfolioItems = [
        {
          id: "demo-showcase-1",
          user_id: profileId,
          category: "renovation",
          image_url: "/demo-assets/kitchen_showcase.png",
          images: ["/demo-assets/kitchen_showcase.png"],
          caption: "Recent Kitchen Remodel - Full gut renovation including custom cabinets and quartz countertops.",
          created_at: new Date().toISOString()
        },
        {
          id: "demo-showcase-2",
          user_id: profileId,
          category: "bathroom",
          image_url: "/demo-assets/bathroom_showcase.png",
          images: ["/demo-assets/bathroom_showcase.png"],
          caption: "Master Bath Renovation - Adding value with modern fixtures and tile work.",
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "demo-showcase-3",
          user_id: profileId,
          category: "exterior",
          image_url: "/demo-assets/exterior_showcase.png",
          images: ["/demo-assets/exterior_showcase.png"],
          caption: "Exterior Refresh - New siding and paint to boost curb appeal.",
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    // Inject Reviews
    if (reviews.length === 0) {
      reviews = [
        {
          id: "demo-review-1",
          comment: "Lonestar is my go-to GC. They understand that every day costs me money. Finished the rehab 3 days ahead of schedule!",
          rating: 5,
          created_at: new Date().toISOString(),
          reviewer: { id: "demo-u1", display_name: "Sarah Jenkins", avatar_url: null, role: "investor" }
        },
        {
          id: "demo-review-2",
          comment: "Great communication and transparent pricing. No surprise change orders.",
          rating: 5,
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          reviewer: { id: "demo-u2", display_name: "Mike Ross", avatar_url: null, role: "investor" }
        },
        {
          id: "demo-review-3",
          comment: "Solid work on the make-ready. Good partner to recommend to my buyers.",
          rating: 4,
          created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
          reviewer: { id: "demo-u3", display_name: "Elena Rodriguez", avatar_url: null, role: "wholesaler" }
        }
      ];
    }
  }

  // INJECT DEMO CONTENT FOR TRANSACTION SERVICES (Bayou Title)
  if (profileId === 'd8224455-1f93-4173-9622-89012345f6f1') {
    // Inject Banner
    if (!profileData.banner_url) profileData.banner_url = "/demo-assets/transaction_services_banner.png";

    // Inject Showcase
    if (portfolioItems.length === 0) {
      portfolioItems = [
        {
          id: "demo-ts-showcase-1",
          user_id: profileId,
          category: "closing",
          image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80",
          images: ["https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80"],
          caption: "Secure Closing Rooms - Private, comfortable spaces for your clients.",
          created_at: new Date().toISOString()
        },
        {
          id: "demo-ts-showcase-2",
          user_id: profileId,
          category: "documents",
          image_url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
          images: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"],
          caption: "Digital Title Processing - Streamlined workflow with real-time updates.",
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "demo-ts-showcase-3",
          user_id: profileId,
          category: "team",
          image_url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
          images: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"],
          caption: "Expert Escrow Team - Dedicated officers for investor transactions.",
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
    }

    // Inject Reviews
    if (reviews.length === 0) {
      reviews = [
        {
          id: "demo-ts-review-1",
          comment: "Bayou Title saved my deal! The double closing was smooth and they handled the assignment fee perfectly.",
          rating: 5,
          created_at: new Date().toISOString(),
          reviewer: { id: "demo-u4", display_name: "James Carter", avatar_url: null, role: "wholesaler" }
        },
        {
          id: "demo-ts-review-2",
          comment: "Best title company for investors in Houston. They actually understand creative finance.",
          rating: 5,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          reviewer: { id: "demo-u5", display_name: "Alicia Keys", avatar_url: null, role: "investor" }
        },
        {
          id: "demo-ts-review-3",
          comment: "Fast communication and very professional team.",
          rating: 4,
          created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          reviewer: { id: "demo-u6", display_name: "Tom Hardy", avatar_url: null, role: "agent" }
        }
      ];
    }
  }

  const { data: onboardingData } = await supabase
    .from("user_onboarding")
    .select("*")
    .eq("user_id", profileId)
    .single();

  const isViewerAdmin = viewerProfileData?.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AppHeader
        userRole={viewerPrimaryRole}
        currentPage="community"
        avatarUrl={viewerProfileData?.avatar_url || null}
        displayName={viewerProfileData?.display_name || null}
        email={authData.user.email}
      />

      {profileId === '8d3c63d8-57e3-4428-ba2e-067755c3c0a1' && <VendorDetailTutorial />}
      {profileId === 'd8224455-1f93-4173-9622-89012345f6f1' && <TransactionServiceDetailTutorial />}

      <ProfileContent
        profileData={profileData}
        isOwner={isOwner}
        portfolioItems={portfolioItems}
        reviews={reviews}
        networkRequest={networkRequest}
        pendingRequests={pendingRequests}
        networkCount={networkCount}
        networkConnections={networkConnections}
        sampleVendorData={sampleVendorData}
        currentUserId={authData.user.id}
        onboardingData={onboardingData}
        isViewerAdmin={isViewerAdmin}
      />
    </div>
  );
}
