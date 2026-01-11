"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ServiceFiltersProps = {
  availableWorkTypes: string[];
  availableMarkets: string[];
  children: React.ReactNode;
};

function parseListParam(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ServiceFilters({
  availableWorkTypes,
  availableMarkets,
  children,
}: ServiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = "/app/transaction-services";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(
    parseListParam(searchParams.get("workType"))
  );
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(
    parseListParam(searchParams.get("market"))
  );
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSelectedWorkTypes(parseListParam(searchParams.get("workType")));
    setSelectedMarkets(parseListParam(searchParams.get("market")));
    setVerifiedOnly(searchParams.get("verified") === "true");
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const pushFilters = ({
    workTypes,
    markets,
    verified,
    query,
  }: {
    workTypes: string[];
    markets: string[];
    verified: boolean;
    query: string;
  }) => {
    const params = new URLSearchParams();
    if (workTypes.length) params.set("workType", workTypes.join(","));
    if (markets.length) params.set("market", markets.join(","));
    if (verified) params.set("verified", "true");
    if (query.trim()) params.set("q", query.trim());

    const queryString = params.toString();
    const path = queryString ? `${basePath}?${queryString}` : basePath;
    router.push(path);
    router.refresh();
  };

  const applyFilters = () => {
    pushFilters({
      workTypes: selectedWorkTypes,
      markets: selectedMarkets,
      verified: verifiedOnly,
      query: searchTerm,
    });
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const clearFilters = () => {
    setSelectedWorkTypes([]);
    setSelectedMarkets([]);
    setVerifiedOnly(false);
    setSearchTerm("");
    router.push(basePath);
    router.refresh();
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleWorkTypeToggle = (type: string) => {
    const next = selectedWorkTypes.includes(type)
      ? selectedWorkTypes.filter((t) => t !== type)
      : [...selectedWorkTypes, type];
    setSelectedWorkTypes(next);
    pushFilters({ workTypes: next, markets: selectedMarkets, verified: verifiedOnly, query: searchTerm });
  };

  const handleMarketToggle = (market: string) => {
    const next = selectedMarkets.includes(market)
      ? selectedMarkets.filter((m) => m !== market)
      : [...selectedMarkets, market];
    setSelectedMarkets(next);
    pushFilters({ workTypes: selectedWorkTypes, markets: next, verified: verifiedOnly, query: searchTerm });
  };

  const activeFilters: Array<{ label: string; value: string; onRemove: () => void }> = [];

  selectedWorkTypes.forEach((type) => {
    activeFilters.push({
      label: "Service",
      value: type,
      onRemove: () => handleWorkTypeToggle(type),
    });
  });

  selectedMarkets.forEach((market) => {
    activeFilters.push({
      label: "Market",
      value: market,
      onRemove: () => handleMarketToggle(market),
    });
  });

  if (verifiedOnly) {
    activeFilters.push({
      label: "Verification",
      value: "Verified only",
      onRemove: () => {
        setVerifiedOnly(false);
        pushFilters({ workTypes: selectedWorkTypes, markets: selectedMarkets, verified: false, query: searchTerm });
      },
    });
  }

  if (searchTerm.trim()) {
    activeFilters.push({
      label: "Search",
      value: searchTerm.trim(),
      onRemove: () => {
        setSearchTerm("");
        pushFilters({ workTypes: selectedWorkTypes, markets: selectedMarkets, verified: verifiedOnly, query: "" });
      },
    });
  }

  const activeCount = activeFilters.length;

  const gridCols = isOpen ? "lg:grid-cols-[320px,1fr]" : "lg:grid-cols-1";

  const renderFilterForm = (variant: "sidebar" | "drawer") => (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Service type</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {availableWorkTypes.map((type) => {
            const checked = selectedWorkTypes.includes(type);
            return (
              <label
                key={type}
                className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
              >
                <span>{type}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  checked={checked}
                  onChange={() => handleWorkTypeToggle(type)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Markets covered</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {availableMarkets.map((market) => {
            const checked = selectedMarkets.includes(market);
            return (
              <label
                key={market}
                className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-700"
              >
                <span>{market}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                  checked={checked}
                  onChange={() => handleMarketToggle(market)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Only verified partners</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Focus on teams we&apos;ve already vetted for investors.
          </p>
        </div>
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          checked={verifiedOnly}
          onChange={(e) => {
            setVerifiedOnly(e.target.checked);
            pushFilters({
              workTypes: selectedWorkTypes,
              markets: selectedMarkets,
              verified: e.target.checked,
              query: searchTerm,
            });
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Apply filters
        </button>
        <button
          onClick={clearFilters}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Reset
        </button>
      </div>

      {variant === "drawer" && (
        <button
          onClick={() => setIsOpen(false)}
          className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Close panel
        </button>
      )}
    </div>
  );

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {isOpen && (
        <div className="hidden lg:block">
          <div className="rounded-xl border border-zinc-200 bg-white/70 p-5 shadow-sm ring-1 ring-inset ring-white/40 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70 dark:ring-black/40">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Filter services</p>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                {activeCount} active
              </span>
            </div>
            {renderFilterForm("sidebar")}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5.25C3 4.56 3.56 4 4.25 4h11.5C16.44 4 17 4.56 17 5.25s-.56 1.25-1.25 1.25H4.25C3.56 6.5 3 5.94 3 5.25Zm3 4.75c0-.69.56-1.25 1.25-1.25h7.5c.69 0 1.25.56 1.25 1.25S15.44 11.25 14.75 11.25h-7.5C6.56 11.25 6 10.69 6 10Zm3 4.75c0-.69.56-1.25 1.25-1.25h3.5c.69 0 1.25.56 1.25 1.25S14.44 16.75 13.75 16.75h-3.5C9.56 16.75 9 16.19 9 15.5Z" />
            </svg>
            {isOpen ? "Hide filters" : "Filters"}
            {activeCount > 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{activeCount}</span>}
          </button>

          <div className="relative min-w-[240px] flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              placeholder="Search by company, service, or market"
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.5 3a5.5 5.5 0 1 0 3.154 10.01l3.168 3.168a.75.75 0 1 0 1.06-1.06l-3.168-3.169A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Update results
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Clear
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                key={`${filter.label}-${filter.value}`}
                onClick={filter.onRemove}
                className="group inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
              >
                <span className="text-blue-800 dark:text-blue-100">
                  {filter.label}: {filter.value}
                </span>
                <svg
                  className="h-3 w-3 text-blue-600 opacity-70 transition group-hover:opacity-100 dark:text-blue-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="flex-1 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Filter services</p>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            {renderFilterForm("drawer")}
          </div>
        </div>
      )}
    </div>
  );
}
