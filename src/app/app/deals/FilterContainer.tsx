"use client";

import { useState, Suspense, createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "./FilterSidebar";
import FilterToggle from "./FilterToggle";

// Create context to share filter state
const FilterContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null>(null);

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return context;
}

// Hook to check if filters are open (for adjusting grid layout)
export function useFilterIsOpen() {
  const context = useContext(FilterContext);
  return context?.isOpen ?? false;
}

function FilterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return <FilterContext.Provider value={{ isOpen, setIsOpen }}>{children}</FilterContext.Provider>;
}

export function FilterToggleButton() {
  const searchParams = useSearchParams();
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error("FilterToggleButton must be used within FilterProvider");
  }
  
  const { isOpen, setIsOpen } = context;

  // Count active filters
  const activeFilterCount = Array.from(searchParams.keys()).filter((k) => searchParams.get(k)).length;

  return (
    <FilterToggle
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      activeFilterCount={activeFilterCount}
    />
  );
}

export function FilterSidebarWrapper() {
  const context = useContext(FilterContext);
  
  if (!context) {
    throw new Error("FilterSidebarWrapper must be used within FilterProvider");
  }
  
  const { isOpen, setIsOpen } = context;

  return (
    <Suspense
      fallback={
        <div className="hidden lg:block w-80 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="h-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      }
    >
      <FilterSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </Suspense>
  );
}

export default FilterProvider;

