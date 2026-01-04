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
          className="group inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          <span>
            {filter.label}: {filter.value}
          </span>
          <svg
            className="h-3 w-3 opacity-70 group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [exactBedrooms, setExactBedrooms] = useState(searchParams.get("exactBedrooms") === "true");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "");
  const [exactBathrooms, setExactBathrooms] = useState(searchParams.get("exactBathrooms") === "true");
  const [minSqFt, setMinSqFt] = useState(searchParams.get("minSqFt") || "");
  const [maxSqFt, setMaxSqFt] = useState(searchParams.get("maxSqFt") || "");
  const [minLotSize, setMinLotSize] = useState(searchParams.get("minLotSize") || "");
  const [maxLotSize, setMaxLotSize] = useState(searchParams.get("maxLotSize") || "");
  const [dealType, setDealType] = useState<DealType>((searchParams.get("dealType") as DealType) || "");
  const [minEntryPrice, setMinEntryPrice] = useState(searchParams.get("minEntryPrice") || "");
  const [maxEntryPrice, setMaxEntryPrice] = useState(searchParams.get("maxEntryPrice") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [zipcode, setZipcode] = useState(searchParams.get("zipcode") || "");

  // Sync state with URL params
  useEffect(() => {
    setBedrooms(searchParams.get("bedrooms") || "");
    setExactBedrooms(searchParams.get("exactBedrooms") === "true");
    setBathrooms(searchParams.get("bathrooms") || "");
    setExactBathrooms(searchParams.get("exactBathrooms") === "true");
    setMinSqFt(searchParams.get("minSqFt") || "");
    setMaxSqFt(searchParams.get("maxSqFt") || "");
    setMinLotSize(searchParams.get("minLotSize") || "");
    setMaxLotSize(searchParams.get("maxLotSize") || "");
    setDealType((searchParams.get("dealType") as DealType) || "");
    setMinEntryPrice(searchParams.get("minEntryPrice") || "");
    setMaxEntryPrice(searchParams.get("maxEntryPrice") || "");
    setCity(searchParams.get("city") || "");
    setZipcode(searchParams.get("zipcode") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (bedrooms) {
      params.set("bedrooms", bedrooms);
      if (exactBedrooms) params.set("exactBedrooms", "true");
    }
    if (bathrooms) {
      params.set("bathrooms", bathrooms);
      if (exactBathrooms) params.set("exactBathrooms", "true");
    }
    if (minSqFt) params.set("minSqFt", minSqFt);
    if (maxSqFt) params.set("maxSqFt", maxSqFt);
    if (minLotSize) params.set("minLotSize", minLotSize);
    if (maxLotSize) params.set("maxLotSize", maxLotSize);
    if (dealType) params.set("dealType", dealType);
    if (minEntryPrice) params.set("minEntryPrice", minEntryPrice);
    if (maxEntryPrice) params.set("maxEntryPrice", maxEntryPrice);
    if (city) params.set("city", city);
    if (zipcode) params.set("zipcode", zipcode);

    router.push(`/app/deals?${params.toString()}`);
    router.refresh(); // Force server components to refetch with new params
  };

  const clearFilters = () => {
    setBedrooms("");
    setExactBedrooms(false);
    setBathrooms("");
    setExactBathrooms(false);
    setMinSqFt("");
    setMaxSqFt("");
    setMinLotSize("");
    setMaxLotSize("");
    setDealType("");
    setMinEntryPrice("");
    setMaxEntryPrice("");
    setCity("");
    setZipcode("");
    router.push("/app/deals");
    router.refresh(); // Ensure listings update after clearing
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/app/deals?${params.toString()}`);
    router.refresh(); // Keep results in sync when filters are removed
  };

  const hasActiveFilters =
    bedrooms || bathrooms || minSqFt || maxSqFt || minLotSize || maxLotSize || dealType || minEntryPrice || maxEntryPrice || city || zipcode;

  return (
    <>
      {/* Collapsible Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-full w-80 transform border-r border-zinc-200 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 lg:relative lg:z-auto lg:h-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:hidden"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Filters</h2>
              {hasActiveFilters && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Active
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Form */}
          <div className="flex-1 space-y-4">
            {/* Bedrooms */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
              {bedrooms && (
                <label className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exactBedrooms}
                    onChange={(e) => setExactBedrooms(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Exact match</span>
                </label>
              )}
            </div>

            {/* Bathrooms */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="2.5">2.5+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              {bathrooms && (
                <label className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exactBathrooms}
                    onChange={(e) => setExactBathrooms(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Exact match</span>
                </label>
              )}
            </div>

            {/* Square Footage Range */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Square Footage</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minSqFt}
                  onChange={(e) => setMinSqFt(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <input
                  type="number"
                  value={maxSqFt}
                  onChange={(e) => setMaxSqFt(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* Lot Size Range */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Lot Size (acres)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={minLotSize}
                  onChange={(e) => setMinLotSize(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <input
                  type="number"
                  step="0.01"
                  value={maxLotSize}
                  onChange={(e) => setMaxLotSize(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* Deal Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Deal Type</label>
              <select
                value={dealType}
                onChange={(e) => setDealType(e.target.value as DealType)}
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All Types</option>
                <option value="cash_deal">Cash Deal</option>
                <option value="seller_finance">Seller Finance</option>
                <option value="mortgage_takeover">Mortgage Takeover</option>
                <option value="trust_acquisition">Trust Acquisition</option>
              </select>
            </div>

            {/* Buyer Entry Price Range */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Entry Price ($)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minEntryPrice}
                  onChange={(e) => setMinEntryPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <input
                  type="number"
                  value={maxEntryPrice}
                  onChange={(e) => setMaxEntryPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            {/* Zipcode */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Zipcode</label>
              <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Zipcode"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button
                onClick={applyFilters}
                className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
