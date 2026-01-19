"use client";

import { useState } from "react";

type FilterToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterCount: number;
};

export default function FilterToggle({ isOpen, onToggle, activeFilterCount }: FilterToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 ${isOpen
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
      <span>{isOpen ? "Close Filters" : "Filter Inventory"}</span>
      {activeFilterCount > 0 && (
        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black ${isOpen ? "bg-white text-blue-600" : "bg-blue-600 text-white"
          }`}>
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}


