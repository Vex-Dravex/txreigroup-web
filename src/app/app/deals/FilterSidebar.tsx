"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type DealType = "cash_deal" | "seller_finance" | "mortgage_takeover" | "trust_acquisition" | "";

export type FilterTagsProps = {
  searchParams: URLSearchParams;
  onRemoveFilters: (keys: string[]) => void;
};

export function FilterTags({ searchParams, onRemoveFilters }: FilterTagsProps) {
  const activeFilters: Array<{ key: string; label: string; value: string; removeKeys: string[] }> = [];

  if (searchParams.get("bedrooms")) {
    const isExact = searchParams.get("exactBedrooms") === "true";
    const value = isExact ? `${searchParams.get("bedrooms")}` : `${searchParams.get("bedrooms")}+`;
    activeFilters.push({
      key: "bedrooms",
      label: "Bedrooms",
      value,
      removeKeys: ["bedrooms", "exactBedrooms"]
    });
  }
  if (searchParams.get("bathrooms")) {
    const isExact = searchParams.get("exactBathrooms") === "true";
    const bathroomsValue = searchParams.get("bathrooms") || "";
    const value = isExact ? bathroomsValue : `${bathroomsValue}+`;
    activeFilters.push({
      key: "bathrooms",
      label: "Bathrooms",
      value,
      removeKeys: ["bathrooms", "exactBathrooms"]
    });
  }
  if (searchParams.get("minSqFt") || searchParams.get("maxSqFt")) {
    const min = searchParams.get("minSqFt") || "";
    const max = searchParams.get("maxSqFt") || "";
    let value = "";
    if (min && max) value = `${parseInt(min).toLocaleString()}-${parseInt(max).toLocaleString()}`;
    else if (min) value = `${parseInt(min).toLocaleString()}+`;
    else if (max) value = `Up to ${parseInt(max).toLocaleString()}`;
    activeFilters.push({ key: "sqft", label: "Sq Ft", value, removeKeys: ["minSqFt", "maxSqFt"] });
  }
  if (searchParams.get("minLotSize") || searchParams.get("maxLotSize")) {
    const min = searchParams.get("minLotSize") || "";
    const max = searchParams.get("maxLotSize") || "";
    let value = "";
    if (min && max) value = `${parseFloat(min)}-${parseFloat(max)} acres`;
    else if (min) value = `${parseFloat(min)}+ acres`;
    else if (max) value = `Up to ${parseFloat(max)} acres`;
    activeFilters.push({ key: "lotsize", label: "Lot Size", value, removeKeys: ["minLotSize", "maxLotSize"] });
  }
  if (searchParams.get("dealType")) {
    const dealTypeLabels: Record<string, string> = {
      cash_deal: "Cash Deal",
      seller_finance: "Seller Finance",
      mortgage_takeover: "Mortgage Takeover",
      trust_acquisition: "Trust Acquisition",
    };
    activeFilters.push({
      key: "dealType",
      label: "Deal Type",
      value: dealTypeLabels[searchParams.get("dealType") || ""] || searchParams.get("dealType") || "",
      removeKeys: ["dealType"],
    });
  }
  if (searchParams.get("minEntryPrice") || searchParams.get("maxEntryPrice")) {
    const min = searchParams.get("minEntryPrice") || "";
    const max = searchParams.get("maxEntryPrice") || "";
    let value = "";
    if (min && max) value = `$${parseInt(min).toLocaleString()}-$${parseInt(max).toLocaleString()}`;
    else if (min) value = `$${parseInt(min).toLocaleString()}+`;
    else if (max) value = `Up to $${parseInt(max).toLocaleString()}`;
    activeFilters.push({ key: "entryprice", label: "Entry Price", value, removeKeys: ["minEntryPrice", "maxEntryPrice"] });
  }
  if (searchParams.get("city")) {
    activeFilters.push({ key: "city", label: "City", value: searchParams.get("city") || "", removeKeys: ["city"] });
  }
  if (searchParams.get("zipcode")) {
    activeFilters.push({ key: "zipcode", label: "Zipcode", value: searchParams.get("zipcode") || "", removeKeys: ["zipcode"] });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => {
            onRemoveFilters(filter.removeKeys);
          }}
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

type FilterSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Decompose searchParams into stable values for dependency tracking
  const paramBedrooms = searchParams.get("bedrooms") || "";
  const paramExactBedrooms = searchParams.get("exactBedrooms") === "true";
  const paramBathrooms = searchParams.get("bathrooms") || "";
  const paramExactBathrooms = searchParams.get("exactBathrooms") === "true";
  const paramMinSqFt = searchParams.get("minSqFt") || "";
  const paramMaxSqFt = searchParams.get("maxSqFt") || "";
  const paramMinLotSize = searchParams.get("minLotSize") || "";
  const paramMaxLotSize = searchParams.get("maxLotSize") || "";
  const paramDealType = (searchParams.get("dealType") as DealType) || "";
  const paramMinEntryPrice = searchParams.get("minEntryPrice") || "";
  const paramMaxEntryPrice = searchParams.get("maxEntryPrice") || "";
  const paramCity = searchParams.get("city") || "";
  const paramZipcode = searchParams.get("zipcode") || "";

  const [bedrooms, setBedrooms] = useState(paramBedrooms);
  const [exactBedrooms, setExactBedrooms] = useState(paramExactBedrooms);
  const [bathrooms, setBathrooms] = useState(paramBathrooms);
  const [exactBathrooms, setExactBathrooms] = useState(paramExactBathrooms);
  const [minSqFt, setMinSqFt] = useState(paramMinSqFt);
  const [maxSqFt, setMaxSqFt] = useState(paramMaxSqFt);
  const [minLotSize, setMinLotSize] = useState(paramMinLotSize);
  const [maxLotSize, setMaxLotSize] = useState(paramMaxLotSize);
  const [dealType, setDealType] = useState<DealType>(paramDealType);
  const [minEntryPrice, setMinEntryPrice] = useState(paramMinEntryPrice);
  const [maxEntryPrice, setMaxEntryPrice] = useState(paramMaxEntryPrice);
  const [city, setCity] = useState(paramCity);
  const [zipcode, setZipcode] = useState(paramZipcode);

  // Sync state with URL params ONLY when specific values change
  useEffect(() => {
    setBedrooms(paramBedrooms);
    setExactBedrooms(paramExactBedrooms);
    setBathrooms(paramBathrooms);
    setExactBathrooms(paramExactBathrooms);
    setMinSqFt(paramMinSqFt);
    setMaxSqFt(paramMaxSqFt);
    setMinLotSize(paramMinLotSize);
    setMaxLotSize(paramMaxLotSize);
    setDealType(paramDealType);
    setMinEntryPrice(paramMinEntryPrice);
    setMaxEntryPrice(paramMaxEntryPrice);
    setCity(paramCity);
    setZipcode(paramZipcode);
  }, [
    paramBedrooms,
    paramExactBedrooms,
    paramBathrooms,
    paramExactBathrooms,
    paramMinSqFt,
    paramMaxSqFt,
    paramMinLotSize,
    paramMaxLotSize,
    paramDealType,
    paramMinEntryPrice,
    paramMaxEntryPrice,
    paramCity,
    paramZipcode,
  ]);

  const applyFilters = () => {
    // Start with current params to preserve other filters (like search)
    const params = new URLSearchParams(searchParams.toString());

    // Helper to conditionally set or delete params
    const updateParam = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    updateParam("bedrooms", bedrooms);
    if (bedrooms && exactBedrooms) params.set("exactBedrooms", "true");
    else params.delete("exactBedrooms");

    updateParam("bathrooms", bathrooms);
    if (bathrooms && exactBathrooms) params.set("exactBathrooms", "true");
    else params.delete("exactBathrooms");

    updateParam("minSqFt", minSqFt);
    updateParam("maxSqFt", maxSqFt);
    updateParam("minLotSize", minLotSize);
    updateParam("maxLotSize", maxLotSize);
    updateParam("dealType", dealType);
    updateParam("minEntryPrice", minEntryPrice);
    updateParam("maxEntryPrice", maxEntryPrice);
    updateParam("city", city);
    updateParam("zipcode", zipcode);

    router.push(`/app/deals?${params.toString()}`);
    router.refresh(); // Ensure server components re-fetch data
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const keysToClear = [
      "bedrooms", "exactBedrooms", "bathrooms", "exactBathrooms",
      "minSqFt", "maxSqFt", "minLotSize", "maxLotSize",
      "dealType", "minEntryPrice", "maxEntryPrice", "city", "zipcode"
    ];
    keysToClear.forEach(k => params.delete(k));

    router.push(`/app/deals?${params.toString()}`);
    router.refresh();
  };

  const hasActiveFilters =
    bedrooms || bathrooms || minSqFt || maxSqFt || minLotSize || maxLotSize || dealType || minEntryPrice || maxEntryPrice || city || zipcode;

  return (
    <>
      {/* Collapsible Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-80 transform bg-white/80 backdrop-blur-xl shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) dark:bg-zinc-950/80 lg:sticky lg:top-8 lg:z-auto lg:h-fit lg:transform-none lg:rounded-[2rem] lg:border lg:border-zinc-200 lg:shadow-xl lg:dark:border-zinc-800 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-5 lg:p-8 lg:h-auto lg:overflow-visible">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 font-syne italic">Filters</h2>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Filter Groups */}
          <div className="space-y-6">

            {/* Property Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Property</h3>

              {/* Bedrooms & Bathrooms Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Bathrooms</label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 px-1">
                {bedrooms && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exactBedrooms}
                      onChange={(e) => setExactBedrooms(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Exact Beds</span>
                  </label>
                )}
                {bathrooms && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exactBathrooms}
                      onChange={(e) => setExactBathrooms(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Exact Baths</span>
                  </label>
                )}
              </div>

              {/* Square Footage */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Square Feet</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minSqFt}
                    onChange={(e) => setMinSqFt(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <span className="text-zinc-400">-</span>
                  <input
                    type="number"
                    value={maxSqFt}
                    onChange={(e) => setMaxSqFt(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>

              {/* Lot Size */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Lot Size (Acres)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={minLotSize}
                    onChange={(e) => setMinLotSize(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <span className="text-zinc-400">-</span>
                  <input
                    type="number"
                    step="0.01"
                    value={maxLotSize}
                    onChange={(e) => setMaxLotSize(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>

            {/* Financials Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Financials</h3>

              {/* Deal Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Deal Type</label>
                <select
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value as DealType)}
                  className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="">All Types</option>
                  <option value="cash_deal">Cash Deal</option>
                  <option value="seller_finance">Seller Finance</option>
                  <option value="mortgage_takeover">Mortgage Takeover</option>
                  <option value="trust_acquisition">Trust Acquisition</option>
                </select>
              </div>

              {/* Buyer Entry Price */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Entry Cost ($)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minEntryPrice}
                    onChange={(e) => setMinEntryPrice(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <span className="text-zinc-400">-</span>
                  <input
                    type="number"
                    value={maxEntryPrice}
                    onChange={(e) => setMaxEntryPrice(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800"></div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Location</h3>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Zipcode</label>
                <input
                  type="text"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  placeholder="Enter zipcode"
                  className="w-full rounded-lg border-zinc-200 bg-zinc-50 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4">
              <button
                onClick={applyFilters}
                className="group relative w-full overflow-hidden rounded-2xl bg-zinc-950 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950"
              >
                <span className="relative z-10">Show Results</span>
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
