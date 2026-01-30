import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppHeader from "./components/AppHeader";
import { getPrimaryRole, getUserRoles, hasRole, roleDisplayNames } from "@/lib/roles";
import FadeIn, { FadeInStagger } from "../components/FadeIn";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Profile = {
  id: string;
  display_name: string | null;
  role: "admin" | "investor" | "wholesaler" | "contractor" | "vendor";
  status: string;
  avatar_url: string | null;
};

type Membership = {
  id: string;
  tier: "free" | "investor_basic" | "investor_pro" | "contractor_basic" | "contractor_featured";
  status: "active" | "past_due" | "canceled";
  current_period_end: string | null;
};

export default async function AppHome() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Fetch membership
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (membershipError) {
    console.error("Error fetching membership:", membershipError);
  }

  // Fetch some stats for the bento grid
  const { count: dealsCount } = await supabase
    .from("deals")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", authData.user.id);

  const profileData = profile as Profile | null;
  const membershipData = membership as Membership | null;

  const displayName = profileData?.display_name || authData.user.email?.split("@")[0] || "User";
  const roles = await getUserRoles(supabase, authData.user.id, profileData?.role || "investor");
  const role = getPrimaryRole(roles, profileData?.role || "investor");
  const tier = membershipData?.tier || "free";
  const membershipStatus = membershipData?.status || "active";

  // Format tier name for display
  const tierDisplayNames: Record<string, string> = {
    free: "Free Tier",
    investor_basic: "Investor Basic",
    investor_pro: "Investor Pro",
    contractor_basic: "Contractor Basic",
    contractor_featured: "Contractor Featured",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-blue-500/30">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      {/* Background Gradient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 transition-colors duration-500">
        <AppHeader
          userRole={role}
          avatarUrl={profileData?.avatar_url}
          displayName={displayName}
          email={authData.user.email}
          currentPage="dashboard"
        />

        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <FadeInStagger className="space-y-12">
            {/* Hero Section */}
            <FadeIn className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200/50 backdrop-blur-sm dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Member Dashboard
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-display leading-tight">
                  Welcome back,<br />
                  <span className="text-blue-600 dark:text-blue-500">{displayName}</span>
                </h1>
                <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  Manage your real estate empire, connect with pros, and stay ahead of the market—all from your central hub.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {hasRole(roles, "admin") && (
                  <Link
                    href="/app/admin"
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-purple-200 bg-purple-50/50 px-6 py-3 text-sm font-bold text-purple-700 transition-all hover:bg-purple-100 hover:shadow-lg hover:shadow-purple-500/10 dark:border-purple-800/30 dark:bg-purple-900/10 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/app/deals/submit"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-zinc-50 transition-all hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-950/20 active:scale-95 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:hover:shadow-white/10"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  Submit Deal
                </Link>
              </div>
            </FadeIn>

            {/* Bento Grid */}
            <div className="grid gap-6 md:grid-cols-12 md:grid-rows-2">
              {/* Profile Card - Large */}
              <FadeIn delay={0.1} className="md:col-span-8 md:row-span-1">
                <div className="h-full rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-xl shadow-zinc-200/50 backdrop-blur-md ring-1 ring-white/60 transition-all hover:shadow-2xl hover:shadow-zinc-200/60 dark:border-white/5 dark:bg-zinc-900/30 dark:shadow-black/50 dark:ring-white/5 dark:hover:shadow-black/70">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="relative">
                      {profileData?.avatar_url ? (
                        <div className="h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-white/50 dark:ring-white/10 shadow-lg">
                          <img
                            src={profileData.avatar_url}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-black text-white shadow-lg">
                          {displayName[0]}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" title="Online" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 font-display uppercase tracking-tight">Your Identity</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500">Display Name</p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{displayName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500">Registered Email</p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">{authData.user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4">
                        {(roles.length > 0 ? roles : [role]).map((assignedRole) => (
                          <span
                            key={assignedRole}
                            className="inline-flex rounded-lg bg-zinc-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-50 dark:bg-white dark:text-zinc-950"
                          >
                            {roleDisplayNames[assignedRole]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Membership Card - Vertical Small */}
              <FadeIn delay={0.2} className="md:col-span-4 md:row-span-2">
                <div className="h-full rounded-[2rem] border border-white/40 bg-zinc-900 px-8 py-10 shadow-2xl shadow-zinc-200/50 backdrop-blur-md ring-1 ring-white/10 flex flex-col justify-between overflow-hidden relative group dark:border-white/5 dark:bg-zinc-950/80">
                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-700" />

                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-black text-white font-display uppercase tracking-tight">Access Level</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Current Plan</p>
                        <div className="inline-flex items-end gap-2">
                          <span className="text-4xl font-black text-white leading-none tracking-tighter">{tierDisplayNames[tier]}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Network Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${membershipStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`} />
                          <span className="text-lg font-bold text-white capitalize">{membershipStatus}</span>
                        </div>
                      </div>

                      {membershipData?.current_period_end && (
                        <div className="space-y-2 pt-4 border-t border-white/5">
                          <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Next Renewal</p>
                          <p className="text-xl font-bold text-white">
                            {new Date(membershipData.current_period_end).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 pt-8">
                    <Link
                      href="/app/account/membership"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Manage Membership
                    </Link>
                  </div>
                </div>
              </FadeIn>

              {/* Stats/Action Cards */}
              <FadeIn delay={0.3} className="md:col-span-4">
                <div className="h-full rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-xl shadow-zinc-200/50 backdrop-blur-md ring-1 ring-white/60 transition-all hover:shadow-2xl hover:shadow-zinc-200/60 dark:border-white/5 dark:bg-zinc-900/30 dark:shadow-black/50 dark:ring-white/5 dark:hover:shadow-black/70">
                  <p className="text-[10px] uppercase tracking-widest font-black text-zinc-400 dark:text-zinc-500">Active Pipeline</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-5xl font-black text-zinc-900 dark:text-zinc-50 font-display tracking-tight">{dealsCount || 0}</p>
                      <p className="mt-1 text-sm font-medium text-zinc-500">Deals in market</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <Link
                    href="/app/deals"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 transition-colors dark:text-blue-400"
                  >
                    View My Deals
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} className="md:col-span-4">
                <div className="h-full rounded-[2rem] border border-white/40 bg-zinc-950 p-8 shadow-xl shadow-black/20 ring-1 ring-white/10 transition-all hover:shadow-2xl hover:shadow-black/40 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Network Reach</p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-5xl font-black text-white font-display tracking-tight">2.4k</p>
                        <p className="mt-1 text-sm font-medium text-zinc-400">Total members</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                    <Link
                      href="/app/forum"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-50 hover:text-zinc-300 transition-colors"
                    >
                      Enter Forum
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Support Section - Minimal */}
            <FadeIn delay={0.5} className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 font-display">Need Assistance?</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Our team is here to help you navigate your real estate journey.</p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/app/support"
                  className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Contact Support
                </Link>
              </div>
            </FadeIn>
          </FadeInStagger>
        </main>
      </div>
    </div>
  );
}
