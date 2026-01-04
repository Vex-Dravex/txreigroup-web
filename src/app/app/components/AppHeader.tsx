import Link from "next/link";
import ProfileMenu from "./ProfileMenu";

type AppHeaderProps = {
  userRole?: "admin" | "investor" | "wholesaler" | "contractor";
  currentPage?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string | null;
};

export default function AppHeader({
  userRole = "investor",
  currentPage,
  avatarUrl = null,
  displayName = null,
  email = null,
}: AppHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              TXREIGROUP
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "home"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Home
              </Link>
              <Link
                href="/app/deals"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "deals"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Off Market MLS
              </Link>
              <Link
                href="/app/contractors"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "contractors"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Vendors
              </Link>
              <Link
                href="/app/courses"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "courses"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Education
              </Link>
              <Link
                href="/app/forum"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "forum"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Community Forum
              </Link>
              {userRole === "admin" && (
                <Link
                  href="/app/admin"
                  className={`text-sm font-medium transition-colors ${
                    currentPage === "admin"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <ProfileMenu avatarUrl={avatarUrl} displayName={displayName} email={email} />
        </div>
      </div>
    </header>
  );
}
