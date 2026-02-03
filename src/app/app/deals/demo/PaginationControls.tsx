"use client";

import { useRouter, useSearchParams } from "next/navigation";

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
};

export default function PaginationControls({
    currentPage,
    totalPages,
    totalItems,
    limit,
}: PaginationControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());

        router.push(`?${params.toString()}`);
    };

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", newLimit.toString());
        params.set("page", "1"); // Reset to page 1 on limit change

        router.push(`?${params.toString()}`);
    };

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:px-6 dark:border-zinc-800">
            <div className="flex items-center gap-4">
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    Showing <span className="font-medium">{Math.max(0, Math.min(startItem, totalItems))}</span> to{" "}
                    <span className="font-medium">{endItem}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="limit-select" className="text-sm text-zinc-600 dark:text-zinc-400">
                        Per page:
                    </label>
                    <select
                        id="limit-select"
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Previous
                </button>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Page {currentPage} of {Math.max(1, totalPages)}
                </div>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
