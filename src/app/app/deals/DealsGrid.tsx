"use client";

import { useFilterIsOpen } from "./FilterContainer";

type DealsGridProps = {
  children: React.ReactNode;
};

export default function DealsGrid({ children }: DealsGridProps) {
  const isFilterOpen = useFilterIsOpen();

  // Adjust grid columns based on filter sidebar state
  // When sidebar is open, use fewer columns to maintain image aspect ratio
  // This prevents image compression when the sidebar takes up space
  const gridClasses = isFilterOpen
    ? "grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
    : "grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  return <div className={gridClasses}>{children}</div>;
}

