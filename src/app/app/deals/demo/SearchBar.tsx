'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

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

    const handleSearch = useCallback(() => {
        if (searchValue.trim()) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('search', searchValue.trim());
            router.push(`/app/deals?${params.toString()}`, { scroll: false });
        }
    }, [searchValue, router, searchParams]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    return (
        <div className="relative w-full group">
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                {/* Search Icon Button - Left side */}
                <motion.button
                    onClick={handleSearch}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-10"
                    aria-label="Search"
                >
                    <svg
                        className="h-5 w-5 group-focus-within:text-blue-500 transition-colors"
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
                </motion.button>

                {/* Input Field */}
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    id="marketplace-search-bar"
                    placeholder="Search by address, city, zip or title..."
                    className="block w-full rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-md py-4 pl-12 pr-12 text-base font-medium text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:bg-white focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-zinc-900 dark:focus:border-blue-500/30"
                />

                {/* Clear Button - Right side */}
                {searchValue && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleClear}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
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
                    </motion.button>
                )}
            </div>
        </div>
    );
}

