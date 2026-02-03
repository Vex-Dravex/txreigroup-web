"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type DealType = "cash_deal" | "seller_finance" | "mortgage_takeover" | "trust_acquisition" | "";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "");
  const [minSqFt, setMinSqFt] = useState(searchParams.get("minSqFt") || "");
  const [maxSqFt, setMaxSqFt] = useState(searchParams.get("maxSqFt") || "");
  const [minLotSize, setMinLotSize] = useState(searchParams.get("minLotSize") || "");
  const [maxLotSize, setMaxLotSize] = useState(searchParams.get("maxLotSize") || "");
  const [dealType, setDealType] = useState<DealType>((searchParams.get("dealType") as DealType) || "");
  const [minEntryPrice, setMinEntryPrice] = useState(searchParams.get("minEntryPrice") || "");
  const [maxEntryPrice, setMaxEntryPrice] = useState(searchParams.get("maxEntryPrice") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [zipcode, setZipcode] = useState(searchParams.get("zipcode") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);
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
  };

  const clearFilters = () => {
    setBedrooms("");
    setBathrooms("");
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
  };

  const hasActiveFilters = 
    bedrooms || bathrooms || minSqFt || maxSqFt || minLotSize || maxLotSize || 
    dealType || minEntryPrice || maxEntryPrice || city || zipcode;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Filters</h2>
          {hasActiveFilters && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Bedrooms */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bedrooms
          </label>
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
        </div>

        {/* Bathrooms */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bathrooms
          </label>
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
        </div>

        {/* Square Footage Range */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Min Sq Ft
          </label>
          <input
            type="number"
            value={minSqFt}
            onChange={(e) => setMinSqFt(e.target.value)}
            placeholder="Min"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Max Sq Ft
          </label>
          <input
            type="number"
            value={maxSqFt}
            onChange={(e) => setMaxSqFt(e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Lot Size Range */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Min Lot Size (acres)
          </label>
          <input
            type="number"
            step="0.01"
            value={minLotSize}
            onChange={(e) => setMinLotSize(e.target.value)}
            placeholder="Min"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Max Lot Size (acres)
          </label>
          <input
            type="number"
            step="0.01"
            value={maxLotSize}
            onChange={(e) => setMaxLotSize(e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* Deal Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Deal Type
          </label>
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
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Min Entry Price ($)
          </label>
          <input
            type="number"
            value={minEntryPrice}
            onChange={(e) => setMinEntryPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Max Entry Price ($)
          </label>
          <input
            type="number"
            value={maxEntryPrice}
            onChange={(e) => setMaxEntryPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            City
          </label>
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
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Zipcode
          </label>
          <input
            type="text"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            placeholder="Zipcode"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={applyFilters}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Apply Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

