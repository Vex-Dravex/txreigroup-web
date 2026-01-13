'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

    // Debounce search to avoid excessive URL updates
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (searchValue.trim()) {
                params.set('search', searchValue.trim());
            } else {
                params.delete('search');
            }

            // Only push if params have actually changed
            if (params.toString() !== searchParams.toString()) {
                router.push(`/app/deals?${params.toString()}`, { scroll: false });
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchValue, router, searchParams]);

    const handleClear = useCallback(() => {
        setSearchValue('');
    }, []);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                        className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search by address, city, or title..."
                    className="block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
                {searchValue && (
                    <button
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                        aria-label="Clear search"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
