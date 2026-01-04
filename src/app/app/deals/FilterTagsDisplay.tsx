"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FilterTags } from "./FilterSidebar";

export default function FilterTagsDisplay() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeFilters = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((key) => params.delete(key));
    // Only push if there are still params, otherwise go to base URL
    const newUrl = params.toString() ? `/app/deals?${params.toString()}` : "/app/deals";
    router.push(newUrl);
    router.refresh(); // Ensure server-rendered listings match the updated filters
  };

  return <FilterTags searchParams={searchParams} onRemoveFilters={removeFilters} />;
}
