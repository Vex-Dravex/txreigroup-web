"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppHeader from "../components/AppHeader";

type AdminDashboardContentProps = {
    userRole: any;
    profileData: any;
    authEmail: string | undefined;
    pendingDealsCount: number;
    inquiriesCount: number;
    usersCount: number;
    contractorsCount: number;
    dealInterestCount: number;
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export default function AdminDashboardContent({
    userRole,
    profileData,
    authEmail,
    pendingDealsCount,
    inquiriesCount,
    usersCount,
    contractorsCount,
    dealInterestCount,
}: AdminDashboardContentProps) {
    return (
        <div>
            <AppHeader
                userRole={userRole}
                currentPage="admin"
                avatarUrl={profileData?.avatar_url || null}
                displayName={profileData?.display_name || null}
                email={authEmail}
                pendingDealsCount={pendingDealsCount}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                        Welcome back. Here's what's happening today.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8 lg:grid-cols-12"
                >
                    {/* Quick Actions (Left Column) */}
                    <div className="lg:col-span-3 space-y-6">
                        <motion.div variants={item} className="rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Quick Actions
                            </h2>
                            <nav className="flex flex-col gap-2">
                                <QuickActionLink
                                    href="/app/admin/crm"
                                    color="emerald"
                                    label="Disposition CRM"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/videos"
                                    color="amber"
                                    label="Education Center"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/deals"
                                    color="zinc"
                                    label="Review Deals"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/deal-interest"
                                    color="blue"
                                    label="Deal Interest"
                                    icon={<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                                />
                                <QuickActionLink
                                    href="/app/admin/inquiries"
                                    color="zinc"
                                    label="Inquiries"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/users"
                                    color="zinc"
                                    label="Manage Users"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/contractors"
                                    color="zinc"
                                    label="Contractors"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
                                />
                                <QuickActionLink
                                    href="/app/admin/blog"
                                    color="purple"
                                    label="Manage Blog"
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                                />
                            </nav>
                        </motion.div>
                    </div>

                    {/* Admin Snapshot (Right Column) */}
                    <div className="lg:col-span-9 space-y-6">
                        <motion.div variants={item} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Pending Deals"
                                value={pendingDealsCount}
                                href="/app/admin/deals/pending"
                                color="yellow"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            />
                            <StatCard
                                title="New Inquiries"
                                value={inquiriesCount}
                                href="/app/admin/inquiries"
                                color="blue"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />}
                            />
                            <StatCard
                                title="Deal Interest"
                                value={dealInterestCount}
                                href="/app/admin/deal-interest"
                                color="pink"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />}
                            />
                            <StatCard
                                title="Total Users"
                                value={usersCount}
                                href="/app/admin/users"
                                color="purple"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                            />
                            <StatCard
                                title="Contractors"
                                value={contractorsCount}
                                href="/app/admin/contractors"
                                color="orange"
                                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />}
                            />
                        </motion.div>

                        {/* Recent Activity or Chart Placeholder could go here */}
                        <motion.div variants={item} className="rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">System Status</h2>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">All systems operational</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function QuickActionLink({ href, label, icon, color }: { href: string; label: string; icon: React.ReactNode; color: string }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
        amber: 'text-amber-600 dark:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        blue: 'text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        purple: 'text-purple-600 dark:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        zinc: 'text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 border-transparent', // Default style
        orange: 'text-orange-600 dark:text-orange-400 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    };

    const activeClass = colors[color] || colors.zinc;

    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all hover:scale-[1.02] hover:border-zinc-200 hover:shadow-sm dark:hover:border-zinc-700 ${color === 'zinc' ? 'hover:bg-white dark:hover:bg-zinc-800' : ''}`}
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-white dark:bg-zinc-800 shadow-sm transition-colors ${activeClass}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                {label}
            </span>
            <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

function StatCard({ title, value, href, icon, color }: { title: string; value: number; href: string; icon: React.ReactNode; color: string }) {
    const colors: Record<string, string> = {
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
    };

    const colorClass = colors[color] || colors.blue;

    return (
        <Link href={href} className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${colorClass}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {icon}
                    </svg>
                </div>
            </div>
            {/* Glow effect on hover */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />
        </Link>
    );
}
