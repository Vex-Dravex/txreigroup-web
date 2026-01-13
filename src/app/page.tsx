import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import type { Role } from "@/lib/roles";
import Link from "next/link";
import Image from "next/image";
import AppHeader from "./app/components/AppHeader";
import FeatureCarousel from "./components/FeatureCarousel";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Check if user is authenticated (but don't redirect - homepage is public)
  let isAuthenticated = false;
  let userProfile: { avatar_url: string | null; display_name: string | null; email: string | null } | null = null;
  let userRole: Role = "investor";
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      isAuthenticated = true;
      // Fetch profile for authenticated users
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, role")
        .eq("id", authData.user.id)
        .single();

      const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");

      userProfile = {
        avatar_url: profile?.avatar_url || null,
        display_name: profile?.display_name || null,
        email: authData.user.email || null,
      };

      userRole = getPrimaryRole(roles, profile?.role || "investor");
    }
  } catch (error) {
    // If auth check fails, user is not authenticated
    console.error("Auth check failed:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <AppHeader
        userRole={isAuthenticated ? userRole : "investor"}
        currentPage="home"
        avatarUrl={userProfile?.avatar_url || null}
        displayName={userProfile?.display_name || null}
        email={userProfile?.email || null}
      />

      {/* Pre-Launch Landing Page */}
      <main className="flex-1">
        {/* Hero Section with Logo */}
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-full w-full opacity-25 brightness-50">
              <Image
                src="/logo.png"
                alt=""
                fill
                className="object-contain scale-110"
                priority
              />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
            <div className="relative z-10 flex flex-col items-center justify-center pt-10 text-center sm:pt-14 lg:pt-16">
              {/* Hero Content */}
              <h1 className="text-4xl font-bold tracking-tight text-zinc-950 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] dark:text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl">
                All-In-One Real Estate
                <br />
                <span className="text-blue-600 dark:text-blue-400">Investing Community</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-700 drop-shadow-[0_4px_14px_rgba(0,0,0,0.2)] dark:text-zinc-300 sm:text-xl">
                The premier platform for <strong>Investors</strong>, <strong>Wholesalers</strong>, <strong>Vendors</strong>, and <strong>Transaction Services</strong>. Connect, collaborate, and grow your real estate investment business all in one place.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <Link
                  href="/login?mode=signup"
                  className="rounded-md bg-zinc-900 px-9 py-4 text-base font-semibold text-white shadow-2xl transition-all hover:bg-zinc-800 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  Get Early Access
                </Link>
                <a
                  href="#features"
                  className="text-base font-semibold leading-6 text-zinc-900 underline decoration-zinc-400/60 decoration-2 underline-offset-8 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:decoration-zinc-200/40 dark:hover:text-zinc-300"
                >
                  Explore Features <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Carousel Section */}
        <section id="features" className="scroll-mt-[-100px] bg-white py-20 dark:bg-zinc-900 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                Powerful Features for Your Success
              </h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Discover the tools and features designed to streamline your real estate investing workflow
              </p>
            </div>
            <div className="mt-16">
              <FeatureCarousel />
            </div>
          </div>
        </section>

        {/* Target Audiences Section */}
        <section className="bg-zinc-50 py-20 dark:bg-zinc-950 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                Built for Everyone in Real Estate
              </h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Whether you're buying, selling, providing services, or managing transactions, we have tools for you
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4">
              {/* Investors */}
              <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <svg
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Investors</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Access exclusive off-market deals, connect with wholesalers, and manage your investment portfolio with powerful analytics and tools.
                </p>
              </div>

              {/* Wholesalers */}
              <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Wholesalers</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Submit deals quickly, get instant insurance estimates, and connect with verified investors ready to close on your properties.
                </p>
              </div>

              {/* Vendors */}
              <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Vendors</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Showcase your services, build your portfolio, and connect with investors looking for trusted contractors and service providers.
                </p>
              </div>

              {/* Transaction Services */}
              <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <svg
                    className="h-6 w-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Transaction Services</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  Streamline your transaction workflow with comprehensive tools for managing deals, documentation, and closing processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 py-20 dark:from-zinc-950 dark:to-black sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Transform Your Real Estate Business?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                Join the community and get access to exclusive deals, trusted vendors, and powerful tools designed for real estate professionals.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/login?mode=signup"
                  className="rounded-md bg-white px-8 py-4 text-base font-semibold text-zinc-900 shadow-lg transition-all hover:bg-zinc-100 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get Started Today
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} HTXREIGROUP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
