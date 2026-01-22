"use client";

import { useState } from "react";
import { format } from "date-fns";
import { updateDealDispositionStatus, updateExpectedClosingDate } from "./actions";
import DealSlideOver from "./DealSlideOver";

type Deal = {
    id: string;
    title: string;
    property_address: string;
    property_city: string;
    property_state: string;
    property_zip: string;
    asking_price: number;
    arv?: number;
    repair_estimate?: number;
    disposition_status: string;
    expected_closing_date: string | null;
    wholesaler_id: string;
    status: string;
    profiles?: {
        display_name: string;
        email: string;
        phone_number: string;
    };
};

const STAGES = [
    { value: "new", label: "New Lead", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
    { value: "marketing", label: "Marketing", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300" },
    { value: "negotiating", label: "Negotiating", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" },
    { value: "under_contract", label: "Under Contract", color: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" },
    { value: "closed", label: "Closed", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
    { value: "dead", label: "Dead Deal", color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" },
];

export default function DealCRMTable({ deals }: { deals: Deal[] }) {
    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

    const filteredDeals = deals.filter((deal) => {
        const matchesSearch =
            deal.title?.toLowerCase().includes(filter.toLowerCase()) ||
            deal.property_address?.toLowerCase().includes(filter.toLowerCase()) ||
            deal.profiles?.display_name?.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === "all" || (deal.disposition_status || "new") === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDeals = [...filteredDeals].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = a[key as keyof Deal];
        let bValue: any = b[key as keyof Deal];

        // Custom accessors
        if (key === 'wholesaler') {
            aValue = a.profiles?.display_name || '';
            bValue = b.profiles?.display_name || '';
        }

        if (key === 'asking_price' || key === 'arv') {
            aValue = Number(aValue || 0);
            bValue = Number(bValue || 0);
        }

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleStatusChange = async (dealId: string, newStatus: string) => {
        try {
            await updateDealDispositionStatus(dealId, newStatus);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleDateChange = async (dealId: string, newDate: string) => {
        try {
            await updateExpectedClosingDate(dealId, newDate || null);
        } catch (error) {
            alert("Failed to update date");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-xl/50 p-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50/50">
                <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search deals, address, wholesaler..."
                        className="w-full rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:w-64"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <select
                        className="rounded-lg border border-zinc-200 bg-white/50 backdrop-blur-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Stages</option>
                        {STAGES.map((stage) => (
                            <option key={stage.value} value={stage.value}>
                                {stage.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-sm text-zinc-500">
                    Showing {sortedDeals.length} deals
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/50 backdrop-blur-xl shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    onClick={() => handleSort('title')}
                                >
                                    Deal & Address {sortConfig?.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    onClick={() => handleSort('asking_price')}
                                >
                                    Entry / ARV {sortConfig?.key === 'asking_price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    onClick={() => handleSort('wholesaler')}
                                >
                                    Wholesaler {sortConfig?.key === 'wholesaler' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    onClick={() => handleSort('disposition_status')}
                                >
                                    Pipeline Stage {sortConfig?.key === 'disposition_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    onClick={() => handleSort('expected_closing_date')}
                                >
                                    Est. Close {sortConfig?.key === 'expected_closing_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {sortedDeals.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No deals found matching your filters.</td>
                                </tr>
                            ) : sortedDeals.map((deal) => {
                                // Determine row color based on status (subtle background)
                                const stagePreset = STAGES.find(s => s.value === (deal.disposition_status || 'new'));
                                const stageColor = stagePreset?.color || "";

                                let bgClass = "";
                                switch (deal.disposition_status) {
                                    case "marketing": bgClass = "bg-yellow-50/50 dark:bg-yellow-900/10"; break;
                                    case "negotiating": bgClass = "bg-purple-50/50 dark:bg-purple-900/10"; break;
                                    case "under_contract": bgClass = "bg-orange-50/50 dark:bg-orange-900/10"; break;
                                    case "closed": bgClass = "bg-emerald-50/50 dark:bg-emerald-900/10"; break;
                                    case "dead": bgClass = "bg-red-50/50 dark:bg-red-900/10"; break;
                                    default: bgClass = "hover:bg-zinc-50 dark:hover:bg-zinc-800/50";
                                }

                                return (
                                    <tr
                                        key={deal.id}
                                        className={`group transition-colors ${bgClass}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deal.title}</span>
                                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {deal.property_address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-emerald-600 dark:text-emerald-400">
                                                ${deal.asking_price?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                ARV: ${deal.arv ? deal.arv.toLocaleString() : "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-900 dark:text-zinc-100">{deal.profiles?.display_name || "Unknown"}</span>
                                                <a href={`mailto:${deal.profiles?.email}`} className="text-xs text-blue-500 hover:underline">{deal.profiles?.email}</a>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={deal.disposition_status || "new"}
                                                onChange={(e) => handleStatusChange(deal.id, e.target.value)}
                                                className={`w-36 rounded-md border-0 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide focus:ring-2 focus:ring-purple-500 ${stageColor.split(" ")[0]} ${stageColor.split(" ")[1]}`}
                                            >
                                                {STAGES.map((s) => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="date"
                                                value={deal.expected_closing_date ? format(new Date(deal.expected_closing_date), "yyyy-MM-dd") : ""}
                                                onChange={(e) => handleDateChange(deal.id, e.target.value)}
                                                className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-600 outline-none focus:border-purple-500 dark:border-zinc-700 dark:text-zinc-300"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedDeal(deal)}
                                                className="rounded-md border border-zinc-200 bg-white/50 backdrop-blur-xl px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                            >
                                                Details & Notes
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDeal && (
                <DealSlideOver
                    deal={selectedDeal}
                    isOpen={!!selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                />
            )}
        </div>
    );
}
