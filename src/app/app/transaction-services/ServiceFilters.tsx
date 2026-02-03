"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VendorCard from "../contractors/VendorCard";
import { VendorListing } from "../contractors/types";

type ServiceFiltersProps = {
  activeVendors: VendorListing[];
  availableWorkTypes: string[];
  availableMarkets: string[];
};

export function FilterTags({ searchParams, onRemoveFilters }: { searchParams: URLSearchParams; onRemoveFilters: (keys: string[]) => void }) {
  const activeFilters: Array<{ key: string; label: string; value: string; removeKeys: string[] }> = [];

  const workTypes = searchParams.get("workType")?.split(",").filter(Boolean) || [];
  workTypes.forEach((type) => {
    activeFilters.push({
      key: `workType-${type}`,
      label: "Service",
      value: type,
      removeKeys: ["workType"],
    });
  });

  const markets = searchParams.get("market")?.split(",").filter(Boolean) || [];
  markets.forEach((market) => {
    activeFilters.push({
      key: `market-${market}`,
      label: "Market",
      value: market,
      removeKeys: ["market"],
    });
  });

  if (searchParams.get("verified") === "true") {
    activeFilters.push({
      key: "verified",
      label: "Status",
      value: "Verified Only",
      removeKeys: ["verified"],
    });
  }

  if (searchParams.get("q")) {
    activeFilters.push({
      key: "search",
      label: "Search",
      value: searchParams.get("q") || "",
      removeKeys: ["q"],
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onRemoveFilters(filter.removeKeys)}
          className="group inline-flex items-center gap-2 rounded-xl bg-blue-50/50 backdrop-blur-md border border-blue-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:border-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <svg
            className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ServiceFilters({
  activeVendors,
  availableWorkTypes,
  availableMarkets,
}: ServiceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('q', searchValue.trim());
    } else {
      params.delete('q');
    }
    router.push(`/app/transaction-services?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [searchValue, router, searchParams]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/app/transaction-services?${params.toString()}`, { scroll: false });
    router.refresh();
  }, [router, searchParams]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleRemoveFilters = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));
    router.push(`/app/transaction-services?${params.toString()}`);
    router.refresh();
  };

  const activeFilterCount = Array.from(searchParams.keys()).filter((k) => searchParams.get(k)).length;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-12">
        <div className="flex-1 min-w-0">
          <div id="service-search-bar" className="relative w-full group">
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
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

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search services by name, type, or region..."
                className="block w-full rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-md py-4 pl-12 pr-12 text-base font-medium text-zinc-900 placeholder-zinc-400 shadow-sm transition-all focus:bg-white focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-zinc-900 dark:focus:border-blue-500/30"
              />

              <AnimatePresence>
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
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button
          id="service-filters-button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap ${isOpen
            ? "border-blue-500 bg-blue-600 text-white shadow-blue-500/20"
            : "border-zinc-100 bg-white text-zinc-900 shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:shadow-none"
            }`}
        >
          <svg className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>{isOpen ? "Close Filters" : "Filter Services"}</span>
          {activeFilterCount > 0 && (
            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black ${isOpen ? "bg-white text-blue-600" : "bg-blue-600 text-white"
              }`}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className={`lg:pt-2 transition-all duration-300 ${isOpen ? "block" : "hidden"}`}>
          <div
            className={`fixed left-0 top-0 z-40 h-full w-80 transform bg-white/80 backdrop-blur-xl shadow-2xl transition-transform duration-500 dark:bg-zinc-950/80 lg:sticky lg:top-8 lg:z-auto lg:h-fit lg:transform-none lg:rounded-[2rem] lg:border lg:border-zinc-200 lg:shadow-xl lg:dark:border-zinc-800 ${isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex h-full flex-col overflow-y-auto p-8 lg:h-auto lg:overflow-visible">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-display italic">Filters</h2>
                  {(searchParams.get("workType") || searchParams.get("market") || searchParams.get("verified") || searchParams.get("q")) && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {(searchParams.get("workType") || searchParams.get("market") || searchParams.get("verified") || searchParams.get("q")) && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      router.push(`/app/transaction-services?${params.toString()}`);
                      router.refresh();
                    }}
                    className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Service Type</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableWorkTypes.map((type) => {
                      const selected = searchParams.get("workType")?.split(",").includes(type) || false;
                      return (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
                        >
                          <span>{type}</span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const params = new URLSearchParams(searchParams.toString());
                              const current = params.get("workType")?.split(",").filter(Boolean) || [];
                              const updated = e.target.checked
                                ? [...current, type]
                                : current.filter((t) => t !== type);
                              if (updated.length > 0) {
                                params.set("workType", updated.join(","));
                              } else {
                                params.delete("workType");
                              }
                              router.push(`/app/transaction-services?${params.toString()}`);
                              router.refresh();
                            }}
                            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Markets Covered</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableMarkets.map((market) => {
                      const selected = searchParams.get("market")?.split(",").includes(market) || false;
                      return (
                        <label
                          key={market}
                          className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
                        >
                          <span>{market}</span>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const params = new URLSearchParams(searchParams.toString());
                              const current = params.get("market")?.split(",").filter(Boolean) || [];
                              const updated = e.target.checked
                                ? [...current, market]
                                : current.filter((m) => m !== market);
                              if (updated.length > 0) {
                                params.set("market", updated.join(","));
                              } else {
                                params.delete("market");
                              }
                              router.push(`/app/transaction-services?${params.toString()}`);
                              router.refresh();
                            }}
                            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Verification</h3>
                  <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700">
                    <div>
                      <p className="font-medium">Verified Only</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Show only vetted partners</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={searchParams.get("verified") === "true"}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (e.target.checked) {
                          params.set("verified", "true");
                        } else {
                          params.delete("verified");
                        }
                        router.push(`/app/transaction-services?${params.toString()}`);
                        router.refresh();
                      }}
                      className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {isOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>

        <div className="flex-1 w-full">
          <FilterTags searchParams={searchParams} onRemoveFilters={handleRemoveFilters} />

          {activeVendors.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white/40 p-16 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900/40">
              <div className="text-4xl mb-4 opacity-50">🔍</div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No services matched your search</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 sm:grid-cols-2 ${isOpen ? "xl:grid-cols-2" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
              {activeVendors.map((service) => (
                <VendorCard key={service.id} vendor={service} verifiedLabel="Verified Partner" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
