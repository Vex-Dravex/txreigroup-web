import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { exampleVendors } from "../../contractors/sampleVendors";
import { exampleTransactionServices } from "../../transaction-services/sampleTransactionServices";
import { VendorListing } from "../../contractors/types";
import ProfileContent, { Profile, PortfolioItem, Review, NetworkRequest } from "./ProfileContent";

export const dynamic = "force-dynamic";

const getSingleUser = (data: any) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? data[0] : null;
  }
  return data;
};

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await Promise.resolve(params);
  const profileId = resolvedParams.id;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, banner_url, bio")
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

  const portfolioItems = (portfolioResult.data || []) as PortfolioItem[];
  const reviews = (reviewsResult.data || []) as Review[];
  const networkRequest = networkRequestResult.data as NetworkRequest | null;
  const pendingRequests = (pendingRequestsResult.data || []) as any[];
  const networkCount = networkCountResult.count || 0;
  const networkConnections = (networkConnectionsResult.data || []) as any[];

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
