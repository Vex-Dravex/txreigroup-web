import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import { ProfileEditAvatar, ProfileEditBanner, ProfileEditBio } from "./ProfileEditDialogs";
import {
  createPortfolioItem,
  createReview,
  requestNetwork,
  respondNetworkRequest,
} from "./actions";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  display_name?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  bio?: string | null;
};

type PortfolioItem = {
  id: string;
  user_id: string;
  category: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

type Review = {
  id: string;
  comment: string;
  created_at: string;
  reviewer: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
};

type NetworkRequest = {
  id: string;
  status: "pending" | "accepted" | "declined";
  requester_id: string;
  requestee_id: string;
};

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
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

  const viewerProfileData = viewerProfile as Profile | null;
  const viewerRoles = await getUserRoles(supabase, authData.user.id, viewerProfileData?.role || "investor");
  const viewerPrimaryRole = getPrimaryRole(viewerRoles, viewerProfileData?.role || "investor");

  const isOwner = authData.user.id === profileId;
  if (!profile && !isOwner) {
    notFound();
  }

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
        .select("id, comment, created_at, reviewer:reviewer_id ( id, display_name, avatar_url, role )")
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
  const pendingRequests =
    (pendingRequestsResult.data as Array<
      NetworkRequest & { requester: { id: string; display_name: string | null; avatar_url: string | null } | null }
    >) || [];
  const networkCount = networkCountResult.count || 0;
  const networkConnections =
    (networkConnectionsResult.data as Array<{
      requester_id: string;
      requestee_id: string;
      requester: { id: string; display_name: string | null; avatar_url: string | null } | null;
      requestee: { id: string; display_name: string | null; avatar_url: string | null } | null;
    }>) || [];

  const portfolioCategories =
    profileData.role === "vendor" || profileData.role === "contractor"
      ? [
          { value: "work", label: "Work Portfolio" },
        ]
      : [
          { value: "deal_bought", label: "Deals Bought" },
          { value: "deal_sold", label: "Deals Sold" },
          { value: "deal_renovated", label: "Renovations" },
        ];

  const formatRoleLabel = (role: string) => role.replace("_", " ");

  const requestStatusLabel =
    networkRequest?.status === "accepted"
      ? "In Network"
      : networkRequest?.status === "pending"
        ? "Request Pending"
        : "Add to Network";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AppHeader
        userRole={viewerPrimaryRole}
        currentPage="community"
        avatarUrl={viewerProfileData?.avatar_url || null}
        displayName={viewerProfileData?.display_name || null}
        email={authData.user.email}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div
            className={`relative h-56 w-full ${profileData.banner_url ? "" : "bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 dark:from-amber-900 dark:via-orange-900 dark:to-rose-900"}`}
            style={profileData.banner_url ? { backgroundImage: `url(${profileData.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div className="absolute inset-0 bg-black/15" />
            {isOwner && <ProfileEditBanner profileId={profileData.id} currentUrl={profileData.banner_url || null} />}
          </div>
          <div className="relative px-6 pb-6">
            <div className="-mt-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative h-28 w-28 overflow-visible">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-lg dark:border-zinc-950 dark:bg-zinc-800">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt={profileData.display_name || "Profile"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-500">
                        {(profileData.display_name || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isOwner && <ProfileEditAvatar profileId={profileData.id} currentUrl={profileData.avatar_url || null} />}
                </div>
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {profileData.display_name || "Unnamed Member"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {formatRoleLabel(profileData.role)}
                    </span>
                    <span>{networkCount} connections</span>
                  </div>
                </div>
              </div>
              {!isOwner && (
                <form action={requestNetwork.bind(null, profileData.id)}>
                  <button
                    type="submit"
                    disabled={networkRequest?.status === "pending" || networkRequest?.status === "accepted"}
                    className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    {requestStatusLabel}
                  </button>
                </form>
              )}
            </div>
            {profileData.bio && (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {profileData.bio}
              </p>
            )}
          </div>
        </div>

        {isOwner && pendingRequests.length > 0 && (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Network Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      {request.requester?.avatar_url ? (
                        <img src={request.requester.avatar_url} alt={request.requester.display_name || "User"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
                          {(request.requester?.display_name || "U").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {request.requester?.display_name || "Community member"}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Wants to connect</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <form action={respondNetworkRequest.bind(null, request.id, "accepted")}>
                      <button
                        type="submit"
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Accept
                      </button>
                    </form>
                    <form action={respondNetworkRequest.bind(null, request.id, "declined")}>
                      <button
                        type="submit"
                        className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Showcase</h2>
                {isOwner && (
                  <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Add your highlights
                  </span>
                )}
              </div>
              {isOwner && (
                <form action={createPortfolioItem.bind(null, profileData.id)} className="mb-6 grid gap-4 md:grid-cols-3">
                  <select
                    name="category"
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    defaultValue={portfolioCategories[0]?.value}
                  >
                    {portfolioCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="Image URL"
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <input
                    name="caption"
                    type="text"
                    placeholder="Caption (optional)"
                    className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="md:col-span-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    Add to Showcase
                  </button>
                </form>
              )}
              {portfolioItems.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">No showcase items yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="h-40 w-full bg-zinc-200 dark:bg-zinc-800">
                        <img src={item.image_url} alt={item.caption || "Showcase"} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-3 text-sm">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {portfolioCategories.find((category) => category.value === item.category)?.label || "Highlight"}
                        </div>
                        {item.caption && (
                          <div className="mt-1 text-zinc-700 dark:text-zinc-300">{item.caption}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Community Reviews</h2>
              {!isOwner && (
                <form action={createReview.bind(null, profileData.id)} className="mb-6 space-y-3">
                  <textarea
                    name="comment"
                    rows={3}
                    placeholder="Share what it was like working with this member..."
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    Post Review
                  </button>
                </form>
              )}
              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          {review.reviewer?.avatar_url ? (
                            <img src={review.reviewer.avatar_url} alt={review.reviewer.display_name || "Reviewer"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-500">
                              {(review.reviewer?.display_name || "U").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {review.reviewer?.display_name || "Community member"}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Bio</h2>
                {isOwner && <ProfileEditBio profileId={profileData.id} currentBio={profileData.bio || null} />}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {profileData.bio || "No bio added yet."}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Network</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Connections are public to highlight trusted relationships in the community.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {networkCount} connections
              </div>
              {networkConnections.length > 0 && (
                <div className="mt-4 grid gap-3">
                  {networkConnections.map((connection) => {
                    const isRequester = connection.requester_id === profileData.id;
                    const otherUser = isRequester ? connection.requestee : connection.requester;
                    if (!otherUser) return null;
                    return (
                      <div key={`${connection.requester_id}-${connection.requestee_id}`} className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          {otherUser.avatar_url ? (
                            <img src={otherUser.avatar_url} alt={otherUser.display_name || "Member"} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-500">
                              {(otherUser.display_name || "U").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300">
                          {otherUser.display_name || "Community member"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Message</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Collaborate with {profileData.display_name || "this member"} on deals, projects, or partnerships.
              </p>
              <Link
                href="/app/forum/new"
                className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Start a conversation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
