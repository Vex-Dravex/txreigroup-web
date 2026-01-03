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
      className="flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span>{isOpen ? "Hide Filters" : "Filters"}</span>
      {activeFilterCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

