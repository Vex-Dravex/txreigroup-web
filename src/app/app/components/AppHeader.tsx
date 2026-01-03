import Link from "next/link";

type AppHeaderProps = {
  userRole?: "admin" | "investor" | "wholesaler" | "contractor";
  currentPage?: string;
};

export default function AppHeader({ userRole = "investor", currentPage }: AppHeaderProps) {
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
                href="/app"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "dashboard"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/app/deals"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "deals"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Deal Board
              </Link>
              <Link
                href="/app/contractors"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "contractors"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Contractors
              </Link>
              <Link
                href="/app/courses"
                className={`text-sm font-medium transition-colors ${
                  currentPage === "courses"
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                Courses
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
          <form action="/logout" method="POST">
            <button
              type="submit"
              className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

