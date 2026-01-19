import Link from "next/link";
import { FORUM_TOPICS } from "../topics";

interface ForumLeftSidebarProps {
    topicFilter: string;
}

export function ForumLeftSidebar({ topicFilter }: ForumLeftSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Feeds Section */}
            <div className="rounded-xl border border-zinc-200 bg-white/50 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50">
                <h3 className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                    Feeds
                </h3>
                <nav className="space-y-1">
                    <Link
                        href="/app/forum"
                        prefetch={false}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all ${topicFilter === "all"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>
                    <Link
                        href="/app/forum?topic=popular"
                        prefetch={false}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all ${topicFilter === "popular"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Popular
                    </Link>
                    <Link
                        href="/app/forum?topic=saved"
                        prefetch={false}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition-all ${topicFilter === "saved"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Saved
                    </Link>
                </nav>
            </div>

            {/* Topics Section */}
            <div className="rounded-xl border border-zinc-200 bg-white/50 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between px-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                        Topics
                    </h3>
                    {topicFilter !== 'all' && topicFilter !== 'saved' && topicFilter !== 'popular' && (
                        <Link href="/app/forum" className="text-[10px] font-bold text-blue-500 hover:underline">CLEAR</Link>
                    )}
                </div>

                <nav className="space-y-1">
                    {FORUM_TOPICS.map((topic) => {
                        const isSelected = topicFilter === topic.slug;
                        return (
                            <Link
                                key={topic.slug}
                                href={`/app/forum?topic=${topic.slug}`}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${isSelected
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-bold"
                                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700 group-hover:bg-blue-400"}`}></span>
                                <span>{topic.label}</span>
                            </Link>
                        );
                    })}
                    <Link
                        href="/app/forum?topic=uncategorized"
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${topicFilter === "uncategorized"
                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-bold"
                            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${topicFilter === "uncategorized" ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700 group-hover:bg-blue-400"}`}></span>
                        <span>Uncategorized</span>
                    </Link>
                </nav>
            </div>


        </div>
    );
}
