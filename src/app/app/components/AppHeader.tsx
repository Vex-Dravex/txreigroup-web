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
              <Link
                href="/app/deals"
                className={`text-sm font-medium transition-colors ${currentPage === "deals"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Creative Marketplace
              </Link>
              <Link
                href="/app/contractors"
                className={`text-sm font-medium transition-colors ${currentPage === "contractors"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Vendors
              </Link>
              <Link
                href="/app/transaction-services"
                className={`text-sm font-medium transition-colors ${currentPage === "transaction-services"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Transaction Services
              </Link>
              <Link
                href="/app/courses"
                className={`text-sm font-medium transition-colors ${currentPage === "courses"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Education
              </Link>
              <Link
                href="/app/forum"
                className={`text-sm font-medium transition-colors ${currentPage === "forum"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Community Forum
              </Link>
              <Link
                href="/app/blog"
                className={`text-sm font-medium transition-colors ${currentPage === "blog"
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
              >
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
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
            <ProfileMenu
              avatarUrl={avatarUrl}
              displayName={displayName}
              email={email}
              userRole={userRole}
              pendingDealsCount={pendingDealsCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
