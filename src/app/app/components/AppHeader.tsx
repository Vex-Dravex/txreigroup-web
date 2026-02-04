import Link from "next/link";
import Image from "next/image";
import ProfileMenu from "./ProfileMenu";
import NotificationBell from "./NotificationBell";
import type { Role } from "@/lib/roles";

type AppHeaderProps = {
  userRole?: Role;
  currentPage?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  pendingDealsCount?: number | null;
  unreadMessagesCount?: number | null;
  unreadNotificationsCount?: number | null;
  isAuthenticated?: boolean;
};

export default function AppHeader({
  userRole = "investor",
  currentPage,
  avatarUrl = null,
  displayName = null,
  email = null,
  pendingDealsCount = null,
  unreadMessagesCount = null,
  unreadNotificationsCount = null,
  isAuthenticated = true,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/Header Logo 2.png"
                alt="Houston Real Estate Investment Group Header Logo"
                width={300}
                height={100}
                className="h-14 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${currentPage === "home"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Home
              </Link>
              <div className="group relative h-full flex items-center">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentPage === "deals"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                >
                  Creative Marketplace
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1.5 flex flex-col gap-0.5 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                    <Link
                      href="/app/deals/submit"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      Submit a Deal
                    </Link>
                    <Link
                      href="/app/deals"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      View Live Listings
                    </Link>
                  </div>
                </div>
              </div>
              <div className="group relative h-full flex items-center">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentPage === "contractors" || currentPage === "transaction-services"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                >
                  Vendors
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1.5 flex flex-col gap-0.5 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                    <Link
                      href="/app/contractors"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      Sub-Contractors
                    </Link>
                    <Link
                      href="/app/transaction-services"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      Transaction Services
                    </Link>
                  </div>
                </div>
              </div>
              <div className="group relative h-full flex items-center">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentPage === "courses" || currentPage === "forum" || currentPage === "blog"
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    }`}
                >
                  Community
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 w-48 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1.5 flex flex-col gap-0.5 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                    <Link
                      href="/app/courses"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      Education
                    </Link>
                    <Link
                      href="/app/forum"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      Community Forum
                    </Link>
                    <Link
                      href="/app/blog"
                      className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group/item block"
                    >
                      News Feed
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Authenticated users see notifications and messages */}
                <NotificationBell unreadCount={unreadNotificationsCount || 0} />
                <Link
                  href="/app/messages"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  aria-label="Messages"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {typeof unreadMessagesCount === "number" && unreadMessagesCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                {/* Unauthenticated users see Sign In/Sign Up buttons */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
            <ProfileMenu
              avatarUrl={avatarUrl}
              displayName={displayName}
              email={email}
              userRole={userRole}
              pendingDealsCount={pendingDealsCount}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
