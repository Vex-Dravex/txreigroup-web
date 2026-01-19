import Link from "next/link";

export function ForumRightSidebar() {
    return (
        <div className="space-y-6">
            {/* About Community */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <div className="h-12 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-5 pb-5">
                    <div className="-mt-6 mb-3">
                        <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-sm dark:bg-zinc-900">
                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400">
                                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">HTXREIGROUP Community</h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        The premier ecosystem for real estate visionaries. Connect, deal, and scale together.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <div>
                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">5.2k</div>
                            <div className="text-xs font-medium text-zinc-500">Members</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                142
                            </div>
                            <div className="text-xs font-medium text-zinc-500">Online</div>
                        </div>
                    </div>

                    <Link href="/app/forum/new" className="mt-6 block w-full rounded-xl bg-zinc-900 py-3 text-center text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10">
                        Create Post
                    </Link>
                </div>
            </div>

            {/* Rules */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Community Rules
                </h3>
                <ol className="space-y-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    <li className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">1</span>
                        <span>Be respectful to all members.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">2</span>
                        <span>No spam or unauthorized promotion.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">3</span>
                        <span>Keep discussions relevant to real estate.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">4</span>
                        <span>Protect personal & sensitive information.</span>
                    </li>
                </ol>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400 px-2 lg:px-4">
                <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Terms of Service</Link>
                <span className="block w-full mt-2">© 2026 HTXREIGROUP Inc. All rights reserved.</span>
            </div>
        </div>
    );
}
