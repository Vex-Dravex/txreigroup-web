import Link from "next/link";
import Image from "next/image";
import ProfileMenu from "./ProfileMenu";
import type { Role } from "@/lib/roles";

type AppHeaderProps = {
  userRole?: Role;
  currentPage?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
  pendingDealsCount?: number | null;
};

export default function AppHeader({
  userRole = "investor",
  currentPage,
  avatarUrl = null,
  displayName = null,
  email = null,
  pendingDealsCount = null,
}: AppHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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
              {userRole === "admin" && (
                <Link
                  href="/app/admin"
                  className={`text-sm font-medium transition-colors ${currentPage === "admin"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {userRole === "admin" && (
              <Link
                href="/app/admin/deals/pending"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                aria-label="Pending deal approvals"
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
                  <path d="M4 7.5h16a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2z" />
                  <path d="M3 8l9 6 9-6" />
                  <path d="M7 6h10" />
                </svg>
                {typeof pendingDealsCount === "number" && pendingDealsCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {pendingDealsCount}
                  </span>
                )}
              </Link>
            )}
            <ProfileMenu avatarUrl={avatarUrl} displayName={displayName} email={email} />
          </div>
        </div>
      </div>
    </header>
  );
}
